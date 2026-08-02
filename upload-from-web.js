const cloudinary = require("cloudinary").v2;
const { execSync } = require("child_process");
const youtubedl = require('youtube-dl-exec');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

cloudinary.config({
  cloud_name: "mr2p03ci",
  api_key: "794923899358196",
  api_secret: "pEFWWmLYIvteSltroenD-rbgKFQ",
});

const args = process.argv.slice(2);
let rawUrl = args[0];
let customTitle = args[1]; // The manual override!

async function uploadFromYouTube() {
  if (!rawUrl) {
    console.log("❌ Error: Missing YouTube link!");
    console.log("👉 Usage: node upload-from-web.js \"YOUTUBE_LINK\" \"optional_custom_name\"");
    return;
  }

  let cleanUrl = rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes('youtu.be')) {
      cleanUrl = `https://www.youtube.com/watch?v=${parsed.pathname.slice(1)}`;
    } else if (parsed.searchParams.has('v')) {
      cleanUrl = `https://www.youtube.com/watch?v=${parsed.searchParams.get('v')}`;
    }
  } catch (e) {}

  try {
    console.log(`🔍 Fetching video details from YouTube...`);
    
    const info = await youtubedl(cleanUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      quiet: true,
    });

    let songTitle;
    let cleanId;

    // 🧠 THE UPGRADE: If you provide a name, use it exactly as-is. 
    // If not, try to auto-clean the YouTube title.
    if (customTitle) {
      songTitle = customTitle;
      console.log(`🎵 Using Custom Override Title: "${songTitle}"`);
      cleanId = songTitle.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase();
    } else {
      let rawTitle = info.title;
      songTitle = rawTitle
        .split('|')[0]                    
        .replace(/[-–—].*/, '')           
        .replace(/\(.*?\)/g, '')          
        .replace(/\[.*?\]/g, '')          
        .replace(/lyrical|audio|video|official|hd|song|full/gi, '') 
        .trim();

      if (!songTitle || songTitle.length < 2) {
        songTitle = rawTitle;
      }
      console.log(`🎵 Cleaned YouTube Title: "${songTitle}"`);
      cleanId = rawTitle.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase().slice(0, 50);
    }

    const tempFileName = `${cleanId}.mp3`;

    console.log(`⬇️ Extracting audio...`);
    await youtubedl(cleanUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: tempFileName,
      ffmpegLocation: `"${ffmpegPath}"`,
      jsRuntimes: 'node',
      quiet: true,
      noWarnings: true,
    });

    console.log(`☁️ Uploading to Cloudinary...`);
    await cloudinary.uploader.upload(tempFileName, {
      resource_type: "video",
      folder: "aura",
      public_id: cleanId
    });

    if (fs.existsSync(tempFileName)) {
      fs.unlinkSync(tempFileName);
    }

    console.log(`🔄 Updating music database...`);
    execSync("node get-songs.js", { stdio: "ignore" });

    console.log(`🎉 SUCCESS! "${songTitle}" is ready. Refresh your website!`);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

uploadFromYouTube();