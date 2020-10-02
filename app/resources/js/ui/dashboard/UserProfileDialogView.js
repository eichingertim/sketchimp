import View from "../View.js";

class UserProfileDialogView extends View {
    constructor(el){
        super();
        this.setElement(el);
    }

    setDialogPosition(target){
        let x = target.offsetLeft, y = target.offsetTop;
        return {x: x,y: y};
    }
}

export default UserProfileDialogView;