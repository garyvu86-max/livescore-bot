const express = require("express");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");



const app = express();
app.set("json spaces", 2);

// Root route
app.get("/", (req, res) => {
  res.send("Livescore Bot is running 🚀");
});

// Livescore route
const axios = require("axios");

app.get("/livescore", async (req, res) => {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY
        }
      }
    );

    const matches = response.data.response.map(match => ({
      league: match.league.name,
      home: match.teams.home.name,
      away: match.teams.away.name,
      score: `${match.goals.home} - ${match.goals.away}`,
      status: match.fixture.status.short
    }));

    res.json(matches);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});