const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

console.log("🚀 Script start ho gayi hai (Bulletproof Preserve + YouTube Covers enabled)...");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "mr2p03ci",
  api_key: process.env.CLOUDINARY_API_KEY || "794923899358196",
  api_secret: process.env.CLOUDINARY_API_SECRET || "pEFWWmLYIvteSltroenD-rbgKFQ",
});

async function fetchFromiTunes(cleanQuery) {
  if (!cleanQuery) return null;

  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&limit=5`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      let bestTrack = data.results[0]; 

      for (const track of data.results) {
        const albumName = (track.collectionName || "").toLowerCase();
        const trackName = (track.trackName || "").toLowerCase();
        const artistName = (track.artistName || "").toLowerCase();

        const isJunk = albumName.includes("workout") || albumName.includes("karaoke") || trackName.includes("karaoke") || albumName.includes("tribute") || artistName.includes("cover");
        if (!isJunk) { bestTrack = track; break; }
      }

      const hdCover = bestTrack.artworkUrl100?.replace("100x100bb.jpg", "600x600bb.jpg") || null;
      return { cover: hdCover, artist: bestTrack.artistName || null, title: bestTrack.trackName || null };
    }
  } catch (e) { console.warn(`⚠️ iTunes fetch failed for "${cleanQuery}":`, e.message); }
  return null;
}

async function generateSongsData() {
  try {
    const dirPath = path.join(__dirname, "js");
    const outputPath = path.join(dirPath, "data.js");

    let existingSongsMap = new Map();
    if (fs.existsSync(outputPath)) {
      try {
        const existingContent = fs.readFileSync(outputPath, "utf8");
        const match = existingContent.match(/let\s+songs\s*=\s*(\[[\s\S]*?\])\s*;/);
        
        if (match && match[1]) {
          const existingSongs = new Function("return " + match[1])();
          existingSongs.forEach(song => { if (song.audio) existingSongsMap.set(song.audio, song); });
          console.log(`📦 Found ${existingSongsMap.size} existing songs. Manual edits STRICTLY protected!`);
        }
      } catch (err) { console.error("❌ WARNING: Failed to read existing data.js."); }
    }

    console.log("🌐 Cloudinary se gaane fetch ho rahe hain...");

    const result = await cloudinary.search
      .expression("folder:aura AND resource_type:video")
      .max_results(500)
      .with_field("context") 
      .execute();

    if (!result || !result.resources) throw new Error("Cloudinary returned invalid or empty data.");

    const filteredResources = result.resources.filter((file) => {
      const name = file.public_id?.toLowerCase() || "";
      return !name.includes("sample") && !name.includes("cld-");
    });

    console.log(`✅ Total gaane mile: ${filteredResources.length}. Processing started...`);
    const songsArray = [];

    for (let index = 0; index < filteredResources.length; index++) {
      const file = filteredResources[index];
      const audioUrl = file.secure_url || "";

      if (existingSongsMap.has(audioUrl)) {
        const savedSong = existingSongsMap.get(audioUrl);
        savedSong.id = index + 1; 
        songsArray.push(savedSong);
        continue; 
      }

      const rawName = (file.public_id || `unknown_${index}`).split("/").pop();
      let baseName = rawName.replace(/\.[^/.]+$/, "").replace(/[-_][a-zA-Z0-9]{5,7}$/, "");
      const cleanQuery = baseName.replace(/[-_]/g, " ").trim();

      // 🌟 Read our secret tags from Cloudinary!
      let ytArtist = file.context?.artist || file.context?.custom?.artist || "";
      let ytCover = file.context?.cover || file.context?.custom?.cover || "";

      let exactSearchQuery = cleanQuery;
      if (ytArtist && !ytArtist.toLowerCase().includes("unknown")) {
        let cleanArtist = ytArtist.replace(/vevo|official|channel|topic|music/gi, "").trim().replace(/([a-z])([A-Z])/g, '$1 $2'); 
        exactSearchQuery = `${cleanQuery} ${cleanArtist}`.trim();
      }

      const iTunesData = await fetchFromiTunes(exactSearchQuery);

      songsArray.push({
        id: index + 1,
        title: iTunesData?.title || cleanQuery || "Unknown Title",
        artist: ytArtist || iTunesData?.artist || "Unknown Artist",
        // 🌟 FORCE YOUTUBE COVER FIRST! Only use iTunes if YT Cover is totally missing.
        cover: ytCover || iTunesData?.cover || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
        audio: audioUrl,
      });
      
      console.log(`✨ Fetched new data for: "${exactSearchQuery}"`);
    }

    const fileContent = `// js/data.js (Auto-generated & Cleaned)\n` + `let songs = ${JSON.stringify(songsArray, null, 2)};\n\n` + `let playlists = [\n` + `  {\n` + `    id: 1,\n` + `    title: "All Tracks Mix",\n` + `    cover: songs[0]?.cover || "",\n` + `    songs: songs.map((_, i) => i),\n` + `  }\n` + `];\n`;

    // const dirPath = path.join(__dirname, "js");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(outputPath, fileContent, "utf8");
    console.log("🎉 SUCCESS! 'js/data.js' is updated safely!");
  } catch (error) { console.error("❌ Error:", error.message); }
}

generateSongsData();