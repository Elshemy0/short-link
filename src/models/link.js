const mongoose = require("mongoose")
const Schema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String
})
module.exports = mongoose.model("short", Schema)