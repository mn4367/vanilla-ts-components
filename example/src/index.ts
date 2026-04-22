const start = Date.now();

import { ExampleApp } from "./App.js";
import { EventBus } from "./EventBus.js";


/** Create and mount the example app to the document body. */
const app = new ExampleApp(document.body);
/** Make this app instance globally available.  */
export const APP = app;
/** Initialize the app. */
app.initialize();

EventBus.emit("AppLoaded", Date.now() - start);
