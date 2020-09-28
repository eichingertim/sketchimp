var grid = document.querySelector(".cards"),
    navBar = document.querySelector(".navigation-top"),
    topContainer = document.querySelector(".banner-content"),
msnry = new Masonry(grid, {
    itemSelector: ".card",
    columnWidth: 150,
    fitWidth: true,
});
imagesLoaded(grid).on("progress", function() {
    msnry.layout();
});

window.onscroll = function() {
  if (document.body.scrollTop >= topContainer.offsetHeight - 30 || document.documentElement.scrollTop >= topContainer.offsetHeight - 30) {
    navBar.classList.add("scroll");
  } else {
    navBar.classList.remove("scroll");
  }
};