const browseSection = document.querySelector(".browse-section");

const getRecentSearches = () =>
  JSON.parse(localStorage.getItem("recentSearches")) || [];

const saveRecentSearch = (songIndex) => {
  let searches = getRecentSearches();
  searches = searches.filter((id) => id !== songIndex);
  searches.unshift(songIndex);
  searches = searches.slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(searches));
};

const removeRecentSearch = (songIndex) => {
  let searches = getRecentSearches();
  searches = searches.filter((id) => id !== Number(songIndex));
  localStorage.setItem("recentSearches", JSON.stringify(searches));
  renderRecentSearchesUI();
};

const clearAllSearches = () => {
  localStorage.removeItem("recentSearches");
  renderRecentSearchesUI();
};

const renderRecentSearchesUI = () => {
  const container = document.querySelector(".recent-searches-container");
  const list = document.getElementById("recentSearchesList");
  if (!container || !list) return;

  const searches = getRecentSearches();
  const validSearches = searches.filter((index) => songs && songs[index]);

  if (validSearches.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  list.innerHTML = validSearches
    .map((index) => {
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
    })
    .join("");

  if (typeof lucide !== "undefined") lucide.createIcons();
};

document.addEventListener("DOMContentLoaded", renderRecentSearchesUI);

searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  browseSection?.classList.toggle("hidden", query !== "");
  searchResults?.classList.toggle("hidden", query === "");

  if (!query) {
    if (searchList) searchList.innerHTML = "";
    renderRecentSearchesUI();
    return;
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query),
  );

  renderLocalSearchResults(filteredSongs);
});

const renderLocalSearchResults = (filtered) => {
  if (!searchList) return;

  if (filtered.length === 0) {
    searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-text-muted);">Song not found.</p>`;
    return;
  }

  searchList.innerHTML = filtered
    .map((song) => {
      const originalIndex = songs.indexOf(song);
      return `
    <article class="songs-card search-result-card" data-index="${originalIndex}" style="display: flex; align-items: center; width: 100%; max-width: 100%; overflow: hidden; padding: 10px 0; cursor: pointer; box-sizing: border-box;">
      <div class="songs-left" style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; overflow: hidden;">
        <img src="${song.cover}" alt="${song.title}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0;">
        <div class="songs-info" style="display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden;">
          <p style="margin: 0 0 4px 0; font-size: 0.75rem; text-transform: uppercase; color: var(--clr-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; display: block;">${song.artist}</p>
          <h1 style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--clr-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; display: block;">${song.title}</h1>
        </div>
      </div>
    </article>
  `;
    })
    .join("");
};

searchList?.addEventListener("click", (e) => {
  const card = e.target.closest(".search-result-card");
  if (!card) return;

  const originalIndex = Number(card.dataset.index);

  saveRecentSearch(originalIndex);

  let allIndices = songs.map((_, i) => i).filter((i) => i !== originalIndex);
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }

  currentPlaylistName = "Search Results";
  currentPlaylistQueue = [originalIndex, ...allIndices];

  if (typeof loadSong === "function") loadSong(originalIndex);
  if (typeof playSong === "function") playSong();
});

document
  .getElementById("recentSearchesList")
  ?.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-search-btn");
    const item = e.target.closest(".recent-search-item");

    if (removeBtn) {
      e.stopPropagation();
      removeRecentSearch(removeBtn.dataset.index);
    } else if (item) {
      const index = Number(item.dataset.index);

      let allIndices = songs.map((_, i) => i).filter((i) => i !== index);
      for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
      }

      currentPlaylistName = "Recent Searches";
      currentPlaylistQueue = [index, ...allIndices];

      if (typeof loadSong === "function") loadSong(index);
      if (typeof playSong === "function") playSong();
    }
  });

document
  .getElementById("clear-all-searches")
  ?.addEventListener("click", clearAllSearches);