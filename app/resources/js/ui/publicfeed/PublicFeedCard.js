import {Config, PublicFeedDimensions} from "../../utils/Config.js";
import View from "../View.js";
import {Event} from "../../utils/Observable.js";

function createNewCard(sketch, parentDiv, cardTemplate, minMaxVotes){
    let clone = cardTemplate.content.cloneNode(true);
    clone.querySelector(".content-image").src = sketch.path;
    clone.querySelector(".card").id = sketch.id;
    
    clone.querySelector(".content-title").innerHTML = sketch.name;    
    setScore(clone, sketch.votes);
    parentDiv.appendChild(clone);

    clone = document.getElementById(sketch.id);
    
    setCardSize(clone, sketch.votes, minMaxVotes);
    return clone;
}

function setScore(card, votes){
    card.querySelector(".card-score").innerHTML = votes;
    if (votes < 0) {
        card.querySelector(".card-score").classList.add("negative");
    } else if (votes > 0) {
        card.querySelector(".card-score").classList.add("positive");
    }
}

function setCardSize(card, sketchVotes, minMaxVotes){
    let scoreElement, cardSize, scoreSize, 
    fontSize, titleSize, factor;
    
    if(minMaxVotes.low === minMaxVotes.high){
        cardSize = PublicFeedDimensions.CARD_DEFAULT;
        scoreSize = PublicFeedDimensions.SCORE_DEFAULT;
        fontSize = PublicFeedDimensions.SCOREFONT_DEFAULT;
        titleSize = PublicFeedDimensions.TITLE_DEFAULT;
    }else{
        factor = ((sketchVotes - minMaxVotes.low) / (minMaxVotes.high - minMaxVotes.low));
        cardSize = PublicFeedDimensions.CARD_BASE + PublicFeedDimensions.CARD_MULTIPLICANT * factor;
        scoreSize = PublicFeedDimensions.SCORE_BASE + PublicFeedDimensions.SCORE_MULTIPLICANT * factor;
        fontSize = PublicFeedDimensions.SCOREFONT_BASE + PublicFeedDimensions.SCOREFONT_MULTIPLICANT * factor;
        titleSize = PublicFeedDimensions.TITLE_BASE + PublicFeedDimensions.TITLE_MULTIPLICANT * factor;
    }
    card.style.width = cardSize + "px";
    scoreElement = card.querySelector(".card-score");
    scoreElement.style.width = scoreSize + "px";
    scoreElement.style.height = scoreSize + "px";
    scoreElement.style.fontSize = fontSize + "px";
    card.querySelector(".content-title").style.fontSize = titleSize + "px";

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
    constructor(sketch, parentDiv, cardTemplate, minMaxVotes){
        super();
        this.element = createNewCard(sketch, parentDiv, cardTemplate, minMaxVotes);
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

    setScore(votes){
        setScore(this.element, votes);
    }

    resetButtons(){
        this.setLikeInactive();
        this.setDislikeInactive();
    }
}

export default PublicFeedCard;