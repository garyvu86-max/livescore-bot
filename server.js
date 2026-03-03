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
      "https://prod-public-api.livescore.com/v1/api/app/date/soccer/20260303?locale=en&MD=1"
    );

    const stages = response.data?.Stages || [];
    const matches = [];

    stages.forEach(stage => {
      const league = stage.Snm || stage.Cnm || "Unknown League";

      stage.Events?.forEach(match => {
        matches.push({
          league,
          home: match.T1?.[0]?.Nm,
          away: match.T2?.[0]?.Nm,
          homeScore: match.Tr1,
          awayScore: match.Tr2,
          status: match.Eps
        });
      });
    });

    res.json(matches);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});