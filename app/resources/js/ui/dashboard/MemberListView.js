import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class MemberItemClickEvent extends Event {
    constructor(data) {
        super(EventKeys.MEMBER_ITEM_CLICK, {data: data});
    }
}

function onMemberClick(memberListView, event) {
    event.preventDefault();
    memberListView.notifyAll(new MemberItemClickEvent(event));
}

function setListener(memberListView) {
    let channelMembers = memberListView.el.querySelectorAll(".member");
    channelMembers.forEach(member => {
        member.addEventListener("mouseover", onMemberClick.bind(this, memberListView));
        member.addEventListener("mouseout", onMemberClick.bind(this, memberListView));
    }); 
}

function appendCreatorToList(channel, memberTemplate, memberListView) {
    let clone = memberTemplate.content.cloneNode(true),
        anchor = clone.querySelector("span");
    anchor.id = "/api/user/" + channel.creatorId;
    anchor.textContent = channel.creatorName;
    anchor.style.color = Config.STATES_COLORS.OFFLINE;
    memberListView.el.appendChild(clone);
}

class MemberListView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

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

    updateMembers(channel) {
        let memberTemplate = document.querySelector("#member-template");
        this.el.innerHTML = "";
        appendCreatorToList(channel, memberTemplate, this);
        channel.members.forEach(user => {
            let clone = memberTemplate.content.cloneNode(true),
                anchor = clone.querySelector("span");
            anchor.id = "/api/user/" + user.id;
            anchor.textContent = user.username;
            anchor.style.color = Config.STATES_COLORS.OFFLINE;
            this.el.appendChild(clone);
        });
        setListener(this);
    }
}

export default MemberListView;