import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {Config, EventKeys, SocketKeys} from "../../utils/Config.js";

class SaveSettingsClickEvent extends Event {
    constructor(id) {
        super(EventKeys.SAVE_SETTINGS_CLICK, { id: id });
    }
}

class CloseSettingsClickEvent extends Event {
    constructor() {
        super(EventKeys.CLOSE_ADMIN_DIALOG, null);
    }
}

function onSaveSettingsClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new SaveSettingsClickEvent(data));
}

function onDialogCloseClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new CloseSettingsClickEvent());
}

function setListener(adminSettingsDialogView) {
    adminSettingsDialogView.el.querySelector(".save-settings")
        .addEventListener("click", onSaveSettingsClick.bind(this, adminSettingsDialogView));
    adminSettingsDialogView.el.querySelector("#admin-settings-close")
        .addEventListener("click", onDialogCloseClick.bind(this, adminSettingsDialogView));

    Array.from(adminSettingsDialogView.el.querySelectorAll(".member-item")).forEach(member => {
        member.querySelector(".admin").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            setLabelColor(element, "admin");
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
    if(role === "admin"){
        element.textContent = "Admin";
        element.classList.remove("label-info","label-danger");
        element.classList.add("label-success");
    } else if(role === "collaborators"){
        element.textContent = "Collaborator";
        element.classList.remove("label-success", "label-danger");
        element.classList.add("label-info");
    } else {
        element.textContent = "Observer";
        element.classList.remove("label-success", "label-info");
        element.classList.add("label-danger");
    }
}

class AdminSettingsDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
        this.channelId = null;
        this.channelName = null;
        this.user = null;
    }

    updateValues() {
        let instance = this;
        this.el.querySelector(".form-control").value = this.channelName;
        Array.from(this.el.querySelectorAll(".member-item")).forEach((member, index) => {
            setLabelColor(member.querySelector(".role-tag"), instance.users[index].role);
        });
    }

    setSettings(channel) {
        this.channelId = channel.channelId;
        this.channelName = channel.channelName;
        this.users = channel.members.map(member => {
            return { id: member.id, name: member.username, role: member.role };
        });
    }

    getSettings() {
        let userList, role, userId;
        userList = Array.from(this.el.querySelectorAll(".member-item")).map((element, index) => {
            userId = this.users[index].id;
            role = element.querySelector(".role-tag");
            return { userId: userId, role: role.textContent };
        });
        return { channelId: this.channelId, channelName: this.channelName, userList: userList };
    }
}

export default AdminSettingsDialogView;