import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class MemberItemClickEvent extends Event {
    constructor(href) {
        super(EventKeys.MEMBER_ITEM_CLICK, {url: href});
    }
}

function onMemberClick(memberListView, event) {
    event.preventDefault();
    memberListView.notifyAll(new MemberItemClickEvent(event.target.id));
}

function setListener(memberListView) {
    let channelMembers = memberListView.el.querySelectorAll(".member");
    channelMembers.forEach(member => {
        member.addEventListener("click", onMemberClick.bind(this, memberListView));
    });
}

function appendCreatorToList(channel, memberTemplate, memberListView) {
    let clone = memberTemplate.content.cloneNode(true),
        anchor = clone.querySelector("span");
    anchor.id = "/api/user/" + channel.creatorId;
    anchor.textContent = channel.creatorName;
    anchor.style.color = "green";
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
            if (data.activeUsers.includes(id)) {
                username.style.color = "green";
            } else {
                username.style.color = "red";
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
            anchor.style.color = "red";
            this.el.appendChild(clone);
        });
        setListener(this);
    }
}

export default MemberListView;