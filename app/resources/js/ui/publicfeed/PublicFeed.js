import PublicFeedCard from "./PublicFeedCard.js";
import Config from "../../utils/Config.js";

var cardsItem = document.getElementById("cards"),
sketchData,
cardList = [],
renderCounter = 0,
cardTemplate = document.querySelector("#card-template"),
navBar = document.querySelector(".navigation-top"),
topContainer = document.querySelector(".banner-content"),
footer = document.querySelector("footer"),
cooldownActive = false;

init();

function createNext(){
    if(sketchData && !cooldownActive){
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
        if(i >= renderCounter + Config.PUBLIC_FEED_CARDS_PER_SECTION){
            renderCounter += Config.PUBLIC_FEED_CARDS_PER_SECTION;
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
            createNext();
        } catch(e){
            console.log(e);
        }
    };
    xhr.send();
}

function initScrollBehaviour(){
    window.onscroll = function() {
        if (document.body.scrollTop >= topContainer.offsetHeight - 30 || document.documentElement.scrollTop >= topContainer.offsetHeight - 30) {
          navBar.classList.add("scroll");
        } else {
          navBar.classList.remove("scroll");
        }
        let pageHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
            document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
        
        if(document.documentElement.scrollTop + window.innerHeight > pageHeight - footer.offsetHeight){
            createNext();
            cooldownActive = true;
            setTimeout(function(){
                cooldownActive = false;
            }, Config.LAZY_LOADING_COOLDOWN);
        }
    };
}

function init(){
    getAllPublished();
    initScrollBehaviour();
}