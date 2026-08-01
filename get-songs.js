const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

console.log("🚀 Script start ho gayi hai (Smart Cleanup enabled)...");

// 🔒 Security Warning: Hardcoding API keys is dangerous if uploaded to GitHub!
// Best practice is to use process.env for secrets. I kept your keys as fallbacks
// so the script doesn't break, but consider moving these to a .env file later.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "mr2p03ci",
  api_key: process.env.CLOUDINARY_API_KEY || "794923899358196",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "pEFWWmLYIvteSltroenD-rbgKFQ",
});

async function fetchFromiTunes(cleanQuery) {
  if (!cleanQuery) return null; // Failsafe for empty queries

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=1`,
    );

    // Added failsafe to check if the network request actually succeeded
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const track = data.results[0];

      // Improved replacement using optional chaining to prevent crashes
      const hdCover =
        track.artworkUrl100?.replace("100x100bb.jpg", "600x600bb.jpg") || null;

      return {
        cover: hdCover,
        artist: track.artistName || null,
        title: track.trackName || null,
      };
    }
  } catch (e) {
    // Switched to warn so it stands out, but doesn't halt the entire loop
    console.warn(`⚠️ iTunes fetch failed for "${cleanQuery}":`, e.message);
  }
  return null;
}

async function generateSongsData() {
  try {
    console.log("🌐 Cloudinary se gaane fetch ho rahe hain...");

    const result = await cloudinary.search
      .expression("folder:aura AND resource_type:video")
      .max_results(50)
      .execute();

    // Guard against empty or failed Cloudinary responses
    if (!result || !result.resources) {
      throw new Error("Cloudinary returned invalid or empty data.");
    }

    const filteredResources = result.resources.filter((file) => {
      // Safely access public_id in case a file object is corrupted
      const name = file.public_id?.toLowerCase() || "";
      return !name.includes("sample") && !name.includes("cld-");
    });

    console.log(
      `✅ Total gaane mile: ${filteredResources.length}. Cleanup aur iTunes matching shuru hai...`,
    );

    const songsArray = [];

    for (let index = 0; index < filteredResources.length; index++) {
      const file = filteredResources[index];

      // Fallback for public_id to prevent string manipulation crashes
      const rawName = (file.public_id || `unknown_${index}`).split("/").pop();

      // 1. File ke naam se piche ke random hashes (jaise _qm9ak8, _tvhrey) ko hatao
      let baseName = rawName.replace(/\.[^/.]+$/, "");
      baseName = baseName.replace(/[-_][a-zA-Z0-9]{5,7}$/, "");
      const cleanQuery = baseName.replace(/[-_]/g, " ").trim();

      // 2. Apple iTunes se asli data fetch karo[cite: 7]
      const iTunesData = await fetchFromiTunes(cleanQuery);

      songsArray.push({
        id: index + 1,
        // Strict fallbacks so 'undefined' never gets written to your data.js file[cite: 7]
        title: iTunesData?.title || cleanQuery || "Unknown Title",
        artist: iTunesData?.artist || "Unknown Artist",
        cover:
          iTunesData?.cover ||
          "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
        audio: file.secure_url || "",
      });
    }

    const fileContent =
      `// js/data.js (Auto-generated & Cleaned)\n` +
      `let songs = ${JSON.stringify(songsArray, null, 2)};\n\n` +
      `let playlists = [\n` +
      `  {\n` +
      `    id: 1,\n` +
      `    title: "All Tracks Mix",\n` +
      `    cover: songs[0]?.cover || "",\n` +
      `    songs: songs.map((_, i) => i),\n` +
      `  }\n` +
      `];\n`;

    // CRITICAL FIX: Ensure the 'js' directory actually exists before trying to write into it
    const dirPath = path.join(__dirname, "js");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const outputPath = path.join(dirPath, "data.js");
    fs.writeFileSync(outputPath, fileContent, "utf8");

    console.log("🎉 SUCCESS! 'js/data.js' clean ho kar update ho gayi hai!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

generateSongsData();
