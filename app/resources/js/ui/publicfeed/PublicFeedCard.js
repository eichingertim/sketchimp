import View from "../View.js";

function initButtons(cardView){
    cardView.upvoteButton = cardView.element.querySelector(".likebutton");
    cardView.upvoteButton.addEventListener("click", onLikeClick.bind(cardView));
    cardView.downvoteButton = cardView.element.querySelector(".dislikebutton");
    cardView.downvoteButton.addEventListener("click", onDisLikeClick.bind(cardView));
}

function onLikeClick(){

}

function onDisLikeClick(){
    
}

class PublicFeedCard extends View{
    constructor(element){
        super();
        this.element = element;
        this.id = element.id;
        initButtons(this);
    }


}