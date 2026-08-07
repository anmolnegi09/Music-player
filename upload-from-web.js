const cloudinary = require("cloudinary").v2;
const { execSync } = require("child_process");
const youtubedl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");

cloudinary.config({
  cloud_name: "mr2p03ci",
  api_key: "794923899358196",
  api_secret: "pEFWWmLYIvteSltroenD-rbgKFQ",
});

const args = process.argv.slice(2);
let rawUrl = args[0]; 
let customTitle = args[1]; 

async function uploadFromYouTube() {
  if (!rawUrl) return console.log("❌ Error: Missing YouTube link!");

  let cleanUrl = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes("youtu.be")) cleanUrl = `https://www.youtube.com/watch?v=${parsed.pathname.slice(1)}`;
    else if (parsed.searchParams.has("v")) cleanUrl = `https://www.youtube.com/watch?v=${parsed.searchParams.get("v")}`;
  } catch (e) {}

  let tempFileName = ""; 

  try {
    console.log(`🔍 Fetching video details...`);
    const info = await youtubedl(cleanUrl, {
      dumpSingleJson: true, noWarnings: true, quiet: true, cookies: "cookies.txt", noPlaylist: true,
    });

    let songTitle;
    let cleanId;

    if (customTitle) {
      songTitle = customTitle;
      cleanId = songTitle.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").toLowerCase();
    } else {
      let rawTitle = info.title;
      songTitle = rawTitle.split("|")[0].replace(/[-–—].*/, "").replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").replace(/lyrical|audio|video|official|hd|song|full/gi, "").trim();
      if (!songTitle || songTitle.length < 2) songTitle = rawTitle;
      cleanId = rawTitle.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").toLowerCase().slice(0, 50);
    }

    tempFileName = `${cleanId}.mp3`;
    
    const ytArtist = info.artist || info.uploader || info.channel || "Unknown Artist";
    const safeArtist = ytArtist.replace(/[/\\?%*:|"<>=\n|]/g, '').trim();

    console.log(`⬇️ Extracting audio...`);
    await youtubedl(cleanUrl, {
      extractAudio: true, audioFormat: "mp3", format: "bestaudio", noPlaylist: true, output: `${cleanId}.%(ext)s`, ffmpegLocation: `"${ffmpegPath}"`, cookies: "cookies.txt", quiet: true, noWarnings: true,
    });

    console.log(`☁️ Uploading to Cloudinary with Artist tags...`);
    
    await cloudinary.uploader.upload(tempFileName, {
      resource_type: "video", folder: "aura", public_id: cleanId, context: `artist=${safeArtist}`
    });

    console.log(`🔄 Updating music database...`);
    execSync("node get-songs.js", { stdio: "ignore" });
    console.log(`🎉 SUCCESS! "${songTitle}" is ready.`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (tempFileName && fs.existsSync(tempFileName)) fs.unlinkSync(tempFileName);
  }
}

uploadFromYouTube();