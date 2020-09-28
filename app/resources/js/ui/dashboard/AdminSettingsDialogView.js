import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import { EventKeys } from "../../utils/Config.js";

class SaveSettingsClickEvent extends Event {
    constructor(id) {
        super(EventKeys.SAVE_SETTINGS_CLICK, { id: id });
    }
}

let channelId, channelName, users;

function onSaveSettingsClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new SaveSettingsClickEvent(data));
}

function setListener(adminSettingsDialogView) {
    adminSettingsDialogView.el.querySelector(".save-settings")
        .addEventListener("click", onSaveSettingsClick.bind(this, adminSettingsDialogView));

    Array.from(adminSettingsDialogView.el.querySelectorAll(".member-item")).forEach(member => {
        member.querySelector(".admin").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            element.textContent = "Admin";
            setLabelColor(element, "Admin");
            //element.classList.remove("label-info","label-danger");
            //element.classList.add("label-success");
        });
        member.querySelector(".collaborator").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            element.textContent = "Collaborator";
            setLabelColor(element, "Collaborator");
            //element.classList.remove("label-success", "label-success");
            //element.classList.add("label-info");
        });
        member.querySelector(".observer").addEventListener("click", () => {
            let element = member.querySelector(".role-tag");
            element.textContent = "Observer";
            setLabelColor(element, "Observer");
            //element.classList.remove("label-success", "label-info");
            //element.classList.add("label-danger");
        });
    });
}

function setLabelColor (element, role) {
    if(role === "Admin"){
        element.classList.remove("label-info","label-danger");
        element.classList.add("label-success");
    } else if(role === "Collaborator"){
        element.classList.remove("label-success", "label-success");
        element.classList.add("label-info");
    } else {
        element.classList.remove("label-success", "label-info");
        element.classList.add("label-danger");
    }
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
            setLabelColor(member.querySelector(".role-tag"), users[index].role);
        });
    }

    setSettings(channel) {
        channelId = channel.channelId;
        channelName = channel.channelName;
        users = channel.members.map(member => {
            return { id: member.id, name: member.username, role: member.role };
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