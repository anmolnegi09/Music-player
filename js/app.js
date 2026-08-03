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

document.addEventListener("DOMContentLoaded", () => {
  const optionsSheet = document.getElementById("songOptionsSheet");
  const optionsOverlay = document.getElementById("optionsOverlay");
  const optCover = document.getElementById("options-cover");
  const optTitle = document.getElementById("options-title");
  const optArtist = document.getElementById("options-artist");

  // Universal click listener for any "more-btn" (the 3 dots)
  document.body.addEventListener("click", (e) => {
    const moreBtn = e.target.closest(".more-btn");
    
    if (moreBtn) {
      e.stopPropagation(); // Stop click from playing the song
      
      // Find the closest card container (works for Suggested, Featured, or Search lists)
      const songCard = moreBtn.closest(".suggested-card, .songs-card, .featured-card, .song-card");
      if (!songCard) return;

      // Extract the data from the HTML
      const coverSrc = songCard.querySelector("img").src;
      // Get title/artist text depending on your class names
      const title = songCard.querySelector("h4, h1, .player-title")?.innerText || "Unknown";
      const artist = songCard.querySelector("p, .player-artist")?.innerText || "Unknown";

      // Populate the menu
      optCover.src = coverSrc;
      optTitle.innerText = title;
      optArtist.innerText = artist;

      // Slide it up!
      optionsOverlay.classList.remove("hidden");
      optionsOverlay.classList.add("active");
      optionsSheet.classList.add("active");
    }
  });

  // Close menu when clicking the dark overlay
  optionsOverlay.addEventListener("click", () => {
    optionsSheet.classList.remove("active");
    optionsOverlay.classList.remove("active");
    
    // Hide overlay completely after animation finishes
    setTimeout(() => {
      optionsOverlay.classList.add("hidden");
    }, 300);
  });
});