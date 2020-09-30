var grid = document.querySelector(".cards"),
    navBar = document.querySelector(".navigation-top"),
    topContainer = document.querySelector(".banner-content");

    /*msnry = new Masonry(grid, {
    itemSelector: ".card",
    columnWidth: 150,
    fitWidth: true,
});

imagesLoaded(grid).on("progress", function() {
    msnry.layout();
});*/

window.onscroll = function() {
  if (document.body.scrollTop >= topContainer.offsetHeight || document.documentElement.scrollTop >= topContainer.offsetHeight) {
    navBar.classList.add("scroll");
  } else {
    navBar.classList.remove("scroll");
  }
};