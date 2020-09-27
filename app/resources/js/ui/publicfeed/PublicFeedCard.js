import Config from "../../utils/Config.js";
import View from "../View.js";
import {Event} from "../../utils/Observable.js";

function initButtons(cardView){
    cardView.upvoteButton = cardView.element.querySelector(".likebutton");
    cardView.upvoteButton.addEventListener("click", onLikeButtonClick.bind(cardView));
    cardView.downvoteButton = cardView.element.querySelector(".dislikebutton");
    cardView.downvoteButton.addEventListener("click", onDislikeButtonClick.bind(cardView));
}

function onLikeButtonClick(){
    if(this.upvote){
        this.setLikeInactive();
    }else{
        this.setLikeActive();
        this.setDislikeInactive();
    }
    let likeEvent = new LikeButtonEvent(this.id);
    this.notifyAll(likeEvent);
}

function onDislikeButtonClick(){
    if(this.downvote){
        this.setDislikeInactive();
    }else{
        this.setDislikeActive();
        this.setLikeInactive();
    }
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
    constructor(element){
        super();
        this.element = element;
        this.id = element.id;
        initButtons(this);
        this.upvote = false;
        this.downvote = false;
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
}

export default PublicFeedCard;