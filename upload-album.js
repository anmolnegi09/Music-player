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
let playlistUrl = args[0];

try {
  const parsed = new URL(playlistUrl);
  if (parsed.searchParams.has("list")) {
    playlistUrl = `https://www.youtube.com/playlist?list=${parsed.searchParams.get("list")}`;
  }
} catch(e) {}

async function getExistingSongIds() {
  try {
    const result = await cloudinary.api.resources({
      resource_type: "video", type: "upload", prefix: "aura/", max_results: 500,
    });
    return new Set(result.resources.map(res => res.public_id.replace("aura/", "")));
  } catch (err) {
    return new Set();
  }
}

function cleanTitle(rawTitle) {
  let title = rawTitle.split("|")[0].replace(/[-–—].*/, "").replace(/\(.*?\)/g, "").replace(/\[.*?\]/g, "").replace(/lyrical|audio|video|official|hd|song|full/gi, "").trim();
  if (!title || title.length < 2) title = rawTitle;
  const cleanId = rawTitle.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_").toLowerCase().slice(0, 50);
  return { songTitle: title, cleanId };
}

async function uploadAlbumFromYouTube() {
  if (!playlistUrl) return console.log("❌ Error: Missing album/playlist link!");

  const existingIds = await getExistingSongIds();
  let playlistInfo;
  
  try {
    playlistInfo = await youtubedl(playlistUrl, { dumpSingleJson: true, flatPlaylist: true, cookies: "cookies.txt", quiet: true });
  } catch (err) {
    return console.error("❌ Failed to read playlist details:", err.message);
  }

  const tracks = playlistInfo.entries || [];
  console.log(`🎶 Found ${tracks.length} track(s) in this album/playlist.\n`);
  let downloadedCount = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const videoUrl = `https://www.youtube.com/watch?v=${track.id}`;
    const { songTitle, cleanId } = cleanTitle(track.title);

    if (existingIds.has(cleanId)) {
      console.log(`[${i + 1}/${tracks.length}] ⏭️ SKIP: "${songTitle}" is already in your library!`);
      continue;
    }

    const tempFileName = `${cleanId}.mp3`;
    
    // 🌟 Extract Artist & YouTube Music Cover Image!
    const ytArtist = track.uploader || track.channel || "Unknown Artist"; 
    const safeArtist = ytArtist.replace(/[/\\?%*:|"<>=\n|]/g, '').trim();
    let ytCover = "";
    if (track.thumbnails && track.thumbnails.length > 0) {
      ytCover = track.thumbnails[track.thumbnails.length - 1].url.split("?")[0];
    }

    try {
      console.log(`[${i + 1}/${tracks.length}] ⬇️ Extracting: "${songTitle}"...`);
      await youtubedl(videoUrl, {
        extractAudio: true, audioFormat: "mp3", format: "bestaudio", noPlaylist: true, output: `${cleanId}.%(ext)s`, ffmpegLocation: `"${ffmpegPath}"`, cookies: "cookies.txt", quiet: true, noWarnings: true,
      });

      // 🌟 Inject the artist and cover tags!
      await cloudinary.uploader.upload(tempFileName, {
        resource_type: "video", folder: "aura", public_id: cleanId, context: `artist=${safeArtist}|cover=${ytCover}`
      });

      downloadedCount++;
    } catch (err) {
      console.error(`❌ Error downloading "${songTitle}":`, err.message);
    } finally {
      if (fs.existsSync(tempFileName)) fs.unlinkSync(tempFileName);
    }
  }

  if (downloadedCount > 0) {
    console.log("\n🔄 Updating music database...");
    execSync("node get-songs.js", { stdio: "ignore" });
    console.log(`🎉 SUCCESS! Added ${downloadedCount} new song(s).`);
  } else {
    console.log("🎉 All songs are already in your library!");
  }
}

uploadAlbumFromYouTube();