document.addEventListener("DOMContentLoaded", () => {
  renderRecentSongs();
  renderPlaylists();
  renderSuggestedSongs();
  renderFeaturedPlaylists();
  renderFavoritesCount();

  loadSong(currentSongIndex);
});
