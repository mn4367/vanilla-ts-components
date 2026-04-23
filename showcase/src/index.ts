import { initializeApp } from "./App.js";


const root = document.getElementById("app");
root
    ? initializeApp(root)
    : document.body.appendChild(new Text("No root element with ID 'app' found!"));
