const express = require("express");
const mongoose = require("mongoose");
const { mongodb } = require("./config.json");
const validator = require("validator");

const app = express();

const { passGen } = require("visa2discord");

const db = require("./models/link");

mongoose.connect(mongodb, {}).then(() => console.log("connected to database"));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "this is the root site" });
});

app.get("/:link", async (req, res) => {
  const { link } = req.params;
  const data = await db.findOne({ shortUrl: `${req.protocol}://${req.headers.host}/${link}` });
  if (!data) {
    res.status(400).json({ status: "this is a invalid url" });
  } else {
    res.redirect(data.longUrl);
  }
});

async function getShort() {
  const short = await passGen(5);
  return short;
}

app.post("/api", async (req, res) => {
  try {
    const { longUrl } = req.body;
    if (!longUrl)
      return res
        .status(400)
        .json({ status: "You didn't provide the long URL in the body" });
    if (!validator.isURL(longUrl))
      return res.status(400).json({ status: "You must provide a valid URL" });

    let short;
    let shortUrl;
    let isShortUsed = true;

    while (isShortUsed) {
      short = await getShort();
      shortUrl = `${req.protocol}://${req.headers.host}/${short}`;
      isShortUsed = await db.findOne({ shortUrl });
    }

    await new db({ longUrl, shortUrl }).save();
    return res.status(200).json({ shortUrl });
  } catch (error) {
    res.status(500).json({ status: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
