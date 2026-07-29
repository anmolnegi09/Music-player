// ----------------------
// Search Logic & Genres
// ----------------------

const browseSection = document.querySelector(".browse-section");

searchInput.addEventListener("input", handleSearch);

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();

  // Agar user ne input clear kar diya, toh wapas Genres dikhao
  if (query === "") {
    browseSection.classList.remove("hidden");
    searchResults.classList.add("hidden");
    return;
  }

  // Agar user type kar raha hai, toh Genres chupao, Results dikhao
  browseSection.classList.add("hidden");
  searchResults.classList.remove("hidden");

  const filteredSongs = filterSongs(query);
  renderSearchResults(filteredSongs);
}

function filterSongs(query) {
  const words = query.trim().toLowerCase().split(/\s+/);

  return songs.filter((song) => {
    const text = `${song.title} ${song.artist}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

function renderSearchResults(filteredSongs) {
  let html = "";

  if (filteredSongs.length === 0) {
    searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-text-muted);">No songs found for your search.</p>`;
    return;
  }

  filteredSongs.forEach((song) => {
    const index = songs.indexOf(song);

    // Hum All Songs wali 'songs-card' layout use kar rahe hain
    html += `
      <article class="songs-card" data-index="${index}">
        <div class="songs-left">
          <img src="${song.cover}" alt="${song.title}">
          <div class="songs-info">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
          </div>
        </div>
        <button class="more-btn">
          <i data-lucide="play" fill="currentColor"></i>
        </button>
      </article>
    `;
  });

  searchList.innerHTML = html;
  lucide.createIcons();

  // Click on search result to play
  searchList.querySelectorAll(".songs-card").forEach((card) => {
    card.addEventListener("click", () => {
      loadSong(Number(card.dataset.index));
      playSong();
      
      // Gaana chalte hi full player khol de
      const searchScreen = document.querySelector('.search-screen');
      if(searchScreen) searchScreen.classList.add("hidden");
      playerScreen.classList.remove("hidden");
    });
  });
}