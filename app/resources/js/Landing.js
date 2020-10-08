var app,
    navBar = document.querySelector(".navigation-top"),
    scrollIndicator = document.querySelector(".scroll-indicator"),
    hero = document.querySelector(".hero");

function OilPainting(){
    
    var canvas,
    context,
    width,
    height,
    startPos = {x: window.innerWidth/2, y: window.innerHeight/2},
    prevPos = {x: window.innerWidth/2, y: 0},
    dist = {x: 0, y: 0},
    colour = "#"+Math.floor(Math.random()*16777215).toString(16),
    MouseMove = function(e) {
        var distance = Math.sqrt(Math.pow(prevPos.x - startPos.x, 2) +
        Math.pow(prevPos.y - startPos.y, 2)),
        a = distance * 10 * (Math.pow(Math.random(), 2) - 0.5),
        r = Math.random() - 0.5,
        size = (Math.random() * 15) / distance,
        lWidth;
        
        dist.x = (prevPos.x - startPos.x) * Math.sin(0.5) + startPos.x;
        dist.y = (prevPos.y - startPos.y) * Math.cos(0.5) + startPos.y;
        
        startPos.x = prevPos.x;
        startPos.y = prevPos.y;
        
        prevPos.x = (e.layerX);
        prevPos.y = (e.layerY);
        
        lWidth = (Math.random()+50/10-0.5)*size+(1-Math.random()+60/20-0.5)*size;
        context.lineWidth = lWidth;
        context.strokeWidth = lWidth * 5;
        
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
        colour = "#"+Math.floor(Math.random()*16777215).toString(16);
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
    if (this.document.body.scrollTop >= 50 || this.document.documentElement.scrollTop >= 50) {
        scrollIndicator.classList.add("hidden");
    }
    if (document.body.scrollTop >= hero.offsetHeight -50 || document.documentElement.scrollTop >= hero.offsetHeight -50) {
      navBar.classList.add("scroll");
    } else {
      navBar.classList.remove("scroll");
    }

  };

app = new OilPainting();

app.initialize();