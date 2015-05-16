/// <reference path="ResourcesFile.ts"/>
/// <reference path="Tracks.ts"/>
/// <reference path="FileUtils.ts"/>

class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

window.onload = () => {
    var el = document.getElementById('content');
    //var greeter = new Greeter(el);
    //greeter.start();
    var fr = new FileUtils.Reader([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    fr.Seek(2);
    var r = fr.GetReader(4);
    el.innerHTML = r.ReadArray(3).toString();
};