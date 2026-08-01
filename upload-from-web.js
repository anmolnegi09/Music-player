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
let customTitle = args[1]; // Optional override if you want to type it manually

async function uploadFromYouTube() {
  if (!rawUrl) {
    console.log("❌ Error: Missing YouTube link!");
    console.log("👉 Usage: node upload-from-web.js \"YOUTUBE_LINK\"");
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

    let rawTitle = customTitle || info.title;

    // 🧠 SMART CLEANING: Strip out YouTube SEO clutter, movie names, and tags for iTunes
    let songTitle = rawTitle
      .split('|')[0]                    // Cut everything after the first '|'
      .replace(/[-–—].*/, '')           // Cut everything after a dash '-' (removes movie/artist clutter)
      .replace(/\(.*?\)/g, '')          // Remove parentheses like (Official Video)
      .replace(/\[.*?\]/g, '')          // Remove brackets like [HD]
      .replace(/lyrical|audio|video|official|hd|song|full/gi, '') // Remove common spam words
      .trim();

    // Fallback if cleaning leaves it blank
    if (!songTitle || songTitle.length < 2) {
      songTitle = rawTitle;
    }

    console.log(`🎵 Cleaned Title for iTunes: "${songTitle}"`);

    // Create a safe ID for Cloudinary using the original raw title or cleaned title
    const cleanId = rawTitle
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
      .slice(0, 50); // Keep it short

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