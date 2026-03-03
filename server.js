 	const { google } = require("googleapis");
const express = require("express");
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");



const app = express();
app.set("json spaces", 2);

async function writeToSheet(matches) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const values = matches.map(m => [
    m.league,
    m.home,
    m.away,
    m.score,
    m.status,
    new Date().toLocaleString()
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A:F",
    valueInputOption: "RAW",
    requestBody: { values }
  });
}	

// Root route
app.get("/", (req, res) => {
  res.send("Livescore Bot is running 🚀");
});

// Livescore route
const axios = require("axios");

app.get("/livescore", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await axios.get(
      "https://v3.football.api-sports.io/status",
      {
        headers: {
          "x-apisports-key": process.env.FOOTBALL_API_KEY
        }
      }
    );

     console.log("TOTAL FIXTURES:", response.data.response.length);

    const matches = response.data.response.map(match => ({
      league: match.league.name,
      home: match.teams.home.name,
      away: match.teams.away.name,
      score: `${match.goals.home} - ${match.goals.away}`,
      status: match.fixture.status.short
    }));

    await writeToSheet(matches);
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