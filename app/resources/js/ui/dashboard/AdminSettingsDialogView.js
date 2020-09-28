import View from "../View.js";
import { Event } from "../../utils/Observable.js";
import {EventKeys} from "../../utils/Config.js";

class SaveSettingsClickEvent extends Event {
    constructor(id) {
        super(EventKeys.SAVE_SETTINGS_CLICK, {id: id});
    }
}

let channelId, channelName, users, userId, userName, userRole;

function onSaveSettingsClick(adminSettingsDialogView, data) {
    adminSettingsDialogView.notifyAll(new SaveSettingsClickEvent(data));
}

function setListener(adminSettingsDialogView) {
    adminSettingsDialogView.el.querySelector(".save-settings")
        .addEventListener("click", onSaveSettingsClick.bind(this, adminSettingsDialogView));
}

class AdminSettingsDialogView extends View {
    constructor(el) {
        super();
        this.setElement(el);
        setListener(this);
    }

    resetValues() {
        this.el.querySelector(".form-control").value = channelName;
    }

    setSettings(channel) {
        channelId = channel.channelId;
        channelName = channel.channelName;
        
        console.log(channel.channelName);
    }

    getSettings() {
    //ich brauche
    //channelId, channelName, Users & Roles
        let users, channelName, channelId, userId, userRole, userList, name;
        channelName = this.el.querySelector(".form-control").value;
        //channelId = this.el.querySelector(".channel-name").textContent;
        userList = this.el.querySelectorAll(".member-item");
        users = Array.from(userList).map(element => {
            name = element.querySelector(".member").textContent;
            return { name: name, role: "todo" };
        });

        return { channelName, users };
    }
}

export default AdminSettingsDialogView;