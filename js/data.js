// ----------------------
// Songs
// ----------------------
const songs = [
  {
    id: 1,
    title: "4 minutes",
    artist: "Maddona",
    cover: "assets/images/covers/song1.jpg",
    audio: "assets/songs/4minutes.mp3",
  },
  {
    id: 2,
    title: "Boom Shaka",
    artist: "Kr$na",
    cover: "assets/images/covers/song2.jpg",
    audio: "assets/songs/boom-shaka.mp3",
  },
  {
    id: 3,
    title: "Dura",
    artist: "Daddy Yankee",
    cover: "assets/images/covers/song3.jpg",
    audio: "assets/songs/dura.mp3",
  },
  {
    id: 4,
    title: "I want it that way",
    artist: "Backstreet Boys",
    cover: "assets/images/covers/song4.jpg",
    audio: "assets/songs/I-want-it-that-way.mp3",
  },
  {
    id: 5,
    title: "La isla bonita",
    artist: "Maddona",
    cover: "assets/images/covers/song5.jpg",
    audio: "assets/songs/la-isla-bonita.mp3",
  },
  {
    id: 6,
    title: "Persona 4 Opening",
    artist: "Atlus",
    cover: "assets/images/covers/song6.jpg",
    audio: "assets/songs/persona4-opening.mp3",
  },
  {
    id: 7,
    title: "Sparkle",
    artist: "Radwipms",
    cover: "assets/images/covers/song7.jpg",
    audio: "assets/songs/sparkle.mp3",
  },
  {
    id: 8,
    title: "Sunflower",
    artist: "Post Melone",
    cover: "assets/images/covers/song8.jpg",
    audio: "assets/songs/sunflower.mp3",
  },
  {
    id: 9,
    title: "Thousand Miles",
    artist: "Vanessa",
    cover: "assets/images/covers/song9.jpg",
    audio: "assets/songs/thousand-miles.mp3",
  },
  {
    id: 10,
    title: "We go on",
    artist: "Bia",
    cover: "assets/images/covers/song10.jpg",
    audio: "assets/songs/we-go-on.mp3",
  },
  {
    id: 11,
    title: "Zenzense",
    artist: "Radwimps",
    cover: "assets/images/covers/song11.jpg",
    audio: "assets/songs/zenzense.mp3",
  },
  {
    id: 12,
    title: "Without Me",
    artist: "Eminem",
    cover: "assets/images/covers/song12.jpg",
    audio: "assets/songs/without-me.mp3",
  },
  {
    id: 13,
    title: "Beat it",
    artist: "Michael Jackson",
    cover: "assets/images/covers/song13.jpg",
    audio: "assets/songs/beat-it.mp3",
  },
  {
    id: 14,
    title: "Bumpy Ride",
    artist: "Mohombi",
    cover: "assets/images/covers/song14.jpg",
    audio: "assets/songs/bumpy-ride.mp3",
  },
  {
    id: 15,
    title: "APT",
    artist: "Rose & Bruno Mars",
    cover: "assets/images/covers/song15.jpg",
    audio: "assets/songs/apt.mp3",
  },
  {
    id: 16,
    title: "Blinding Lights",
    artist: "The Weeknd",
    cover: "assets/images/covers/song16.jpg",
    audio: "assets/songs/blinding-lights.mp3",
  },
  {
    id: 17,
    title: "Bye Bye Bye",
    artist: "NSYNC",
    cover: "assets/images/covers/song17.jpg",
    audio: "assets/songs/bye.mp3",
  },
  {
    id: 18,
    title: "One Love",
    artist: "Blue",
    cover: "assets/images/covers/song18.jpg",
    audio: "assets/songs/one-love.mp3",
  },
  {
    id: 19,
    title: "Stereo Hearts",
    artist: "Gym class Heroes",
    cover: "assets/images/covers/song19.jpg",
    audio: "assets/songs/stereo-hearts.mp3",
  },
];

// ----------------------
// Playlists
// ----------------------
const playlists = [
  {
    id: 1,
    title: "Chill Mix",
    cover: songs[0].cover,
    songs: [0, 3, 5, 7, 9],
  },
  {
    id: 2,
    title: "Workout",
    cover: songs[2].cover,
    songs: [2, 4, 6, 8, 10],
  },
  {
    id: 3,
    title: "Coding Buzz",
    cover: songs[1].cover,
    songs: [1, 13, 4, 15, 6, 17, 8, 18, 11],
  },
];
