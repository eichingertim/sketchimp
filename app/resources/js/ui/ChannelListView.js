import View from "./View.js";
import { Event } from "../utils/Observable.js";

class ChannelItemClickEvent extends Event {
    constructor(href) {
        super("ChannelItemClick", {url: href});
    }
}

class JoinServerClickEvent extends Event {
    constructor() {
        super("JoinServerClick", null);
    }
}

function onJoinServerClick(channelListView, data) {
    event.preventDefault();
    channelListView.notifyAll(new JoinServerClickEvent());
    //document.querySelector(".create-channel-container").classList.toggle("hidden");
}

function onChannelItemClick(channelListView, data) {
    channelListView.notifyAll(new ChannelItemClickEvent(data.target.id));
}

function setListener(channelListView) {
    let items = channelListView.el.querySelectorAll(".channel");
    items.forEach(channel => {
        channel.addEventListener("click", onChannelItemClick.bind(this, channelListView));
    });

    channelListView.el.querySelector(".join-server").addEventListener("click", onJoinServerClick.bind(this, channelListView));
}

class ChannelListView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    addNewChannel(data) {
            let channelTemplate = this.el.querySelector("#channel-template"),
            clone = channelTemplate.content.cloneNode(true),
            anchor = clone.querySelector("a");
        anchor.id = "/api/channel/" + data.id;
        anchor.textContent = data.name.substring(0, 1);
        this.el.insertBefore(clone, this.el.children[this.el.children.length-1]);
        setListener(this);
    }
}

export default ChannelListView;