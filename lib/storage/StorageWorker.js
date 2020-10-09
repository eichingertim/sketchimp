/* eslint-env node */

const _ = require("lodash"),
 multer = require("multer"),
 fs = require("fs"),
 path = require("path"),
 Jimp = require("jimp"),
 crypto = require("crypto"),
 mkdirp = require("mkdirp"),
 concat = require("concat-stream"),
 streamifier = require("streamifier"),
 Constants = require("../config/Constants"),

/**
 * Bundles all necessary Storage Functions and Members into a file to serve as a single dependency
 */

joinUploadPath = function(uploadPath) {
    return path.resolve(__dirname, "..", uploadPath);
},
AppStorage = function(options, optionBaseUrl, optionPath) {

    function AppStorage(opts) {
        var baseUrl = optionBaseUrl,
            allowedStorageSystems = ["local"],
            allowedOutputFormats = ["jpg", "png"],
            defaultOptions = {
                storage: "local",
                output: "png",
                greyscale: false,
                quality: 70,
                square: true,
                threshold: 200,
                responsive: false,
            },
            options = (opts && _.isObject(opts)) ? _.pick(opts, _.keys(defaultOptions)) : {};
            options = _.extend(defaultOptions, options);
            this.options = _.forIn(options, function(value, key, object) {
                let overwriteValue;
                switch (key) {
                    case "square":
                    case "greyscale":
                    case "responsive":
                        object[key] = _.isBoolean(value) ? value : defaultOptions[key];
                        break;

                    case "storage":
                        overwriteValue = String(value).toLowerCase();
                        object[key] = _.includes(allowedStorageSystems, overwriteValue) ? overwriteValue : defaultOptions[key];
                        break;

                    case "output":
                        overwriteValue = String(value).toLowerCase();
                        object[key] = _.includes(allowedOutputFormats, overwriteValue) ? overwriteValue : defaultOptions[key];
                        break;

                    case "quality":
                        overwriteValue = _.isFinite(value) ? value : Number(value);
                        object[key] = (overwriteValue && overwriteValue >= 0 && overwriteValue <= Constants.UPLOAD.MAX_QUALITY) ? overwriteValue : defaultOptions[key];
                        break;

                    case "threshold":
                        overwriteValue = _.isFinite(value) ? value : Number(value);
                        object[key] = (overwriteValue && overwriteValue >= 0) ? overwriteValue : defaultOptions[key];
                        break;

                    default:
                        break;
                }
            });

            this.uploadPath = this.options.responsive ? path.join(optionPath, "responsive") : optionPath;
            this.uploadBaseUrl = this.options.responsive ? path.join(baseUrl, "responsive") : baseUrl;
            if (this.options.storage === "local") {
                return !fs.existsSync(this.uploadPath) && mkdirp.sync(this.uploadPath);
            }
    }

    AppStorage.prototype._generateRandomFilename = function() {
        let bytes = crypto.pseudoRandomBytes(Constants.UPLOAD.RANDOM_BYTES),
            checksum = crypto.createHash("MD5").update(bytes).digest("hex");
        return checksum + "." + this.options.output;
    };

    AppStorage.prototype._createOutputStream = function(filepath, cb) {
        let that = this,
            output = fs.createWriteStream(filepath);
        output.on("finish", () => {
            cb(null, {
                destination: that.uploadPath,
                baseUrl: that.uploadBaseUrl,
                filename: path.basename(filepath),
                storage: that.options.storage,
            });
        });
        return output;
    };

    AppStorage.prototype._processImage = function(image, cb) {
        let that = this,
            batch = [],
            sizes = ["lg", "md", "sm"],
            filename = this._generateRandomFilename(),
            mime = Jimp.MIME_PNG,
            clone = image.clone(),
            width = clone.bitmap.width,
            height = clone.bitmap.height,
            square = Math.min(width, height),
            threshold = this.options.threshold;
        switch (this.options.output) {
            case "jpg":
                mime = Jimp.MIME_JPEG;
                break;
            case "png":
            default:
                mime = Jimp.MIME_PNG;
                break;
        }
        if (threshold && square > threshold) {
            clone = (square === width) ? clone.resize(threshold, Jimp.AUTO) : clone.resize(Jimp.AUTO, threshold);
        }
        if (this.options.square) {
            if (threshold) {
                square = Math.min(square, threshold);
            }
            clone = clone.crop((clone.bitmap.width % square) / Constants.UPLOAD.DIVIDER, (clone.bitmap.height % square) / Constants.UPLOAD.DIVIDER, square, square);
        }
        if (this.options.greyscale) {
            clone = clone.greyscale();
        }
        clone = clone.quality(this.options.quality);
        if (this.options.responsive) {
            batch = _.map(sizes, (size) => {
                let outputStream,
                    image = null,
                    filepath = filename.split(".");
                filepath = filepath[0] + "_" + size + "." + filepath[1];
                filepath = path.join(that.uploadPath, filepath);
                outputStream = that._createOutputStream(filepath, cb);
                switch (size) {
                    case "sm":
                        image = clone.clone().scale(Constants.UPLOAD.LOW_QUALITY);
                        break;
                    case "md":
                        image = clone.clone().scale(Constants.UPLOAD.MEDIUM_QUALITY);
                        break;
                    case "lg":
                        image = clone.clone();
                        break;
                    default:
                        break;
                }
                return {
                    stream: outputStream,
                    image: image,
                };
            });
        } else {
            batch.push({
                stream: that._createOutputStream(path.join(that.uploadPath, filename), cb),
                image: clone,
            });
        }
        _.each(batch, (current) => {
            current.image.getBuffer(mime, (err, buffer) => {
                if (that.options.storage === "local") {
                    streamifier.createReadStream(buffer).pipe(current.stream);
                }
            });
        });
    };

    AppStorage.prototype._handleFile = function(req, file, cb) {
        let that = this,
            fileManipulate = concat((imageData) => {
                Jimp.read(imageData).then((image) => {
                    that._processImage(image, cb);
                })
                .catch(cb);
            });
        file.stream.pipe(fileManipulate);
    };

    AppStorage.prototype._removeFile = function(req, file, cb) {
        let matches,
            pathsplit,
            filename = file.filename,
            _path = path.join(this.uploadPath, filename),
            paths = [];
        delete file.filename;
        delete file.destination;
        delete file.baseUrl;
        delete file.storage;
        if (this.options.responsive) {
            pathsplit = _path.split("/");
            matches = pathsplit.pop().match(/^(.+?)_.+?\.(.+)$/i);
            if (matches) {
                paths = _.map(["lg", "md", "sm"], (size) => {
                    return pathsplit.join("/") + "/" + (matches[1] + "_" + size + "." + matches[2]);
                });
            }
        } else {
            paths = [_path];
        }
        _.each(paths, (_path) => {
            fs.unlink(_path, cb);
        });
    };

    return new AppStorage(options);
},

