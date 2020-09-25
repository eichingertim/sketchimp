/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

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
                switch (key) {
                    case "square":
                    case "greyscale":
                    case "responsive":
                        object[key] = _.isBoolean(value) ? value : defaultOptions[key];
                        break;

                    case "storage":
                        value = String(value).toLowerCase();
                        object[key] = _.includes(allowedStorageSystems, value) ? value : defaultOptions[key];
                        break;

                    case "output":
                        value = String(value).toLowerCase();
                        object[key] = _.includes(allowedOutputFormats, value) ? value : defaultOptions[key];
                        break;

                    case "quality":
                        value = _.isFinite(value) ? value : Number(value);
                        object[key] = (value && value >= 0 && value <= 100) ? value : defaultOptions[key];
                        break;

                    case "threshold":
                        value = _.isFinite(value) ? value : Number(value);
                        object[key] = (value && value >= 0) ? value : defaultOptions[key];
                        break;

                    default:
                        break;
                }
            });

            this.uploadPath = this.options.responsive ? path.join(optionPath, "responsive") : optionPath;
            this.uploadBaseUrl = this.options.responsive ? path.join(baseUrl, "responsive") : baseUrl;
            if (this.options.storage === "local") {
                !fs.existsSync(this.uploadPath) && mkdirp.sync(this.uploadPath);
            }
    }

    AppStorage.prototype._generateRandomFilename = function() {
        let bytes = crypto.pseudoRandomBytes(32),
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
            clone = clone.crop((clone.bitmap.width % square) / 2, (clone.bitmap.height % square) / 2, square, square);
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
                        image = clone.clone().scale(0.3);
                        break;
                    case "md":
                        image = clone.clone().scale(0.7);
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