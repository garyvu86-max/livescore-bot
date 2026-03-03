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

    let matchData = null;

    // Bắt response JSON từ Livescore API
    page.on("response", async (response) => {
      const url = response.url();

      if (url.includes("/api/") && url.includes("match")) {
        try {
          const json = await response.json();
          matchData = json;
        } catch (e) {}
      }
    });

    await page.goto("https://www.livescore.com/en/", {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    // Chờ vài giây cho API load
    await new Promise(r => setTimeout(r, 5000));

    await browser.close();

    if (!matchData) {
      return res.json({ error: "No match API captured" });
    }

    res.json(matchData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});