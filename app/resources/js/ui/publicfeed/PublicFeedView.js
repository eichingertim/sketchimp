import PublicFeedCard from "./PublicFeedCard.js";
import Config from "../../utils/Config.js";

var cardsItem = document.getElementById("cards"),
sketchData,
cardList = [],
renderCounter = 0,
cardTemplate = document.querySelector("#card-template");

init();

function createNext(){
    if(sketchData.length <= renderCounter){
        return;
    }
    let parentDiv = createParentDiv(),
    masonry;

    createCardsforNextSection(parentDiv);

    masonry = new Masonry(parentDiv, {
        itemSelector: ".card",
        columnWidth: 150,
        fitWidth: true,
    });
    imagesLoaded(parentDiv).on("progress", function() {
        masonry.layout();   
    });
}

function createParentDiv(){
    let parentDiv = document.createElement("div");
    parentDiv.classList.add("card-section");
    parentDiv.id = "cards-" + renderCounter;
    cardsItem.appendChild(parentDiv);
    return parentDiv;
}

function createCardsforNextSection(parentDiv){
    for(let i = renderCounter; i < sketchData.length; i++){
        if(i === renderCounter + Config.PUBLIC_FEED_CARDS_PER_SECTION){
            return;
        }
        let singleCard = new PublicFeedCard(sketchData[i], parentDiv, cardTemplate, i);
        singleCard.addEventListener("Like", onLikeClick);
        singleCard.addEventListener("Dislike", onDislikeClick);
        cardList.push(singleCard);
    }
    renderCounter += Config.PUBLIC_FEED_CARDS_PER_SECTION;
}

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
        try{
            let data = JSON.parse(this.response).data,
            sketchCard = getSketchCardForId(data.id);
            handleVoteResponse(sketchCard, data);
        }catch (e) {
            console.log(e);
        }
    };
    xhr.send();
}

function getSketchCardForId(id){
    for(let i = 0; i < cardList.length; i++){
        if(cardList[i].id === id){
            return cardList[i];
        }
    }
    return null;
}

function handleVoteResponse(sketchCard, responseData){
    sketchCard.setScore(responseData.votes);
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
        try{
            let data = JSON.parse(this.response).data;
            sketchData = data;
            if(sketchData){
                createNext();
            }
        } catch(e){
            console.log(e);
        }
    };
    xhr.send();
}

function init(){
    getAllPublished();
    
}