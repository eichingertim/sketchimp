let profileImageOverlay,
    profileUpload,
    selectedFile,
    uploadButtton;

function init() {
    profileImageOverlay = document.querySelector(".profile-image-overlay");
    profileUpload = document.querySelector("#profile-upload");
    selectedFile = document.querySelector("#selected-file");
    uploadButtton = document.querySelector("#btn-upload-profile");

    profileImageOverlay.addEventListener("click", () => {
        profileUpload.click();
    });

    profileUpload.addEventListener("change", (event) => {
        selectedFile.innerHTML = event.target.value;
        uploadButtton.style.visibility = "visible";
    });
}

init();