import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys} from "../../utils/Config.js";

class MemberItemClickEvent extends Event {
    constructor(data) {
        super(EventKeys.MEMBER_ITEM_CLICK, {data: data});
    }
}

/**
 * Notifies listener about a hover event over a member-item
 * @param memberListView current instance of a view
 * @param event hover event
 */
function onMemberClick(memberListView, event) {
    event.preventDefault();
    memberListView.notifyAll(new MemberItemClickEvent(event));
}

/**
 * sets mouseover and mouseout listener for member-item
 * @param memberListView current instance of view
 */
function setListener(memberListView) {
    let channelMembers = memberListView.el.querySelectorAll(".member");
    channelMembers.forEach(member => {
        member.addEventListener("mouseover", onMemberClick.bind(this, memberListView));
        member.addEventListener("mouseout", onMemberClick.bind(this, memberListView));
    }); 
}

/**
 * appends the create to the member list, as it is saved apart from members
 * @param channel current channel's data
 * @param memberTemplate template of a member item
 * @param memberListView current instance of view
 */
function appendCreatorToList(channel, memberTemplate, memberListView) {
    let clone = memberTemplate.content.cloneNode(true),
        anchor = clone.querySelector("span");
    anchor.id = Config.API_URLS.MEMBER + channel.creatorId;
    anchor.textContent = channel.creatorName;
    anchor.style.color = Config.STATES_COLORS.OFFLINE;
    memberListView.el.appendChild(clone);
}

/**
 * Represents the member list of a channel
 */
class MemberListView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    /**
     * Updates active state-colors of the member-items (RED=Offline, ORANGE=Not Active, GREEN: Active),
     * @param data necessary data to update the states
     */
    updateActiveState(data) {
        let memberItems = this.el.querySelectorAll(".member-item");
        memberItems.forEach((memberItem) => {
            let username = memberItem.querySelector(".member"),
            id = username.id.split("/").pop();
            if (data.state !== undefined && data.state !== null) {
                if (id === data.userId) {
                    if (data.state === Config.STATES.ACTIVE) {
                        username.style.color = Config.STATES_COLORS.ACTIVE;
                    } else if (data.state === Config.STATES.INACTIVE){
                        username.style.color = Config.STATES_COLORS.INACTIVE;
                    } else {
                        username.style.color = Config.STATES_COLORS.OFFLINE;
                    }
                }
            } else {
                if (data.activeUsers[id] !== null && data.activeUsers[id] !== undefined) {
                    if (data.activeUsers[id] === Config.STATES.ACTIVE) {
                        username.style.color = Config.STATES_COLORS.ACTIVE;
                    } else if (data.activeUsers[id] === Config.STATES.INACTIVE){
                        username.style.color = Config.STATES_COLORS.INACTIVE;
                    } else {
                        username.style.color = Config.STATES_COLORS.OFFLINE;
                    }
                }
            }
        });
    }

    /**
     * updates the member-list. clears and adds all members to the the listview
     * @param channel current channel's data
     */
    updateMembers(channel) {
        let memberTemplate = document.querySelector("#member-template");
        this.el.innerHTML = "";
        appendCreatorToList(channel, memberTemplate, this);
        channel.members.forEach(user => {
            let clone = memberTemplate.content.cloneNode(true),
                anchor = clone.querySelector("span");
            anchor.id = Config.API_URLS.MEMBER + user.id;
            anchor.textContent = user.username;
            anchor.style.color = Config.STATES_COLORS.OFFLINE;
            this.el.appendChild(clone);
        });
        setListener(this);
    }
}

export default MemberListView;