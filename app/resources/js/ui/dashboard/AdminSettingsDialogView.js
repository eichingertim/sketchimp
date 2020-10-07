import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class SaveSettingsClickEvent extends Event {
    constructor() {
        super(EventKeys.SAVE_SETTINGS_CLICK, null);
    }
}

class CloseSettingsClickEvent extends Event {
    constructor() {
        super(EventKeys.CLOSE_ADMIN_DIALOG, null);
    }
}

class MemberKickClickEvent extends Event {
    constructor(channelId, memberId) {
        super(EventKeys.MEMBER_KICK_CLICK, {memberId: memberId, channelId: channelId});
    }
}

function onSaveSettingsClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new SaveSettingsClickEvent());
}

function onDialogCloseClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new CloseSettingsClickEvent());
}

function setListenerOnce(adminSettingsDialogView) {
    adminSettingsDialogView.saveButton = adminSettingsDialogView.el.querySelector(".save-settings");
    adminSettingsDialogView.saveButton
        .addEventListener("click", onSaveSettingsClick.bind(this, adminSettingsDialogView));
    adminSettingsDialogView.el.querySelector("#admin-settings-close")
        .addEventListener("click", onDialogCloseClick.bind(this, adminSettingsDialogView));
}

function setListener(adminSettingsDialogView) {
    Array.from(adminSettingsDialogView.el.querySelectorAll(".member-item")).forEach(member => {
        member.querySelector(".kick-member").addEventListener("click", () => {
            let memberId = member.querySelector(".member").id;
            adminSettingsDialogView.notifyAll(new MemberKickClickEvent(adminSettingsDialogView.channelId, memberId));
        });
        member.querySelector(".admin").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            setLabelColor(element, "admins");
        });
        member.querySelector(".collaborator").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            setLabelColor(element, "collaborators");
        });
        member.querySelector(".observer").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            setLabelColor(element, "Observer");
        });
    });
}

function setLabelColor (element, role) {
    if(role === "admins"){
        element.textContent = "admins";
        element.classList.remove("label-info","label-danger");
        element.classList.add("label-success");
    } else if(role === "collaborators"){
        element.textContent = "collaborators";
        element.classList.remove("label-success", "label-danger");
        element.classList.add("label-info");
    } else {
        element.textContent = "viewers";
        element.classList.remove("label-success", "label-info");
        element.classList.add("label-danger");
    }
}

class AdminSettingsDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListenerOnce(this);
        setListener(this);
        this.saveButton = this.el.querySelector(".save-settings");
        this.channelId = null;
        this.channelName = null;
        this.user = null;
    }

    updateValues(channel, user) {
        let instance = this;
        this.el.querySelector("#channel-name").value = this.channelName;
        this.el.querySelector(".role-list").innerHTML = "";
        if (channel.members.length === 0) {
            this.el.querySelector(".role-list").classList.add("hidden");
            this.el.querySelector("#empty-view").classList.remove("hidden");
        } else {
            this.el.querySelector(".role-list").classList.remove("hidden");
            this.el.querySelector("#empty-view").classList.add("hidden");
            channel.members.forEach((member) => {
                let clone = instance.el.querySelector("#member-template-admin-dialog").content.cloneNode(true);
                clone.querySelector(".member").innerHTML = member.username;
                clone.querySelector(".member").id = member.id;
                clone.querySelector(".role-tag").innerHTML = member.role;
                if (channel.creatorId !== user.userId) {
                    clone.querySelector(".kick-member").classList.add("hidden");
                }
                instance.el.querySelector(".role-list").appendChild(clone);
            });
            setListener(this);
            Array.from(this.el.querySelectorAll(".member-item")).forEach((member, index) => {
                setLabelColor(member.querySelector(".role-tag"), instance.users[index].role);
            });
        }

        
    }

    setSettings(channel) {
        this.channelId = channel.channelId;
        this.channelName = channel.channelName;
        this.users = channel.members.map(member => {
            return { id: member.id, name: member.username, role: member.role };
        });
    }

    getSettings() {
        let userList, role, userId, newName;
        userList = Array.from(this.el.querySelectorAll(".member-item")).map((element, index) => {
            userId = this.users[index].id;
            role = element.querySelector(".role-tag");
            return { userId: userId, role: role.textContent };
        });
        newName = this.el.querySelector("#channel-name").value;
        return { channelId: this.channelId, channelName: newName, userList: userList };
    }
}

export default AdminSettingsDialogView;