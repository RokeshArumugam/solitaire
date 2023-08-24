var loadPartsDir = "COMPONENTS/"
let imagesDir = "IMAGES/";
let isTouchScreenDevice = ("ontouchstart" in window) || ("onmsgesturechange" in window);
let parseBoolean = value => value == "true";

function customAlert(title, text) {
    document.getElementsByClassName("alert__box__header__title")[0].innerHTML = title;
    document.getElementsByClassName("alert__box__text")[0].innerHTML = text;
    document.getElementsByClassName("alert")[0].classList.add("alert--show");
};