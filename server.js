const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const express = require("express");

puppeteer.use(StealthPlugin());

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
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://www.livescore.com/en/", {
      waitUntil: "networkidle2",
    });

    await new Promise(r => setTimeout(r, 8000));

    await browser.close();

    res.json({ message: "Puppeteer ran successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});