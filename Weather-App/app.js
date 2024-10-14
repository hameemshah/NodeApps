const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req, res) {
    const query = req.body.cityName;
    const apiKey = "cfb1025c11fe38b6f2d4be6c27976790";
    const units = "metric";
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + query + '&appid=cfb1025c11fe38b6f2d4be6c27976790&units=metric';

    https.get(url, function(response) {
        console.log(response.statusCode);

        response.on("data", function(data) {
            const weatherData  = JSON.parse(data)
            const temp = weatherData.main.temp;
            const desc = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            res.write("<p>The weather is currently " + desc + "</p>");
            res.write("<h1>The temperature in " + query + " is " + temp + " degree Celcius.</h1>");
            const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
            res.write("<img src=" + imageURL + ">");
            res.send();
        })
    })
})

app.listen(3000, function() {
    console.log("Server is running on port 3000.");
})