iconFilter = function(req, file, cb) {
    let allowedMimes = ["image/jpeg", "image/pjpeg", "image/png", "image/gif"];
    if (_.includes(allowedMimes, file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only jpg, png and gif image files are allowed."));
    }
},

sketchFilter = function(req, file, cb) {
    let allowedMimes = ["image/png"];
    if (_.includes(allowedMimes, file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only png image files are allowed."));
    }
};

/**
 * Provides a class that exposes two preconfigured upload strategies
 * uses the multer module
 */

class StorageWorker {
    constructor() {
        this.AvatarStorage = AppStorage(Constants.UPLOAD.OPTIONS.ICON, 
            Constants.UPLOAD.AVATAR.BASE_URL, 
            joinUploadPath(Constants.UPLOAD.AVATAR.STORAGE));
        this.SketchStorage = AppStorage(Constants.UPLOAD.OPTIONS.SKETCH, 
            Constants.UPLOAD.SKETCH.BASE_URL,
            Constants.UPLOAD.SKETCH.STORAGE);
        this.iconFilter = iconFilter;
        this.sketchFilter = sketchFilter;
        this.uploadIcon = multer({
            storage: this.AvatarStorage,
            limits: {
                files: 1,
                fileSize: Constants.UPLOAD.AVATAR.MAX_FILE_SIZE,
            },
            fileFilter: this.iconFilter,
        });
        this.uploadSketch = multer({
            storage: this.SketchStorage,
            limits: {
                files: 1,
                fileSize: Constants.UPLOAD.SKETCH.MAX_FILE_SIZE,
            },
            fileFilter: this.sketchFilter,
        });
    }
}

module.exports = new StorageWorker();