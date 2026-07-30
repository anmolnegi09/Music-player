// Safe ColorThief initialization check
let colorThief = null;
try {
  if (typeof ColorThief !== 'undefined') {
    colorThief = new ColorThief();
  }
} catch (e) {
  console.log("ColorThief not loaded yet");
}

const updatePlayingFromUI = () => {
  const playingFromSection = document.querySelector(".playing-from");
  const playingFromTitle = document.querySelector(".playing-from h3");
  
  if (currentPlaylistName !== "") {
    playingFromTitle.textContent = currentPlaylistName;
    playingFromSection.classList.remove("hidden");
  } else {
    playingFromSection.classList.add("hidden");
  }
};

// ----------------------
// Rendering & Saving Data
// ----------------------
const saveRecentSong = (index) => {
  let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recent = [index, ...recent.filter(i => i !== index)].slice(0, 10);
  localStorage.setItem("recentSongs", JSON.stringify(recent));
};

const renderRecentSongs = () => {
  if (!recentList) return;
  let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recent = recent.filter(i => songs[i] !== undefined);
  localStorage.setItem("recentSongs", JSON.stringify(recent));

  recentList.innerHTML = recent.map(i => `
    <article class="song-card" data-index="${i}">
      <img src="${songs[i].cover}" alt="${songs[i].title}">
      <h1>${songs[i].title}</h1>
      <p>${songs[i].artist}</p>
    </article>`).join('');
};

const renderPlaylists = () => {
  if (!playlistList) return;
  playlistList.innerHTML = playlists.map((p, i) => `
    <article class="playlist-card" data-index="${i}">
      <img src="${p.cover}" alt="${p.title}">
      <div class="playlist-info">
        <h1>${p.title}</h1>
        <p>${p.songs.length} Songs</p>
      </div>
      <button class="play-btn"><i data-lucide="play"></i></button>
    </article>`).join('');
  lucide.createIcons();
};

// ----------------------
// Suggested For You (2-Column Grid)
// ----------------------
const renderSuggestedSongs = () => {
  const gridContainer = document.getElementById("suggestedGrid");
  if (!gridContainer) return;

  const suggested = songs
    .map((song, index) => ({ song, index }))
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  gridContainer.innerHTML = suggested.map(({ song, index }) => `
    <article class="suggested-card" data-index="${index}">
      <img src="${song.cover}" alt="${song.title}">
      <div class="suggested-info">
        <p>${song.artist}</p>
        <h4>${song.title}</h4>
      </div>
      <button class="more-btn"><i data-lucide="ellipsis-vertical" size="16"></i></button>
    </article>
  `).join('');
  
  lucide.createIcons();
};

// ----------------------
// Featured Playlists 
// ----------------------
const renderFeaturedPlaylists = () => {
  const container = document.getElementById("featuredPlaylistList");
  if (!container) return;

  const featured = songs
    .map((song, index) => ({ song, index }))
    .sort(() => 0.3 - Math.random())
    .slice(0, 6);

  container.innerHTML = featured.map(({ song, index }) => `
    <article class="featured-card" data-index="${index}">
      <img src="${song.cover}" alt="${song.title}">
      <div class="featured-card-footer">
        <div class="featured-card-info">
          <p>${song.artist}</p>
          <h4>${song.title}</h4>
        </div>
        <button class="more-btn"><i data-lucide="ellipsis-vertical" size="16"></i></button>
      </div>
    </article>
  `).join('');

  lucide.createIcons();
};

