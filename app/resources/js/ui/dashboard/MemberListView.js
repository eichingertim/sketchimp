import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class MemberItemClickEvent extends Event {
    constructor(href) {
        super(EventKeys.MEMBER_ITEM_CLICK, {url: href});
    }
}

function onMemberClick(memberListView, data) {
    memberListView.notifyAll(new MemberItemClickEvent(data.href));
}

function setListener(memberListView) {
    let channelMembers = memberListView.el.querySelectorAll(".member");
    channelMembers.forEach(member => {
        member.addEventListener("click", onMemberClick.bind(this, memberListView));
    });
}

class MemberListView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    updateMembers(channelMembers) {
        let memberTemplate = document.querySelector("#member-template");
        this.el.innerHTML = "";
        channelMembers.forEach(user => {
            let clone = memberTemplate.content.cloneNode(true),
                anchor = clone.querySelector("a");
            anchor.href = "/api/user/" + user.id;
            anchor.textContent = user.username;
            anchor.style = (user.online) ? "color:green;" : "color:red";
            this.el.appendChild(clone);
            setListener(this);
        });
    }
}

export default MemberListView;