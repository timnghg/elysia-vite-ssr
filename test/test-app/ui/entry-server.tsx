import React from "react";
import {renderToString} from "react-dom/server";
import {TestApp} from "./TestApp";
import "./index.css";

interface IRenderProps {
    path: string;
}

export async function render({path}: IRenderProps): Promise<string> {
    return renderToString(
        <React.StrictMode>
            <TestApp/>
        </React.StrictMode>
    );
}
