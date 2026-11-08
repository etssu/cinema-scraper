const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.get("/cinema", async (req, res) => {
    try {
        const url = req.query.url;

        const response = await fetch(url);
        const html = await response.text();

        res.send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log("Proxy running on port 3000");
});