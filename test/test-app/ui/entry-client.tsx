import React from "react";
import ReactDOM from "react-dom/client";
import {TestApp} from "./TestApp";
import "./index.css";

ReactDOM.hydrateRoot(
    document.getElementById("root") as HTMLElement,
    <React.StrictMode>
        <TestApp/>
    </React.StrictMode>
);
