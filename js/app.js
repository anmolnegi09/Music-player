document.addEventListener("DOMContentLoaded", () => {
  const savedIndex = localStorage.getItem("currentSongIndex");
  if (savedIndex !== null && songs && songs[Number(savedIndex)]) {
    currentSongIndex = Number(savedIndex);
  } else {
    currentSongIndex = 0;
  }

  if (songs && songs.length > 0) {
    loadSong(currentSongIndex);
  }

  renderRecentSongs();
  renderPlaylists();
  renderSuggestedSongs();
  renderFeaturedPlaylists();
  renderFavoritesCount();
});