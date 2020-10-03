import View from "../View.js";

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
    }

    adjustPositionProperties(target) {
        let rect = target.getBoundingClientRect();
        this.el.style.left = (rect.left - 400) + 'px';
        this.el.style.top = (rect.top - 70) + 'px';
    }

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
    }
}

export default UserProfileDialogView;