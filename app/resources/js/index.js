/* eslint-env browser */
import Dashboard from "./Dashboard.js";

var socket = io(),
  dashboard,
  channelList,
  memberList;

  function fetchChannelData(href) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", href, true);
    xhr.onload = function() {
        let data = JSON.parse(this.response).data,
          channelId = data.id,
          memberList = document.querySelector(".member-list"),
          memberTemplate = memberList.querySelector("li");
        console.log(data);
        document.querySelector(".channel-title").textContent = data.name;
        document.querySelector(".info-channel-name").textContent = data.name;
        document.querySelector(".info-channel-id").textContent = channelId;
        document.querySelector(".info-channel-creation").textContent = data.creation;
        document.querySelector(".info-channel-creator").textContent = data.creator;
        memberList.innerHTML = "";
        data.members.forEach(user => {
          let clone = memberTemplate.cloneNode(true);
          clone.querySelector("a").href = "/user/" + user.id;
          clone.querySelector("a").textContent = user.username;
          if (!user.online) {
            clone.style = "color:red";
          }
          clone.querySelector(".member").addEventListener("click", triggerUserAjax);
          memberList.appendChild(clone);
        });
        if (dashboard.channelId === null) {
          dashboard.onJoin(channelId);
        } else {
          dashboard.onLeave();
          dashboard.onJoin(channelId);
        }
        
    };
    xhr.send();
}

function fetchUserData(href) {
  console.log(href);
  let xhr = new XMLHttpRequest();
  xhr.open("GET", href, true);
  xhr.onload = function() {
      //document.querySelector(".info-container").innerHTML = this.responseText;
      console.log(this.response);
  };
  xhr.send();
}

function createChannel() {
  let channelName = document.querySelector("#r_name").value,
    xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/channel/new/" + channelName, true);
  xhr.withCredentials = true;
  xhr.onload = function() {
    console.log(this.response);
    let data = JSON.parse(this.response).data,
      channelList = document.querySelector(".sidebar-menu"),
      channelTemplate = channelList.querySelector("li"),
      clone = channelTemplate.cloneNode(true);
    clone.querySelector("a").href = "/api/channel/" + data.id;
    clone.querySelector("a").textContent = data.name.substring(0, 1);
    clone.querySelector("a").addEventListener("click", triggerChannelAjax);
    channelList.insertBefore(clone, channelList.children[channelList.children.length-1]);
  };
  xhr.send();
  document.querySelector(".create-channel-container").classList.toggle("hidden");
  document.querySelector("#r_name").value = "";
}

function leaveChannel() {
  let channelID = document.querySelector(".info-channel-id").textContent,
    xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/channel/leave/" + channelID, true);
  xhr.withCredentials = true;
  xhr.onload = function() {
    console.log(this.response);
    /*
      Could update channel list / reload dashboard ui here
    */
  };
  xhr.send();
  document.querySelector(".info-container").classList.toggle("hidden");
}

function joinChannel() {
  let channelID = document.querySelector("#r_join").value,
    xhr = new XMLHttpRequest(),
    href = "/api/channel/join/" + channelID;
  console.log(href);
  xhr.open("POST", href, true);
  xhr.withCredentials = true;
  xhr.onload = function() {
    console.log(this.response);
    /*
      Could update channel list / reload dashboard ui here
    */
  };
  xhr.send();
  document.querySelector("#r_join").value = "";
  document.querySelector(".create-channel-container").classList.toggle("hidden");
}

function triggerChannelAjax() {
    event.preventDefault();
    fetchChannelData(this.href);
}

function triggerUserAjax() {
  event.preventDefault();
  fetchUserData(this.href);
}

function triggerChannelCreateAjax() {
  event.preventDefault();
  createChannel();
}

function triggerJoinChannelAjax() {
  event.preventDefault();
  joinChannel();
}

function onWindowResize() {
  dashboard.resizeElements();
}

function init() {
  dashboard = new Dashboard(socket);
  if (dashboard.channelId === null) {
    dashboard.onJoin(document.querySelector(".info-channel-id").textContent);
  }
  channelList = document.querySelectorAll(".channel");
  channelList.forEach(channel => {
    channel.addEventListener("click", triggerChannelAjax);
  });
  memberList = document.querySelectorAll(".member");
  memberList.forEach(member => {
    member.addEventListener("click", triggerUserAjax);
  });
  document.querySelector(".join-server").addEventListener("click", function() {
    event.preventDefault();
    document.querySelector(".create-channel-container").classList.toggle("hidden");
  });
  document.querySelector(".channel-info-icon").addEventListener("click", function() {
    document.querySelector(".info-container").classList.toggle("hidden");
  });
  document.querySelector(".submit-channel-creation").addEventListener("click", triggerChannelCreateAjax);
  document.querySelector(".leave-channel").addEventListener("click", leaveChannel);
  document.querySelector(".submit-channel-join").addEventListener("click", triggerJoinChannelAjax);
  window.onresize = onWindowResize;
}

init();
