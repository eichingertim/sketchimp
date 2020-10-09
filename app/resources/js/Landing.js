import { LandingPageConfigs, NavbarDimensions } from "./utils/Config.js";

// Source: https://codepen.io/tholman/pen/ifDak
// Used for Oil painting hero on the landing page

var app,
    navBar = document.querySelector(".navigation-top"),
    scrollIndicator = document.querySelector(".scroll-indicator"),
    hero = document.querySelector(".hero");

function OilPainting(){
    
    var canvas,
    context,
    width,
    height,
    divider = LandingPageConfigs.DIMENSIONS_DIVIDER,
    startPos = {x: window.innerWidth/divider, y: window.innerHeight/divider},
    prevPos = {x: window.innerWidth/divider, y: 0},
    dist = {x: 0, y: 0},
    colour = "#"+Math.floor(Math.random()*LandingPageConfigs.COLOR_DEPTH).toString(LandingPageConfigs.COLOR_STRING_LENGTH),
    MouseMove = function(e) {
        var distance = Math.sqrt(Math.pow(prevPos.x - startPos.x, divider) +
        Math.pow(prevPos.y - startPos.y, divider)),
        a = distance * LandingPageConfigs.DISTANCE_MULTIPLIER * (Math.pow(Math.random(), divider) - LandingPageConfigs.ANGLE_VALUE),
        r = Math.random() - LandingPageConfigs.ANGLE_VALUE,
        size = (Math.random() * LandingPageConfigs.SIZE_MULTIPLIER) / distance,
        lWidth;
        
        dist.x = (prevPos.x - startPos.x) * Math.sin(LandingPageConfigs.ANGLE_VALUE) + startPos.x;
        dist.y = (prevPos.y - startPos.y) * Math.cos(LandingPageConfigs.ANGLE_VALUE) + startPos.y;
        
        startPos.x = prevPos.x;
        startPos.y = prevPos.y;
        
        prevPos.x = (e.layerX);
        prevPos.y = (e.layerY);
        
        lWidth = (Math.random()+LandingPageConfigs.LINE_WIDTH_MULTIPLIER/LandingPageConfigs.LINE_WIDTH_DIVIDER-LandingPageConfigs.ANGLE_VALUE)*size+
            (1-Math.random()+LandingPageConfigs.LINE_HEIGHT_MULTIPLIER/LandingPageConfigs.LINE_HEIGHT_DIVIDER-LandingPageConfigs.ANGLE_VALUE)*size;
        context.lineWidth = lWidth;
        context.strokeWidth = lWidth * LandingPageConfigs.STROKE_WIDTH_MULTIPLIER;
        
        context.lineCap = "round";
        context.lineJoin = "round";
        
        context.beginPath(); 
        context.moveTo(startPos.x, startPos.y);
        context.quadraticCurveTo(dist.x, dist.y, prevPos.x, prevPos.y);
        
        context.fillStyle = colour;
        context.strokeStyle = colour;
        
        context.moveTo(startPos.x + a, startPos.y + a);
        context.lineTo(startPos.x + r + a, startPos.y + r + a);
        
        context.stroke();
        context.fill();
        
        context.closePath();
    },
    MouseDown = function(e) {
        e.preventDefault();
        colour = "#"+Math.floor(Math.random()*LandingPageConfigs.COLOR_DEPTH).toString(LandingPageConfigs.COLOR_STRING_LENGTH);
        context.fillStyle = colour;
        context.strokeStyle = colour;
    },
    MouseDbl = function(e) {
        e.preventDefault();
        context.clearRect(0, 0, width, height);
    };
    
    this.initialize = function(){
        canvas = document.getElementById("canvas");
        context = canvas.getContext("2d");
        
        width = hero.offsetWidth;
        height = hero.offsetHeight;
        
        canvas.width = width;
        canvas.height = height;
        
        canvas.addEventListener("mousemove", MouseMove, false);
        canvas.addEventListener("click", MouseDown, false);
        canvas.addEventListener("dblclick", MouseDbl, false);	
    };	

    window.onresize = function() {
        let hiddenCanvas = document.createElement("canvas");
        hiddenCanvas.width = canvas.width;
        hiddenCanvas.height = canvas.height;
        hiddenCanvas.getContext("2d").drawImage(canvas, 0, 0);
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
        canvas.getContext("2d").drawImage(hiddenCanvas, 0, 0);
    };
}
window.onscroll = function() {
    if (this.document.body.scrollTop >= NavbarDimensions.OFFSET || this.document.documentElement.scrollTop >= NavbarDimensions.OFFSET) {
        scrollIndicator.classList.add("hidden");
    }
    if (document.body.scrollTop >= hero.offsetHeight - NavbarDimensions.OFFSET || document.documentElement.scrollTop >= hero.offsetHeight - NavbarDimensions.OFFSET) {
      navBar.classList.add("scroll");
    } else {
      navBar.classList.remove("scroll");
    }

  };

app = new OilPainting();

app.initialize();