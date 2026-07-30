const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, 'assets/songs');
const coversDir = path.join(__dirname, 'assets/images/covers');

if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir, { recursive: true });
}

async function generateMusicData() {
  const songFiles = fs.readdirSync(songsDir).filter(file => file.endsWith('.mp3'));
  const songs = [];

  for (let index = 0; index < songFiles.length; index++) {
    const file = songFiles[index];
    const baseName = path.basename(file, '.mp3');
    
    let artist = "Unknown Artist";
    let title = baseName;

    if (baseName.includes('-')) {
      const parts = baseName.split('-');
      artist = parts[0].trim();
      title = parts.slice(1).join('-').trim();
    }

    const formatText = (str) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const coverFileName = `${baseName}.jpg`;
    const absoluteCoverPath = path.join(coversDir, coverFileName);
    let coverPath = `assets/images/covers/${coverFileName}`;

    try {
      console.log(`🔍 Fetching cover for: ${baseName}...`);
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(baseName)}&entity=song&limit=1`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let artworkUrl = data.results[0].artworkUrl100;
        artworkUrl = artworkUrl.replace('100x100bb.jpg', '600x600bb.jpg').replace('100x100', '600x600');

        const imgResponse = await fetch(artworkUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        fs.writeFileSync(absoluteCoverPath, Buffer.from(arrayBuffer));
        console.log(`✅ Cover downloaded successfully for: ${baseName}`);
      } else {
        console.log(`⚠️ Online cover not found for ${baseName}, using default fallback.`);
        coverPath = `assets/images/covers/song1.jpg`;
      }
    } catch (error) {
      console.log(`❌ Failed to download cover for ${baseName}:`, error.message);
      coverPath = `assets/images/covers/song1.jpg`;
    }

    songs.push({
      id: index + 1,
      title: formatText(title),
      artist: formatText(artist),
      cover: coverPath,
      audio: `assets/songs/${file}`
    });
  }

  // ✨ SMART AUTOMATION: Jitne bhi gaane honge, unke indexes ki dynamic playlists ban jayengi!
  const allIndices = songs.map((_, i) => i);
  const half = Math.ceil(allIndices.length / 2);

  const fileContent = `// ----------------------
// Auto-generated Songs & Dynamic Playlists
// ----------------------
const songs = ${JSON.stringify(songs, null, 2)};

const playlists = [
  {
    id: 1,
    title: "Chill Mix",
    cover: songs[0]?.cover || "",
    songs: ${JSON.stringify(allIndices.slice(0, half))},
  },
  {
    id: 2,
    title: "All Tracks Mix",
    cover: songs[Math.min(1, songs.length - 1)]?.cover || "",
    songs: ${JSON.stringify(allIndices)},
  }
];
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), fileContent);
console.log('🚀 All Done! Successfully generated data.js with ' + songs.length + ' songs and dynamic playlists!');
}

generateMusicData();