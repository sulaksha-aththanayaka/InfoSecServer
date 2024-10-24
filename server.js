const express = require("express");
require('dotenv').config()
const app = express();
const cors = require("cors");
const connectDB = require("./config/connectDatabase");

app.use(express.json());



app.use(
    cors({
        origin: ["http://localhost:3000"],
        methods: "GET,POST,PUT,DELETE,OPTIONS",
    })
);




app.use(require("./routes/submitFiles"));

app.get("/", (req, res) => {
    return res.json({
        message: "Server is running",
        active: true,
    });
});

app.listen(5000, () => {
    console.log("Node Server running on  port 5000");
});

connectDB();