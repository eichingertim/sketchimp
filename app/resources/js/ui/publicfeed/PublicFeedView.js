import PublicFeedCard from "./PublicFeedCard.js";
import Config from "../../utils/Config.js";

var cardsItem = document.getElementById("cards"),
cards = setupCardList(cardsItem),
sketchData;

getAllPublished();

function onLikeClick(event){
    if(event.data){
        sendClickActionToApi(Config.API_URL_SKETCH_LIKE + event.data);
    }
}

function onDislikeClick(event){
    if(event.data){
        sendClickActionToApi(Config.API_URL_SKETCH_DISLIKE + event.data);
    }
}

function sendClickActionToApi(url){
    let xhr = new XMLHttpRequest();
    xhr.open(Config.HTTP_POST, url, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    xhr.onload = function() {
        let data = JSON.parse(this.response).data,
        sketchCard = getSketchCardForId(data.id);
        handleLikeStatus(sketchCard, data);
    };
    xhr.send();
}

function setupCardList(cardsItem){
    let cardList = [],
    cards = cardsItem.children;
    for(let i = 0; i < cards.length; i++){
        let singleCard = new PublicFeedCard(cards[i]);
        singleCard.addEventListener("Like", onLikeClick);
        singleCard.addEventListener("Dislike", onDislikeClick);
        cardList.push(singleCard);
    }
    return cardList;
}

function getSketchCardForId(id){
    for(let i = 0; i < cards.length; i++){
        if(cards[i].id === id){
            return cards[i];
        }
    }
    return null;
}

function handleLikeStatus(sketchCard, responseData){
    sketchCard.resetButtons();
    if(responseData.userUpvote){
        sketchCard.setLikeActive();
    }
    if(responseData.userDownvote){
        sketchCard.setDislikeActive();
    }
}

function getAllPublished(){
    let xhr = new XMLHttpRequest();
    xhr.open(Config.HTTP_GET, Config.API_URL_SKETCH_ALL_PUBLISHED, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    xhr.onload = function() {
        let data = JSON.parse(this.response).data;
        console.log(data);
        sketchData = data;
    };
    xhr.send();
}