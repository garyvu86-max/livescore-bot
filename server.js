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
app.get("/livescore", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto("https://www.livescore.com/en/", {
      waitUntil: "domcontentloaded",
      timeout: 0
    });

    // Lấy JSON nội bộ của Next.js
    const data = await page.evaluate(() => {
      return window.__NEXT_DATA__;
    });

    await browser.close();

    if (!data) {
      return res.json({ error: "No data found" });
    }

    // Duyệt structure để tìm match
    const matches = [];

    const stages =
      data?.props?.pageProps?.initialData?.data?.Stages || [];

    stages.forEach(stage => {
      const leagueName = stage.Snm || stage.Cnm || "Unknown League";

      stage.Events?.forEach(match => {
        matches.push({
          league: leagueName,
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