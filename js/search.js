// search.js
const browseSection = document.querySelector(".browse-section");

// ==========================================
// 1. RECENT SEARCHES STORAGE & RENDER LOGIC
// ==========================================
const getRecentSearches = () => JSON.parse(localStorage.getItem('recentSearches')) || [];

const saveRecentSearch = (songIndex) => {
  let searches = getRecentSearches();
  searches = searches.filter(id => id !== songIndex); // Remove duplicate if it exists
  searches.unshift(songIndex); // Add to the very top
  searches = searches.slice(0, 5); // Keep only the top 5
  localStorage.setItem('recentSearches', JSON.stringify(searches));
};

const removeRecentSearch = (songIndex) => {
  let searches = getRecentSearches();
  searches = searches.filter(id => id !== Number(songIndex));
  localStorage.setItem('recentSearches', JSON.stringify(searches));
  renderRecentSearchesUI();
};

const clearAllSearches = () => {
  localStorage.removeItem('recentSearches');
  renderRecentSearchesUI();
};

const renderRecentSearchesUI = () => {
  const container = document.querySelector('.recent-searches-container');
  const list = document.getElementById('recentSearchesList');
  if (!container || !list) return;

  const searches = getRecentSearches();
  // Filter out any broken indexes just in case the database changes
  const validSearches = searches.filter(index => songs && songs[index]);

  if (validSearches.length === 0) {
    container.classList.add('hidden'); // Hide if empty
    return;
  }

  container.classList.remove('hidden');
  list.innerHTML = validSearches.map(index => {
    const song = songs[index];
    return `
    <div class="recent-search-item" data-index="${index}">
      <div class="recent-search-song">
        <img src="${song.cover}" alt="${song.title}">
        <div class="recent-search-info">
          <h4>${song.title}</h4>
          <p>Song • ${song.artist}</p>
        </div>
      </div>
      <button class="remove-search-btn" data-index="${index}">
        <i data-lucide="x"></i>
      </button>
    </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

// Run on initial page load
document.addEventListener('DOMContentLoaded', renderRecentSearchesUI);


// ==========================================
// 2. SEARCH INPUT LOGIC (Local Database)
// ==========================================
searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  browseSection?.classList.toggle("hidden", query !== "");
  searchResults?.classList.toggle("hidden", query === "");

  if (!query) {
    if (searchList) searchList.innerHTML = "";
    renderRecentSearchesUI(); // Show recent searches again when input is cleared
    return;
  }

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  );

  renderLocalSearchResults(filteredSongs);
});

const renderLocalSearchResults = (filtered) => {
  if (!searchList) return;

  if (filtered.length === 0) {
    searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-text-muted);">Song not found in your library.</p>`;
    return;
  }

  searchList.innerHTML = filtered
    .map((song) => {
      const originalIndex = songs.indexOf(song);
      return `
    <article class="songs-card search-result-card" data-index="${originalIndex}">
      <div class="songs-left">
        <img src="${song.cover}" alt="${song.title}">
        <div class="songs-info">
          <h1>${song.title}</h1>
          <p>${song.artist}</p>
        </div>
      </div>
    </article>
  `;
    }).join("");
};


// ==========================================
// 3. CLICK EVENTS (Play Song & Manage History)
// ==========================================

// When you click a song from the search results
searchList?.addEventListener("click", (e) => {
  const card = e.target.closest(".search-result-card");
  if (!card) return;

  const originalIndex = Number(card.dataset.index);

  // 🧠 SAVE THE SONG INDEX TO HISTORY BEFORE PLAYING
  saveRecentSearch(originalIndex);

  currentPlaylistName = "Search Results";
  currentPlaylistQueue = [];

  const playingFromSection = document.querySelector(".playing-from");
  const playingFromTitle = document.querySelector(".playing-from h3");

  if (playingFromSection && playingFromTitle) {
    playingFromTitle.textContent = currentPlaylistName;
    playingFromSection.classList.remove("hidden");
  }

  if (typeof loadSong === 'function') loadSong(originalIndex);
  if (typeof playSong === 'function') playSong();
});

// When you click on a Recent Search song card or the 'X' button
document.getElementById('recentSearchesList')?.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.remove-search-btn');
  const item = e.target.closest('.recent-search-item');

  if (removeBtn) {
    e.stopPropagation(); // Stops the song from playing when clicking X
    removeRecentSearch(removeBtn.dataset.index);
  } else if (item) {
    // Play the song instantly
    const index = Number(item.dataset.index);
    
    currentPlaylistName = "Recent Searches";
    currentPlaylistQueue = [];

    const playingFromSection = document.querySelector(".playing-from");
    const playingFromTitle = document.querySelector(".playing-from h3");

    if (playingFromSection && playingFromTitle) {
        playingFromTitle.textContent = currentPlaylistName;
        playingFromSection.classList.remove("hidden");
    }

    if (typeof loadSong === 'function') loadSong(index);
    if (typeof playSong === 'function') playSong();
  }
});

// Clear All button
document.getElementById('clear-all-searches')?.addEventListener('click', clearAllSearches);