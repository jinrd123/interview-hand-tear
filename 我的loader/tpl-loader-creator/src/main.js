import tpl from "./info.tpl";

const oApp = document.querySelector("#app");

const info = {
    name: "jrd",
    hobby: "web code"
}

console.log(info);

oApp.innerHTML = tpl(info);