import PublicFeedCard from "./PublicFeedCard.js";
import Config, { NavbarDimensions } from "../../utils/Config.js";

var cardsItem = document.getElementById("cards"),
sketchData,
minMaxVotes,
cardList = [],
renderCounter = 0,
cardTemplate = document.querySelector("#card-template"),
navBar = document.querySelector(".navigation-top"),
topContainer = document.querySelector(".banner-content"),
footer = document.querySelector("footer"),
cooldownActive = false;

init();

// Method creates a new section with the next few cards to show
function createNext(){
    if(sketchData && !cooldownActive){
        if(sketchData.length <= renderCounter){
            return;
        }
        let parentDiv = createParentDiv(),
        masonry;

        createCardsforNextSection(parentDiv);

        // script is linked in HTML but eslint can't recognize it
        // eslint-disable-next-line no-undef
        masonry = new Masonry(parentDiv, {
            itemSelector: ".card",
            columnWidth: 100,
            fitWidth: true,
            originLeft: false,
        });
        //callback for masonry
        // eslint-disable-next-line no-undef
        imagesLoaded(parentDiv).on("progress", function() {
            masonry.layout();   
        });
    } 
}

// Method creates div for a new section and appends it to cardItems-Element
function createParentDiv(){
    let parentDiv = document.createElement("div");
    parentDiv.classList.add("card-section");
    parentDiv.id = "cards-" + renderCounter;
    cardsItem.appendChild(parentDiv);
    return parentDiv;
}

// Method creates cards and adds eventlistener for the next session
function createCardsforNextSection(parentDiv){
    for(let i = renderCounter; i < sketchData.length; i++){
        if(i >= renderCounter + Config.PUBLIC_FEED_CARDS_PER_SECTION){
            // stop if the maximum number of cards for this section was reached and 
            // add the number of cards per section to counter
            renderCounter += Config.PUBLIC_FEED_CARDS_PER_SECTION;
            return;
        }
        let singleCard = new PublicFeedCard(sketchData[i], parentDiv, cardTemplate, minMaxVotes);
        singleCard.addEventListener("Like", onLikeClick);
        singleCard.addEventListener("Dislike", onDislikeClick);
        cardList.push(singleCard);
    }
    // add the number of cards per section to counter
    renderCounter += Config.PUBLIC_FEED_CARDS_PER_SECTION;
}

function onLikeClick(event){
    if(event.data){
        sendClickActionToApi(Config.API_URLS.SKETCH_LIKE + event.data);
    }
}

function onDislikeClick(event){
    if(event.data){
        sendClickActionToApi(Config.API_URLS.SKETCH_DISLIKE + event.data);
    }
}

// Method sends a post-request to api and handles the vote action when returned from api
function sendClickActionToApi(url){
    let xhr = new XMLHttpRequest();
    xhr.open(Config.HTTP.POST, url, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    xhr.onload = function() {
        try {
            let data = JSON.parse(this.response).data,
            sketchCard = getSketchCardForId(data.id);
            handleVoteResponse(sketchCard, data);
        }catch(e) {
            // error sendingClickAction
        }
    };
    xhr.send();
}

// Returns the card item from cardList with the requested id
function getSketchCardForId(id){
    for(let i = 0; i < cardList.length; i++){
        if(cardList[i].id === id){
            return cardList[i];
        }
    }
    return null;
}

// Method handles front end actions from vote response (new Score value, upvote/downvote button appereance)
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

// Method returns object with highes and lowest vote value
function getHighestAndLowestVotes(){
    if(sketchData){
        let lowest = 0,
        highest = 0;

        for(let i = 0; i < sketchData.length; i++){
            if(sketchData[i].votes < lowest){
                lowest = sketchData[i].votes;
            }else if(sketchData[i].votes > highest){
                highest = sketchData[i].votes;
            }
        }
        return {low: lowest, high: highest};
    }
    return null;
}

// Method collects all published sketches from api and creates the first cards from it
function getAllPublished(){
    let xhr = new XMLHttpRequest();
    xhr.open(Config.HTTP.GET, Config.API_URLS.SKETCH_ALL_PUBLISHED, true);
    xhr.setRequestHeader("Content-Type", "text/html");
    xhr.onload = function() {
        try{
            let data = JSON.parse(this.response).data;
            sketchData = data;
            minMaxVotes = getHighestAndLowestVotes();
            createNext();
        } catch(e){
            // error fetching all published sketches
        }
    };
    xhr.send();
}

function initScrollBehaviour(){
    window.onscroll = function() {
        // change navbar appereance when scrolled down
        if (document.body.scrollTop >= topContainer.offsetHeight - NavbarDimensions.OFFSET || 
            document.documentElement.scrollTop >= topContainer.offsetHeight - NavbarDimensions.OFFSET ) {
          navBar.classList.add("scroll");
        } else {
          navBar.classList.remove("scroll");
        }

        let pageHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
            document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
        //Create next cards if scrolled to bottom of page
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