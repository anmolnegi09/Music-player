const browseSection = document.querySelector(".browse-section");

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();
  
  browseSection.classList.toggle("hidden", query !== "");
  searchResults.classList.toggle("hidden", query === "");
  
  if (query) renderSearchResults(filterSongs(query));
});

const filterSongs = (query) => {
  const words = query.split(/\s+/);
  return songs.filter(song => 
    words.every(word => `${song.title} ${song.artist}`.toLowerCase().includes(word))
  );
};

const renderSearchResults = (filtered) => {
  if (!filtered.length) {
    searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-text-muted);">No songs found.</p>`;
    return;
  }
  
  searchList.innerHTML = filtered.map(song => `
    <article class="songs-card" data-index="${songs.indexOf(song)}">
      <div class="songs-left">
        <img src="${song.cover}" alt="${song.title}">
        <div class="songs-info">
          <h1>${song.title}</h1>
          <p>${song.artist}</p>
        </div>
      </div>
      <button class="more-btn"><i data-lucide="play" fill="currentColor"></i></button>
    </article>
  `).join('');
  
  lucide.createIcons();
};

searchList.addEventListener("click", (e) => {
  const card = e.target.closest(".songs-card");
  if (card) {
    currentPlaylistName = ""; 
    currentPlaylistQueue = []; 
    updatePlayingFromUI(); 
    loadSong(Number(card.dataset.index));
    playSong();
    
  }
});