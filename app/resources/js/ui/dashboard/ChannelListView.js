import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

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

    addNewChannel(channel) {
            let channelTemplate = this.el.querySelector("#channel-template"),
            clone = channelTemplate.content.cloneNode(true),
            anchor = clone.querySelector("a");
        anchor.id = Config.API_URLS.CHANNEL + channel.channelId;
        anchor.textContent = channel.channelName.substring(0, 1);
        this.el.insertBefore(clone, this.el.children[this.el.children.length-1]);
        setListener(this);
    }

    removeChannel(channelId) {
        console.log(this.el);
        let id = Config.API_URLS.CHANNEL + channelId,
            channelElement = this.el.querySelector(`a[id="${id}"]`);
        console.log(id)
        console.log(channelElement);
        if (channelElement) {
            channelElement.remove();
        }
    }
}

export default ChannelListView;