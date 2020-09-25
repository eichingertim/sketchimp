import View from "./View.js";
import { Event } from "../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../utils/Config";

class ChannelItemClickEvent extends Event {
    constructor(href) {
        super(EventKeys.CHANNEL_ITEM_CLICK, {url: href});
    }
}

class JoinServerClickEvent extends Event {
    constructor() {
        super(EventKeys.CHANNEL_ITEM_CREATE_CLICK, null);
    }
}

function onJoinServerClick(channelListView, data) {
    event.preventDefault();
    channelListView.notifyAll(new JoinServerClickEvent());
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
        anchor.id = Config.API_URL_CHANNEL + data.id;
        anchor.textContent = data.name.substring(0, 1);
        this.el.insertBefore(clone, this.el.children[this.el.children.length-1]);
        setListener(this);
    }
}

export default ChannelListView;