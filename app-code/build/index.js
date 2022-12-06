"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.get("/", async (req, res) => {
    res
        .contentType("html")
        .send(`<h1>Welcome to this cool multi regional application, your current region is ${process.env.APP_REGION || "region-not-detected"}</h1>`);
});
app.listen(process.env.PORT || 3000);
