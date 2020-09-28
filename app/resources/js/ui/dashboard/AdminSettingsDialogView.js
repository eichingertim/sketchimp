import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {EventKeys} from "../../utils/Config.js";

class SaveSettingsClickEvent extends Event {
    constructor(id) {
        super(EventKeys.SAVE_SETTINGS_CLICK, {id: id});
    }
}

let channelId, channelName, users;

function onSaveSettingsClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new SaveSettingsClickEvent(data));
}

function setListener(adminSettingsDialogView) {
    adminSettingsDialogView.el.querySelector(".save-settings")
        .addEventListener("click", onSaveSettingsClick.bind(this, adminSettingsDialogView));
    //
    Array.from(adminSettingsDialogView.el.querySelectorAll(".member-item")).forEach(member => {
        member.querySelector(".admin").addEventListener("click", () => {
            member.querySelector(".role-tag").textContent = "admin";
        });
        member.querySelector(".collaborator").addEventListener("click", () => {
            member.querySelector(".role-tag").textContent = "collaborator";
        });
        member.querySelector(".observer").addEventListener("click", () => {
            member.querySelector(".role-tag").textContent = "observer";
        });
    });
    // adminSettingsDialogView.el.querySelector(".admin")
    //     .addEventListener("click", () => {
    //         adminSettingsDialogView.el.querySelector(".role-tag").textContent = "admin";
    //     });
    // adminSettingsDialogView.el.querySelector(".collaborator")
    //     .addEventListener("click", () => {
    //         adminSettingsDialogView.el.querySelector(".role-tag").textContent = "collaborator";
    //     });
    // adminSettingsDialogView.el.querySelector(".observer")
    //     .addEventListener("click", () => {
    //         adminSettingsDialogView.el.querySelector(".role-tag").textContent = "observer";
    //     });
    }

class AdminSettingsDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    updateValues() {
        this.el.querySelector(".form-control").value = channelName;
        Array.from(this.el.querySelectorAll(".member-item")).forEach((member, index) => {
            member.querySelector(".role-tag").textContent = users[index].role;
        });
        //this.el.querySelector(".role-tag").textContent = users;
    }

    setSettings(channel) {
        channelId = channel.channelId;
        channelName = channel.channelName;
        users = channel.members.map(member => {
            return {id: member.id, name: member.username, role: member.role};
        });
    }

    getSettings() {
        let userList, name, role, id;
        userList = Array.from(this.el.querySelectorAll(".member-item")).map((element, index) => {
            name = element.querySelector(".member");
            role = element.querySelector(".role-tag");
            //Annahme das Liste immer gleich aufgebaut ist!!!
            id = users[index].id;
            return { id: id, name: name.textContent, role: role.textContent };
        });
        return { channelId, channelName, userList };
    }
}

export default AdminSettingsDialogView;