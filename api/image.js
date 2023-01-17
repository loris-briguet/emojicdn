const fetch = require("node-fetch");
const emojis = [
  "🥹",
  "😅",
  "🥲",
  "😇",
  "🙃",
  "😍",
  "🥰",
  "😎",
  "🥸",
  "🤩",
  "🥳",
  "🥺",
  "😢",
  "😡",
  "🤬",
  "🤯",
  "🥵",
  "🥶",
  "😱",
  "🤫",
  "🫠",
  "🤥",
  "😶",
  "🫥",
  "🙄",
  "😴",
  "🤤",
  "😵",
  "😵‍💫",
  "🤐",
  "🥴",
  "🤢",
  "🤮",
  "🤧",
  "😷",
  "🤕",
  "🤠",
  "🤡",
  "👽",
  "🎃",
  "💀",
  "👌",
  "👁",
  "🧠",
  "🧶",
  "💍",
  "🐙",
  "🌳",
  "🌸",
  "🌞",
  "🌝",
  "🌚",
  "🌍",
  "🍏",
  "🍑",
  "🍅",
  "🫒",
  "🍔",
  "🍤",
  "🍩",
  "🍪",
  "⚽️",
  "⚾️",
  "🏀",
  "🎾",
  "🎱",
  "🏵",
  "💿",
  "⏱",
  "⏰",
  "🪙",
  "⚙️",
  "🪩",
  "💝",
  "⭕️",
  "🚫",
  "🔞",
  "🚯",
  "🌐",
  "🌀",
  "🕐",
];
const allowedStyles = [
  "apple",
  "google",
  "microsoft",
  "samsung",
  "whatsapp",
  "twitter",
  "facebook",
  "joypixels",
  "openmoji",
  "emojidex",
  "messenger",
  "lg",
  "htc",
  "mozilla",
];

module.exports = async (req, res) => {
  let { emoji, style } = req.query;

  const sendError = (code, error) => {
    res.setHeader("content-type", "text/plain");
    res.status(code).send(error);
  };

  if (!style) style = "apple";
  if (!allowedStyles.includes(style.toLowerCase()))
    return sendError(400, "Invalid style.");
  const re = new RegExp(
    `<img.*src.*="(\\S.*?${style.toLowerCase()}\\S.*?)"`,
    "g"
  ); // find style within img src/srcset url

  if (emoji === "random") {
    let i = Math.floor(Math.random() * emojis.length);
    emoji = emojis[i];
  }

  const request = await fetch(
    `https://emojipedia.org/${encodeURIComponent(emoji)}`
  );
  if (!request.ok) return sendError(404, "Emoji not found.");

  const text = await request.text();
  const urlArray = text.match(re);
  if (!urlArray) return sendError(404, "Style not found for this emoji.");
  const url = urlArray[0]
    .match(/src.*?="(.*?)"/g)
    .reverse()[0]
    .replace(/src.*=/g, "")
    .replace(/"/g, "")
    .replace(" 2x", "");
  // take the last src/srcset url, since that's the highest quality
  const image = await fetch(url);

  res.setHeader("content-type", "image/png");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
  res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
  res.setHeader("Expires", "0"); // Proxies.
  res.setHeader("Surrogate-Control", "no-store");

  image.body.pipe(res);
};
