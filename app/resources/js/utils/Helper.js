class Helper {
    static setLabelColor (element, role) {
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
}

export default Helper;