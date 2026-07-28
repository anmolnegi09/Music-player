// ----------------------
// Local Storage
// ----------------------

if (savedSong !== null) {
  currentSongIndex = Number(savedSong);
} else {
  currentSongIndex = Math.floor(Math.random() * songs.length);
}

