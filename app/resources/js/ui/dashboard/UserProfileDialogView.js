import View from "../View.js";
import {Config} from "../../utils/Config.js";

/**
 * Represents the UserProfileDialog which is shown when someone hovers over a member
 */
class UserProfileDialogView extends View {
    constructor(el){
        super();
        this.setElement(el);
        this.username = this.el.querySelector("#username");
        this.score = this.el.querySelector("#userscore");
        this.sharedChannelsContainer = this.el.querySelector("#sharedChannelsContainer");
        this.sharedChannels = this.el.querySelector("#sharedChannels");
        this.status = this.el.querySelector("#status");
        this.info = this.el.querySelector("#info");
        this.avatar = this.el.querySelector(".profile-image");
    }

    /**
     * Adjusts the position of the dialog
     * @param target hovered member-item
     */
    adjustPositionProperties(target) {
        let rect = target.getBoundingClientRect();
        this.el.style.left = (rect.left - Config.OFFSET_X_PROFILE_DIALOG) + "px";
        this.el.style.top = (rect.top - Config.OFFSET_Y_PROFILE_DIALOG) + "px";
    }

    /**
     * Fills the profile dialog with memberData
     * @param memberData data that should be filled in
     * @param userId current userId
     */
    fillWithData(memberData, userId) {
        let instance = this;
        this.username.innerHTML = memberData.name;
        if (memberData.id === userId) {
            this.sharedChannelsContainer.classList.add("hidden");
        } else {
            this.sharedChannelsContainer.classList.remove("hidden");
            this.sharedChannels.innerHTML = "";
            memberData.sharedChannels.forEach(element => {
            let li = document.createElement("li");
            li.innerHTML = element;
            instance.sharedChannels.appendChild(li);
        });
        }
        
        this.score.innerHTML = memberData.score;
        this.status.innerHTML = memberData.status;
        this.info.innerHTML = memberData.info;
        this.avatar.src = memberData.avatar;
    }
}

export default UserProfileDialogView;