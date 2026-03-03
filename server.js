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
      "https://www.thesportsdb.com/api/v1/json/123/livescore.php?s=Soccer"
    );

    const events = response.data?.events || [];

    const matches = events.map(match => ({
      league: match.strLeague,
      home: match.strHomeTeam,
      away: match.strAwayTeam,
      homeScore: match.intHomeScore,
      awayScore: match.intAwayScore,
      status: match.strStatus
    }));

    res.json(matches);

  } catch (err) {
    res.status(500).json({
      error: err.response?.status || err.message
    });
  }
});
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});