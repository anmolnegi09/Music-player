document.addEventListener("DOMContentLoaded", () => {
  renderRecentSongs();
  renderPlaylists();
  renderAllSongs();
  renderFavoritesCount(); 
  
  loadSong(currentSongIndex);
});