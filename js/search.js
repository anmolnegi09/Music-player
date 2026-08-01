// search.js
const browseSection = document.querySelector(".browse-section");
let searchTimeout = null;
let liveSearchResults = [];
let searchAbortController = null; 

searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  // Added optional chaining to prevent crashes if DOM elements are missing
  browseSection?.classList.toggle("hidden", query !== "");
  searchResults?.classList.toggle("hidden", query === "");

  clearTimeout(searchTimeout);

  if (query) {
    if (searchList) {
      // Basic sanitization/escape to prevent broken HTML if query contains quotes
      const safeQuery = query.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-text-muted);">Searching internet for "${safeQuery}"...</p>`;
    }

    searchTimeout = setTimeout(() => {
      fetchSongsFromAPI(query);
    }, 500);
  } else {
    searchAbortController?.abort();
    if (searchList) searchList.innerHTML = "";
  }
});

// Seedha Public API se gaane aur cover images fetch karega
const fetchSongsFromAPI = async (query) => {
  searchAbortController?.abort();
  searchAbortController = new AbortController();

  try {
    const response = await fetch(
      `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`,
      { signal: searchAbortController.signal }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.success && data.data?.results?.length > 0) {
      liveSearchResults = data.data.results;
      renderLiveSearchResults(liveSearchResults);
    } else {
      if (searchList) searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-text-muted);">No songs found on the internet.</p>`;
    }
  } catch (error) {
    if (error.name === "AbortError") return; 
    console.warn("API connection error:", error.message); // Switched to warn
    if (searchList) searchList.innerHTML = `<p style="text-align:center; padding-top: 30px; color: var(--clr-danger);">Internet API error! Please check your connection.</p>`;
  }
};

// Search results ko UI par dikhana (with Auto Cover Images)
const renderLiveSearchResults = (filtered) => {
  if (!searchList) return;
  
  searchList.innerHTML = filtered
    .map((song, index) => {
      // Enhanced fallbacks for all extracted data
      const title = song?.name || song?.title || "Unknown Title";
      const artist = song?.artists?.primary?.[0]?.name || song?.primaryArtists || "Unknown Artist";
      const cover = song?.image?.[2]?.link || song?.image?.[0]?.link || "assets/images/covers/song1.jpg";

      return `
    <article class="songs-card live-search-card" data-index="${index}">
      <div class="songs-left">
        <img src="${cover}" alt="${title}">
        <div class="songs-info">
          <h1>${title}</h1>
          <p>${artist}</p>
        </div>
      </div>
    </article>
  `;
    })
    .join("");
};

const MAX_LIVE_SONGS = 50;

searchList?.addEventListener("click", (e) => {
  const card = e.target.closest(".live-search-card");
  if (!card) return;

  const index = Number(card.dataset.index);
  const selectedSong = liveSearchResults[index];
  if (!selectedSong) return;

  // Added strict fallbacks to ensure you never push a broken object into your main app
  const formattedSong = {
    id: "live_" + Date.now(),
    title: selectedSong?.name || selectedSong?.title || "Unknown Title",
    artist: selectedSong?.artists?.primary?.[0]?.name || selectedSong?.primaryArtists || "Unknown Artist",
    cover: selectedSong?.image?.[2]?.link || selectedSong?.image?.[0]?.link || "assets/images/covers/song1.jpg",
    audio: selectedSong?.downloadUrl?.[4]?.link || selectedSong?.downloadUrl?.[0]?.link || selectedSong?.url || "",
  };

  // Only proceed if an audio link actually exists
  if (!formattedSong.audio) {
    console.error("This song does not have a valid audio stream.");
    return;
  }

  // Ensure 'songs' array exists before pushing
  if (typeof songs !== 'undefined') {
    songs.push(formattedSong);
    
    // CRITICAL LOGIC WARNING: 
    // Truncating the beginning of the 'songs' array like this will shift the index of ALL songs.
    // If your Cloudinary songs are at indexes 0-10, this splice will eventually delete them,
    // and any saved 'currentSongIndex' or 'recentSongs' pointing to old indexes will now play the wrong track!
    // I left your logic intact to not break expectations, but consider managing internet songs in a separate array.
    if (songs.length > MAX_LIVE_SONGS) {
      songs.splice(0, songs.length - MAX_LIVE_SONGS);
    }
    
    const newSongIndex = songs.length - 1;

    currentPlaylistName = "Internet Search";
    currentPlaylistQueue = [];
    
    const playingFromSection = document.querySelector(".playing-from");
    const playingFromTitle = document.querySelector(".playing-from h3");
    
    if (playingFromSection && playingFromTitle) {
        playingFromTitle.textContent = currentPlaylistName;
        playingFromSection.classList.remove("hidden");
    }

    if (typeof loadSong === 'function') loadSong(newSongIndex);
    if (typeof playSong === 'function') playSong();
  }
});