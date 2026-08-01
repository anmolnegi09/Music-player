// Safe ColorThief initialization check
let colorThief = null;
try {
  if (typeof ColorThief !== "undefined") {
    colorThief = new ColorThief();
  }
} catch (e) {
  // Upgraded to warn for better visibility in dev tools
  console.warn("ColorThief not loaded yet:", e.message);
}

const updatePlayingFromUI = () => {
  const playingFromSection = document.querySelector(".playing-from");
  const playingFromTitle = document.querySelector(".playing-from h3");
  if (!playingFromSection || !playingFromTitle) return;

  if (currentPlaylistName !== "") {
    playingFromTitle.textContent = currentPlaylistName;
    playingFromSection.classList.remove("hidden");
  } else {
    playingFromSection.classList.add("hidden");
  }
};

// ----------------------
// Fisher-Yates shuffle
// ----------------------
function shuffledIndices(count, take) {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, take);
}

// ----------------------
// Rendering & Saving Data
// ----------------------
// Helper to safely parse local storage
const getSafeRecentSongs = () => {
  try {
    return JSON.parse(localStorage.getItem("recentSongs")) || [];
  } catch (error) {
    console.warn("Corrupt recentSongs data found in storage, resetting.");
    return [];
  }
};

const saveRecentSong = (index) => {
  let recent = getSafeRecentSongs();
  recent = [index, ...recent.filter((i) => i !== index)].slice(0, 10);
  localStorage.setItem("recentSongs", JSON.stringify(recent));
};

const renderRecentSongs = () => {
  if (!recentList) return;
  
  let recent = getSafeRecentSongs();
  recent = recent.filter((i) => songs && songs[i] !== undefined);
  localStorage.setItem("recentSongs", JSON.stringify(recent));

  recentList.innerHTML = recent
    .map((i) => {
      const song = songs[i];
      return `
      <article class="song-card" data-index="${i}">
        <img src="${song?.cover || ''}" alt="${song?.title || 'Unknown'}">
        <h1>${song?.title || 'Unknown'}</h1>
        <p>${song?.artist || 'Unknown Artist'}</p>
      </article>`;
    })
    .join("");
};

