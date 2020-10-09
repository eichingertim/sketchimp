import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

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

/**
 * Notifies listeners about the join server button was clicked
 * @param channelListView current instance of the view
 */
function onJoinServerClick(channelListView) {
    event.preventDefault();
    channelListView.notifyAll(new JoinServerClickEvent());
}

/**
 * Notifies listeners about the channel item was clicked
 * @param channelListView current instance of the view
 * @param data includes clicked element
 */
function onChannelItemClick(channelListView, data) {
    channelListView.notifyAll(new ChannelItemClickEvent(data.target.id));
}

/**
 * Sets the listener for each channel-item and the join-server item
 * @param channelListView current instance of the view
 */
function setListener(channelListView) {
    let items = channelListView.el.querySelectorAll(".channel");
    items.forEach(channel => {
        channel.addEventListener("click", onChannelItemClick.bind(this, channelListView));
    });

    channelListView.el.querySelector(".join-server").addEventListener("click", () =>
        onJoinServerClick(channelListView));
}

/**
 * Represents the ChannelListView
 */
class ChannelListView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    /**
     * Adds a channel dynamically to the list
     * @param channel data of the channel that should be added
     */
    addNewChannel(channel) {
            let channelTemplate = this.el.querySelector("#channel-template"),
            clone = channelTemplate.content.cloneNode(true),
            anchor = clone.querySelector("a");
        anchor.id = Config.API_URLS.CHANNEL + channel.channelId;
        anchor.textContent = channel.channelName.substring(0, 1);
        this.el.insertBefore(clone, this.el.children[this.el.children.length-1]);
        setListener(this);
    }

    /**
     * removes a channel from the list
     * @param channelId id of the channel that should be removed
     */
    removeChannel(channelId) {
        let id = Config.API_URLS.CHANNEL + channelId,
            channelElement = this.el.querySelector(`a[id="${id}"]`);
        if (channelElement) {
            channelElement.remove();
        }
    }
}

export default ChannelListView;