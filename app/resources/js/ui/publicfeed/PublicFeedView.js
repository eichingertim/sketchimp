import PublicFeedCard from "./PublicFeedCard.js";
import Config from "../../utils/Config.js";

var cardsItem = document.getElementById("cards"),
cardObjects = setupCardList(cardsItem);

function onLikeClick(event){
    console.log("click like; sketch:" + event.data);
    if(event.data){
        sendClickActionToApi(Config.API_URL_SKETCH_LIKE + event.data);
    }
}

function onDislikeClick(event){
    console.log("click dislike; sketch:" + event.data);
    if(event.data){
        sendClickActionToApi(Config.API_URL_SKETCH_DISLIKE + event.data);
    }
}

function sendClickActionToApi(url){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    xhr.onload = function() {
        //instance.notifyAll(new SketchSavedEvent());
    };
    console.log("send:" + url);
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