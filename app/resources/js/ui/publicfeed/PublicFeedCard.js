import Config from "../../utils/Config.js";
import View from "../View.js";
import {Event} from "../../utils/Observable.js";

function initButtons(cardView){
    cardView.upvoteButton = cardView.element.querySelector(".likebutton");
    cardView.upvoteButton.addEventListener("click", onLikeButtonClick.bind(cardView));
    cardView.downvoteButton = cardView.element.querySelector(".dislikebutton");
    cardView.downvoteButton.addEventListener("click", onDislikeButtonClick.bind(cardView));
    initButtonStatus(cardView);
}

function initButtonStatus(cardView){
    if(cardView.upvoteButton.src === Config.PATH_LIKE_ICON_ACTIVE){
        cardView.upvote = true;
    }else {
        cardView.upvote = false;
    }

    if(cardView.downvoteButton.src === Config.PATH_DISLIKE_ICON_ACTIVE){
        cardView.downvote = true;
    }else {
        cardView.downvote = false;
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

    resetButtons(){
        this.setLikeInactive();
        this.setDislikeInactive();
    }
}

export default PublicFeedCard;