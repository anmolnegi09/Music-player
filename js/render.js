const colorThief = new ColorThief();

// ----------------------
// Rendering & Saving Data
// ----------------------

const saveRecentSong = (index) => {
  let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recent = [index, ...recent.filter(i => i !== index)].slice(0, 10);
  localStorage.setItem("recentSongs", JSON.stringify(recent));
};

const renderRecentSongs = () => {
  const recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recentList.innerHTML = recent.map(i => `
    <article class="song-card" data-index="${i}">
      <img src="${songs[i].cover}" alt="${songs[i].title}">
      <h1>${songs[i].title}</h1>
      <p>${songs[i].artist}</p>
    </article>`).join('');
};

const renderPlaylists = () => {
  playlistList.innerHTML = playlists.map(p => `
    <article class="playlist-card">
      <img src="${p.cover}" alt="${p.title}">
      <div class="playlist-info">
        <h1>${p.title}</h1>
        <p>${p.songs.length} Songs</p>
      </div>
      <button class="play-btn"><i data-lucide="play"></i></button>
    </article>`).join('');
  lucide.createIcons();
};

const renderAllSongs = () => {
  songsList.innerHTML = songs.map((s, i) => `
    <article class="songs-card" data-index="${i}">
      <div class="songs-left">
        <img src="${s.cover}" alt="${s.title}">
        <div class="songs-info">
          <h1>${s.title}</h1>
          <p>${s.artist}</p>
        </div>
      </div>
      <button class="more-btn"><i data-lucide="ellipsis"></i></button>
    </article>`).join('');
  lucide.createIcons();
};

[recentList, songsList].forEach(list => {
  list.addEventListener("click", (e) => {
    const card = e.target.closest(".song-card, .songs-card");
    if (card) { 
      loadSong(Number(card.dataset.index)); 
      playSong(); 
    }
  });
});

// ----------------------
// Favorites System
// ----------------------

const updateFavoriteButton = () => {
  favoriteBtn.innerHTML = isFavorite 
    ? `<i data-lucide="heart" fill="currentColor" color="#ff4040"></i>` 
    : `<i data-lucide="heart"></i>`;
  favoriteBtn.classList.toggle("active", isFavorite);
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
        <i data-lucide="heart" fill="currentColor"></i>
      </button>
    </article>`).join('');
  lucide.createIcons();
};

likedSongsList.addEventListener("click", (e) => {
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
    loadSong(Number(card.dataset.index));
    playSong();
    likedSongsScreen.classList.add("hidden");
    playerScreen.classList.remove("hidden");
  }
});

// ----------------------
// Main Navigation Logic
// ----------------------

const searchScreen = document.querySelector('.search-screen'); 
const profileScreen = document.querySelector('.profile-screen'); 
const closeLibraryBtn = document.querySelector('.close-library-btn');
const closeSearchBtn = document.querySelector('.close-search-btn');

const screens = [homeScreen, searchScreen, libraryScreen, profileScreen];
const navBtns = document.querySelectorAll('.nav-item');

navBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    screens.forEach(s => s?.classList.add('hidden'));
    document.querySelector('.nav-item.active')?.classList.remove('active');
    
    btn.classList.add('active');
    screens[idx]?.classList.remove('hidden');
    
    if (idx === 2) renderFavoritesCount();
    if (idx === 3) lucide.createIcons();
  });
});

favoritesFolder.addEventListener('click', () => {
  libraryScreen.classList.add('hidden');
  likedSongsScreen.classList.remove('hidden');
  renderLikedSongs();
});

backToLibraryBtn.addEventListener('click', () => {
  likedSongsScreen.classList.add('hidden');
  libraryScreen.classList.remove('hidden');
  renderFavoritesCount();
});

[closeLibraryBtn, closeSearchBtn].forEach(btn => {
  btn?.addEventListener('click', () => navBtns[0].click());
});