// ----------------------
// Playlist Click Logic
// ----------------------
playlistList?.addEventListener('click', (e) => {
  const card = e.target.closest('.playlist-card');
  const playBtn = e.target.closest('.play-btn'); 

  if (card) {
    const playlistIndex = Number(card.dataset.index);
    const selectedPlaylist = playlists[playlistIndex];

    if (playBtn) {
      e.stopPropagation(); 
      if (selectedPlaylist.songs.length > 0) {
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

    playlistDetailCover.src = selectedPlaylist.cover;
    playlistDetailName.textContent = selectedPlaylist.title;
    playlistDetailCount.textContent = `${selectedPlaylist.songs.length} Songs`;

    playlistDetailSongs.innerHTML = selectedPlaylist.songs.map(songIndex => {
      const s = songs[songIndex];
      if (!s) return '';
      return `
        <article class="songs-card" data-index="${songIndex}">
          <div class="songs-left">
            <img src="${s.cover}" alt="${s.title}">
            <div class="songs-info">
              <h1>${s.title}</h1>
              <p>${s.artist}</p>
            </div>
          </div>
          <button class="more-btn"><i data-lucide="ellipsis"></i></button>
        </article>`;
    }).join('');

    homeScreen.classList.add('hidden');
    playlistDetailScreen.classList.remove('hidden');
    lucide.createIcons();
  }
});

closePlaylistBtn?.addEventListener('click', () => {
  playlistDetailScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
});

playlistDetailSongs?.addEventListener('click', (e) => {
  const card = e.target.closest('.songs-card');
  if (card) {
    const p = playlists.find(p => p.title === currentPlaylistName);
    if (p) currentPlaylistQueue = p.songs;

    loadSong(Number(card.dataset.index));
    playSong();
  }
});

// ----------------------
// 🔥 FIXED HOME SCREEN CLICKS 
// ----------------------
const homeClickContainers = [recentList, document.getElementById("suggestedGrid"), document.getElementById("featuredPlaylistList"), playlistList];

homeClickContainers.forEach(list => {
  list?.addEventListener("click", (e) => {
    // Agar 3-dots ya play button dabaya hai, toh gaana mat play karo
    if (e.target.closest(".more-btn") || e.target.closest(".play-btn")) return;

    const card = e.target.closest(".song-card, .suggested-card, .featured-card, .songs-card, .playlist-card");
    if (card && card.dataset.index !== undefined) { 
      if (card.classList.contains('playlist-card')) return;

      currentPlaylistName = ""; 
      currentPlaylistQueue = []; 
      updatePlayingFromUI();

      loadSong(Number(card.dataset.index)); 
      playSong();
    }
  });
});

// ----------------------
// Favorites System
// ----------------------
const updateFavoriteButton = () => {
  const iconHTML = isFavorite 
    ? `<i data-lucide="heart" fill="currentColor" color="#ff4040"></i>` 
    : `<i data-lucide="heart"></i>`;

  favoriteBtn.innerHTML = iconHTML;
  favoriteBtn.classList.toggle("active", isFavorite);

  if (miniLikeBtn) {
    miniLikeBtn.innerHTML = iconHTML;
    miniLikeBtn.classList.toggle("active", isFavorite);
  }

  lucide.createIcons();
};

const renderFavoritesCount = () => {
  if (favSongCount) favSongCount.textContent = `${getLikedSongs().length} songs`;
};

const renderLikedSongs = () => {
  const liked = getLikedSongs();
  
  if (!liked.length) {
    likedSongsList.innerHTML = `<p style="text-align:center; margin-top: 50px; color: var(--clr-text-muted);">No favorite songs yet.</p>`;
    return;
  }

  likedSongsList.innerHTML = liked.map(i => `
    <article class="songs-card" data-index="${i}">
      <div class="songs-left">
        <img src="${songs[i].cover}" alt="${songs[i].title}">
        <div class="songs-info">
          <h1>${songs[i].title}</h1>
          <p>${songs[i].artist}</p>
        </div>
      </div>
      <button class="favorite-btn active remove-liked-btn" data-index="${i}">
        <i data-lucide="heart" fill="currentColor" color="#ff4040"></i>
      </button>
    </article>`).join('');
  lucide.createIcons();
};

likedSongsList?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-liked-btn");
  const card = e.target.closest(".songs-card");
  
  if (removeBtn) {
    const index = Number(removeBtn.dataset.index);
    if (toggleLikedSong(index) === false && index === currentSongIndex) {
      isFavorite = false;
      updateFavoriteButton();
    }
    renderLikedSongs();
    renderFavoritesCount();
  } else if (card) {
    currentPlaylistName = "Liked Songs";
    currentPlaylistQueue = getLikedSongs();
    updatePlayingFromUI();

    loadSong(Number(card.dataset.index));
    playSong();
  }
});

// ----------------------
// Main Navigation Logic
// ----------------------
const screens = [homeScreen, searchScreen, libraryScreen, profileScreen];
const allPossibleScreens = [homeScreen, searchScreen, libraryScreen, profileScreen, playlistDetailScreen, likedSongsScreen];

navBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    allPossibleScreens.forEach(s => {
      if (s) s.classList.add('hidden');
    });
    
    document.querySelector('.nav-item.active')?.classList.remove('active');
    
    btn.classList.add('active');
    screens[idx]?.classList.remove('hidden');
    
    if (idx === 2) renderFavoritesCount();
    if (idx === 3) lucide.createIcons();
  });
});

favoritesFolder?.addEventListener('click', () => {
  libraryScreen.classList.add('hidden');
  likedSongsScreen.classList.remove('hidden');
  renderLikedSongs();
});

backToLibraryBtn?.addEventListener('click', () => {
  likedSongsScreen.classList.add('hidden');
  libraryScreen.classList.remove('hidden');
  renderFavoritesCount();
});

[closeLibraryBtn, closeSearchBtn].forEach(btn => {
  btn?.addEventListener('click', () => navBtns[0].click());
});