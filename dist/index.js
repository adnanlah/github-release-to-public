"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.raw({ type: "*/*" })); // raw data for
app.use(express_1.default.static(path_1.default.resolve(__dirname, "assets")));
app.set("view engine", "html");
app.set("views", path_1.default.join(__dirname, "../views"));
nunjucks_1.default.configure("views", {
    autoescape: true,
    express: app
});
app.get("/", (_req, res) => {
    try {
        // res.render("index.njk")
        res.send('gh release webhook');
    }
    catch (err) {
        res.sendStatus(500);
        res.json({ message: err.message });
    }
});
app.post("/webhook", (req, res) => {
    try {
        const signature = req.header("x-hub-signature-256");
        const hash = 'sha256=' + crypto_1.default
            .createHmac("sha256", process.env.SECRET || "")
            .update(req.body)
            .digest("hex");
        if (signature !== hash) {
            res.sendStatus(403);
        }
        else {
            const json = JSON.parse(req.body);
            console.log('signature is correct');
            res.sendStatus(200);
        }
    }
    catch (err) {
        res.sendStatus(500);
        console.log(err.message);
        res.json({ message: err.message });
    }
});
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
