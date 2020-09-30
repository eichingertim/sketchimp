import Config from "../../utils/Config.js";
import View from "../View.js";
import {Event} from "../../utils/Observable.js";

function createNewCard(sketch, parentDiv, cardTemplate, counter){
    let clone = cardTemplate.content.cloneNode(true);
    clone.querySelector(".content-image").src = sketch.path;
    clone.querySelector(".card").id = sketch.id;
    clone.querySelector(".content-title").innerHTML = sketch.name + sketch.votes;
   
    parentDiv.appendChild(clone);
    clone = document.getElementById(sketch.id);
    switch(true){
        case counter <= 10: 
            clone.classList.add("card--width5"); 
            break;
        case counter <= 20: 
            clone.classList.add("card--width4"); 
            break; 
        case counter <= 30: 
            clone.classList.add("card--width3"); 
            break; 
        case counter <= 40: 
            clone.classList.add("card--width2"); 
            break;     
        default: 
            clone.classList.add("card--width1");                                 
    }
    return clone;
}

function initButtons(cardView, sketch){
    cardView.upvoteButton = cardView.element.querySelector(".likebutton");
    cardView.downvoteButton = cardView.element.querySelector(".dislikebutton");
    if(cardView.upvoteButton && cardView.downvoteButton){
       if(sketch.userUpvote){
        cardView.upvoteButton.src = "/app/assets/thumb_up-white-18dp-active.svg";
        cardView.downvoteButton.src = "/app/assets/thumb_down-white-18dp.svg";
    }else if(sketch.userDownvote){
        cardView.upvoteButton.src = "/app/assets/thumb_up-white-18dp.svg";
        cardView.downvoteButton.src = "/app/assets/thumb_down-18dp-active.svg";
    }else{
        cardView.upvoteButton.src = "/app/assets/thumb_up-white-18dp.svg";
        cardView.downvoteButton.src = "/app/assets/thumb_down-white-18dp.svg";
    }
    cardView.upvoteButton.addEventListener("click", onLikeButtonClick.bind(cardView));
    cardView.downvoteButton.addEventListener("click", onDislikeButtonClick.bind(cardView)); 
    }
    
}


function onLikeButtonClick(){
    let likeEvent = new LikeButtonEvent(this.id);
    this.notifyAll(likeEvent);
}

function onDislikeButtonClick(){
    let dislikeEvent = new DislikeButtonEvent(this.id);
    this.notifyAll(dislikeEvent);
}

class LikeButtonEvent extends Event{
    constructor(sketchId){
        super("Like", sketchId);
    }
}

class DislikeButtonEvent extends Event{
    constructor(sketchId){
        super("Dislike", sketchId);
    }
}

class PublicFeedCard extends View{
    constructor(sketch, parentDiv, cardTemplate, counter){
        super();
        this.element = createNewCard(sketch, parentDiv, cardTemplate, counter);
        this.id = sketch.id;
        this.upvote = sketch.userUpvote;
        this.downvote = sketch.userDownvote;
        initButtons(this, sketch);
    }

    setLikeActive(){
        this.upvoteButton.src = Config.PATH_LIKE_ICON_ACTIVE;
        this.upvote = true;
    }

    setLikeInactive(){
        this.upvoteButton.src = Config.PATH_LIKE_ICON_INACTIVE;
        this.upvote = false;
    }

    setDislikeActive(){
        this.downvoteButton.src = Config.PATH_DISLIKE_ICON_ACTIVE;
        this.downvote = true;
    }

    setDislikeInactive(){
        this.downvoteButton.src = Config.PATH_DISLIKE_ICON_INACTIVE;
        this.downvote = false;
    }

    resetButtons(){
        this.setLikeInactive();
        this.setDislikeInactive();
    }
}

export default PublicFeedCard;