const renderPlaylists = () => {
  if (!playlistList || !playlists) return; // Failsafe for missing data
  
  playlistList.innerHTML = playlists
    .map((p, i) => `
      <article class="playlist-card" data-index="${i}">
        <img src="${p?.cover || ''}" alt="${p?.title || 'Playlist'}">
        <div class="playlist-info">
          <h1>${p?.title || 'Unknown Playlist'}</h1>
          <p>${p?.songs?.length || 0} Songs</p>
        </div>
        <button class="play-btn"><i data-lucide="play"></i></button>
      </article>`)
    .join("");
    
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ----------------------
// Suggested For You (2-Column Grid)
// ----------------------
const renderSuggestedSongs = () => {
  const gridContainer = document.getElementById("suggestedGrid");
  if (!gridContainer || !songs || !songs.length) return;

  const indices = shuffledIndices(songs.length, Math.min(8, songs.length));

  gridContainer.innerHTML = indices
    .map((index) => {
      const song = songs[index];
      return `
      <article class="suggested-card" data-index="${index}">
        <img src="${song?.cover || ''}" alt="${song?.title || 'Unknown'}">
        <div class="suggested-info">
          <p>${song?.artist || 'Unknown Artist'}</p>
          <h4>${song?.title || 'Unknown'}</h4>
        </div>
        <button class="more-btn"><i data-lucide="ellipsis-vertical" size="16"></i></button>
      </article>`;
    })
    .join("");

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ----------------------
// Featured Playlists
// ----------------------
const renderFeaturedPlaylists = () => {
  const container = document.getElementById("featuredPlaylistList");
  if (!container || !songs || !songs.length) return;

  const indices = shuffledIndices(songs.length, Math.min(6, songs.length));

  container.innerHTML = indices
    .map((index) => {
      const song = songs[index];
      return `
      <article class="featured-card" data-index="${index}">
        <img src="${song?.cover || ''}" alt="${song?.title || 'Unknown'}">
        <div class="featured-card-footer">
          <div class="featured-card-info">
            <p>${song?.artist || 'Unknown Artist'}</p>
            <h4>${song?.title || 'Unknown'}</h4>
          </div>
          <button class="more-btn"><i data-lucide="ellipsis-vertical" size="16"></i></button>
        </div>
      </article>`;
    })
    .join("");

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ----------------------
// Playlist Click Logic
// ----------------------
playlistList?.addEventListener("click", (e) => {
  const card = e.target.closest(".playlist-card");
  if (!card) return;

  const playBtn = e.target.closest(".play-btn");
  const playlistIndex = Number(card.dataset.index);
  const selectedPlaylist = playlists[playlistIndex];

  if (!selectedPlaylist) return; // Guard against bad index

  if (playBtn) {
    e.stopPropagation();
    if (selectedPlaylist.songs && selectedPlaylist.songs.length > 0) {
      currentPlaylistName = selectedPlaylist.title;
      currentPlaylistQueue = selectedPlaylist.songs;
      updatePlayingFromUI();

      loadSong(selectedPlaylist.songs[0]);
      playSong();
    }
    return;
  }

  currentPlaylistName = selectedPlaylist.title;
  updatePlayingFromUI();

  if (playlistDetailCover) playlistDetailCover.src = selectedPlaylist.cover || '';
  if (playlistDetailName) playlistDetailName.textContent = selectedPlaylist.title || 'Unknown Playlist';
  if (playlistDetailCount) playlistDetailCount.textContent = `${selectedPlaylist.songs?.length || 0} Songs`;

  if (playlistDetailSongs) {
    playlistDetailSongs.innerHTML = (selectedPlaylist.songs || [])
      .map((songIndex) => {
        const s = songs[songIndex];
        if (!s) return "";
        return `
          <article class="songs-card" data-index="${songIndex}">
            <div class="songs-left">
              <img src="${s?.cover || ''}" alt="${s?.title || 'Unknown'}">
              <div class="songs-info">
                <h1>${s?.title || 'Unknown'}</h1>
                <p>${s?.artist || 'Unknown Artist'}</p>
              </div>
            </div>
            <button class="more-btn"><i data-lucide="ellipsis"></i></button>
          </article>`;
      })
      .join("");
  }

  homeScreen?.classList.add("hidden");
  playlistDetailScreen?.classList.remove("hidden");
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

closePlaylistBtn?.addEventListener("click", () => {
  playlistDetailScreen?.classList.add("hidden");
  homeScreen?.classList.remove("hidden");
});

playlistDetailSongs?.addEventListener("click", (e) => {
  const card = e.target.closest(".songs-card");
  if (!card) return;

  const p = playlists.find((p) => p.title === currentPlaylistName);
  if (p) currentPlaylistQueue = p.songs || [];

  loadSong(Number(card.dataset.index));
  playSong();
});

// ----------------------
// Home Screen Clicks (event delegation)
// ----------------------
// Optimized: Filter out any containers that didn't render (null values)
const homeClickContainers = [
  recentList,
  document.getElementById("suggestedGrid"),
  document.getElementById("featuredPlaylistList"),
  playlistList,
].filter(Boolean); 

homeClickContainers.forEach((list) => {
  list.addEventListener("click", (e) => {
    if (e.target.closest(".more-btn") || e.target.closest(".play-btn")) return;

    const card = e.target.closest(
      ".song-card, .suggested-card, .featured-card, .songs-card, .playlist-card",
    );
    if (!card || card.dataset.index === undefined) return;
    if (card.classList.contains("playlist-card")) return;

    currentPlaylistName = "";
    currentPlaylistQueue = [];
    updatePlayingFromUI();

    loadSong(Number(card.dataset.index));
    playSong();
  });
});

// ----------------------
// Favorites System
// ----------------------
const updateFavoriteButton = () => {
  const iconHTML = isFavorite
    ? `<i data-lucide="heart" fill="currentColor" color="#ff4040"></i>`
    : `<i data-lucide="heart"></i>`;

  if (favoriteBtn) {
    favoriteBtn.innerHTML = iconHTML;
    favoriteBtn.classList.toggle("active", isFavorite);
  }

  if (miniLikeBtn) {
    miniLikeBtn.innerHTML = iconHTML;
    miniLikeBtn.classList.toggle("active", isFavorite);
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

const renderFavoritesCount = () => {
  if (favSongCount && typeof getLikedSongs === 'function') {
    favSongCount.textContent = `${getLikedSongs().length} songs`;
  }
};

const renderLikedSongs = () => {
  if (!likedSongsList) return;
  const liked = typeof getLikedSongs === 'function' ? getLikedSongs() : [];

  if (!liked.length) {
    likedSongsList.innerHTML = `<p style="text-align:center; margin-top: 50px; color: var(--clr-text-muted);">No favorite songs yet.</p>`;
    return;
  }

  likedSongsList.innerHTML = liked
    .filter((i) => songs && songs[i])
    .map((i) => {
      const song = songs[i];
      return `
      <article class="songs-card" data-index="${i}">
        <div class="songs-left">
          <img src="${song?.cover || ''}" alt="${song?.title || 'Unknown'}">
          <div class="songs-info">
            <h1>${song?.title || 'Unknown'}</h1>
            <p>${song?.artist || 'Unknown Artist'}</p>
          </div>
        </div>
        <button class="favorite-btn active remove-liked-btn" data-index="${i}">
          <i data-lucide="heart" fill="currentColor" color="#ff4040"></i>
        </button>
      </article>`;
    })
    .join("");
    
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

likedSongsList?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-liked-btn");
  const card = e.target.closest(".songs-card");

  if (removeBtn) {
    const index = Number(removeBtn.dataset.index);
    if (typeof toggleLikedSong === 'function' && toggleLikedSong(index) === false && index === currentSongIndex) {
      isFavorite = false;
      updateFavoriteButton();
    }
    renderLikedSongs();
    renderFavoritesCount();
  } else if (card) {
    currentPlaylistName = "Liked Songs";
    currentPlaylistQueue = typeof getLikedSongs === 'function' ? getLikedSongs() : [];
    updatePlayingFromUI();

    loadSong(Number(card.dataset.index));
    playSong();
  }
});

// ----------------------
// Main Navigation Logic
// ----------------------
const screens = [homeScreen, searchScreen, libraryScreen, profileScreen];
const allPossibleScreens = [
  homeScreen,
  searchScreen,
  libraryScreen,
  profileScreen,
  playlistDetailScreen,
  likedSongsScreen,
];

navBtns.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    allPossibleScreens.forEach((s) => s?.classList.add("hidden"));

    document.querySelector(".nav-item.active")?.classList.remove("active");

    btn.classList.add("active");
    screens[idx]?.classList.remove("hidden");

    if (idx === 2) renderFavoritesCount();
    if (idx === 3 && typeof lucide !== 'undefined') lucide.createIcons();
  });
});

favoritesFolder?.addEventListener("click", () => {
  libraryScreen?.classList.add("hidden");
  likedSongsScreen?.classList.remove("hidden");
  renderLikedSongs();
});

backToLibraryBtn?.addEventListener("click", () => {
  likedSongsScreen?.classList.add("hidden");
  libraryScreen?.classList.remove("hidden");
  renderFavoritesCount();
});

[closeLibraryBtn, closeSearchBtn].forEach((btn) => {
  btn?.addEventListener("click", () => navBtns[0]?.click());
});