// ----------------------
// Auto-generated Songs & Dynamic Playlists
// ----------------------
const songs = [
  {
    "id": 1,
    "title": "Headlights",
    "artist": "Alok, Alan Walker",
    "cover": "assets/images/covers/Alok, Alan Walker - Headlights.jpg",
    "audio": "assets/songs/Alok, Alan Walker - Headlights.mp3"
  },
  {
    "id": 2,
    "title": "I Want It That Way",
    "artist": "Backstreet Boys",
    "cover": "assets/images/covers/Backstreet Boys - I Want It That Way.jpg",
    "audio": "assets/songs/Backstreet Boys - I Want It That Way.mp3"
  },
  {
    "id": 3,
    "title": "One Love",
    "artist": "Blue",
    "cover": "assets/images/covers/Blue - One Love.jpg",
    "audio": "assets/songs/Blue - One Love.mp3"
  },
  {
    "id": 4,
    "title": "Rasputin",
    "artist": "Boney M",
    "cover": "assets/images/covers/Boney M - Rasputin.jpg",
    "audio": "assets/songs/Boney M - Rasputin.mp3"
  },
  {
    "id": 5,
    "title": "Perfect",
    "artist": "Ed Sheeran",
    "cover": "assets/images/covers/Ed Sheeran - Perfect.jpg",
    "audio": "assets/songs/Ed Sheeran - Perfect.mp3"
  },
  {
    "id": 6,
    "title": "Shape Of You",
    "artist": "Ed Sheeran",
    "cover": "assets/images/covers/Ed Sheeran - Shape of You.jpg",
    "audio": "assets/songs/Ed Sheeran - Shape of You.mp3"
  },
  {
    "id": 7,
    "title": "Without Me",
    "artist": "Eminem",
    "cover": "assets/images/covers/Eminem - Without Me.jpg",
    "audio": "assets/songs/Eminem - Without Me.mp3"
  },
  {
    "id": 8,
    "title": "Stereo Hearts",
    "artist": "Gym Class Heroes",
    "cover": "assets/images/covers/Gym Class Heroes - Stereo Hearts.jpg",
    "audio": "assets/songs/Gym Class Heroes - Stereo Hearts.mp3"
  },
  {
    "id": 9,
    "title": "La Isla Bonita",
    "artist": "Madonna",
    "cover": "assets/images/covers/Madonna - La Isla Bonita.jpg",
    "audio": "assets/songs/Madonna - La Isla Bonita.mp3"
  },
  {
    "id": 10,
    "title": "Beat It",
    "artist": "Michael Jackson",
    "cover": "assets/images/covers/Michael Jackson - Beat It.jpg",
    "audio": "assets/songs/Michael Jackson - Beat It.mp3"
  },
  {
    "id": 11,
    "title": "Cheri Cheri Lady",
    "artist": "Modern Talking",
    "cover": "assets/images/covers/Modern Talking - Cheri Cheri Lady.jpg",
    "audio": "assets/songs/Modern Talking - Cheri Cheri Lady.mp3"
  },
  {
    "id": 12,
    "title": "Bye Bye Bye",
    "artist": "NSYNC",
    "cover": "assets/images/covers/NSYNC - Bye Bye Bye.jpg",
    "audio": "assets/songs/NSYNC - Bye Bye Bye.mp3"
  },
  {
    "id": 13,
    "title": "Sunflower",
    "artist": "Post Malone, Swae Lee",
    "cover": "assets/images/covers/Post Malone, Swae Lee - Sunflower.jpg",
    "audio": "assets/songs/Post Malone, Swae Lee - Sunflower.mp3"
  },
  {
    "id": 14,
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "cover": "assets/images/covers/The Weeknd - Blinding Lights.jpg",
    "audio": "assets/songs/The Weeknd - Blinding Lights.mp3"
  },
  {
    "id": 15,
    "title": "Starboy",
    "artist": "The Weeknd",
    "cover": "assets/images/covers/The Weeknd - Starboy.jpg",
    "audio": "assets/songs/The Weeknd - Starboy.mp3"
  }
];

const playlists = [
  {
    id: 1,
    title: "Chill Mix",
    cover: songs[0]?.cover || "",
    songs: [0,1,2,3,4,5,6,7],
  },
  {
    id: 2,
    title: "All Tracks Mix",
    cover: songs[Math.min(1, songs.length - 1)]?.cover || "",
    songs: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
  }
];
