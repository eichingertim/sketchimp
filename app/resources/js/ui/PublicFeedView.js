class PublicFeedView{
    constructor(node){
        this.node = node;
        this.id = node.id;
        this.setupClickListener();
    }

    setupClickListener(){
        this.upvoteButton = this.node.querySelector(".likebutton");
        this.upvoteButton.addEventListener("click", onLikeClick.bind(this));
        this.downvoteButton = this.node.querySelector(".dislikebutton");
        this.downvoteButton.addEventListener("click", onDislikeClick.bind(this));
    }

}

function onLikeClick(){
    console.log("click like; sketch:" + this.id);
    let xhr = new XMLHttpRequest(),
        url = "/api/sketch/upvote/" + this.id;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    /*xhr.onload = function() {
        //instance.notifyAll(new SketchSavedEvent());
    };*/
    xhr.send();

}

function onDislikeClick(){
    console.log("click like; sketch:" + this.id);
    let xhr = new XMLHttpRequest(),
        url = "/api/sketch/downvote/" + this.id;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    /*xhr.onload = function() {
        //instance.notifyAll(new SketchSavedEvent());
    };*/
    xhr.send();
}

function setupCardList(cardsItem){
    let cardList = [],
    cards = cardsItem.children;
    for(let i = 0; i < cards.length; i++){
        let singleCard = new PublicFeedView(cards[i]);
        cardList.push(singleCard);
    }
    return cardList;
}

var cardsItem = document.getElementById("cards"),
cardObjects = setupCardList(cardsItem),
userId = "5f6cb652a60f930330f6ca81";