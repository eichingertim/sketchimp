document.querySelector(".profile-image-overlay").addEventListener("click", (event) => {
    document.querySelector("#profile-upload").click();
});

document.querySelector("#profile-upload").addEventListener("change", (event) => {
    document.querySelector("#selected-file").innerHTML = event.target.value;
    document.querySelector("#btn-upload-profile").style.visibility = "visible";
});