// ----------------------
// Local Storage
// ----------------------

if (savedSong !== null) {
  currentSongIndex = Number(savedSong);
} else {
  currentSongIndex = Math.floor(Math.random() * songs.length);
}

// ----------------------
// Liked Songs Storage
// ----------------------

function getLikedSongs() {
  return JSON.parse(localStorage.getItem("likedSongs")) || [];
}

function toggleLikedSong(index) {
  let liked = getLikedSongs();
  
  if (liked.includes(index)) {
    liked = liked.filter(i => i !== index); // Un-like (remove)
  } else {
    liked.unshift(index); // Like (add to start)
  }
  
  localStorage.setItem("likedSongs", JSON.stringify(liked));
  return liked.includes(index); // Naya status return karega
}