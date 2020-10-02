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
    console.log(event);
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
    anchor.style = "color:green;";
    memberListView.el.appendChild(clone);
}

class MemberListView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
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
            anchor.style = (user.online) ? "color:green;" : "color:red;";
            this.el.appendChild(clone);
        });
        setListener(this);
    }
}

export default MemberListView;