 	const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const express = require("express");
function formatDateTime(value) {
  if (!value) return "";

  const str = value.toString();
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  const hour = str.slice(8, 10);
  const minute = str.slice(10, 12);

  return `${day}/${month}/${year} ${hour}:${minute}`;
}
puppeteer.use(StealthPlugin());
const app = express();
app.set('json spaces', 2);
app.get("/", (req, res) => {
  res.send("Livescore Bot is running 🚀");
});
app.get("/livescore", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    const page = await browser.newPage();

    let matchData = null;

    page.on("response", async (response) => {
      const url = response.url();

      if (url.includes("prod-cdn-mev-api.livescore.com/v1/api/app/date/soccer")) {
        try {
          matchData = await response.json();
        } catch (e) {}
      }
    });

    await page.goto("https://www.livescore.com/en/", {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 10000));

    await browser.close();

    if (matchData && matchData.Stages) {
  const results = [];
  matchData.Stages.forEach(stage => {
    const league = stage.Snm || stage.Cnm || "";

    if (stage.Events) {
      stage.Events.forEach(match => {
        const home = match.T1?.[0]?.Nm || "";
        const away = match.T2?.[0]?.Nm || "";
        const score = (match.Tr1 ?? "0") + " - " + (match.Tr2 ?? "0");
        const time = match.Eps || "";
        const kickoff= formatDateTime(match.Esd);

        results.push({
          league,
          home,
          away,
          score,
          time,
          kickoff 	
        });
      });
    }
  });

  res.status(200).json(results);
} else {
  res.json({ error: "No data parsed" });
}

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});