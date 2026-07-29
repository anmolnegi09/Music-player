// ----------------------
// Recently Played
// ----------------------

function renderRecentSongs() {
  const recentSongs = JSON.parse(localStorage.getItem("recentSongs")) || [];
  let html = "";

  recentSongs.forEach((index) => {
    const song = songs[index];
    html += `
      <article class="song-card" data-index="${index}">
        <img src="${song.cover}" alt="${song.title}">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </article>
    `;
  });

  recentList.innerHTML = html;

  document.querySelectorAll(".song-card").forEach((card) => {
    card.addEventListener("click", () => {
      loadSong(Number(card.dataset.index));
      playSong();
    });
  });
}

function saveRecentSong(index) {
  let recentSongs = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recentSongs = recentSongs.filter((songIndex) => songIndex !== index);
  recentSongs.unshift(index);
  recentSongs = recentSongs.slice(0, 10);
  localStorage.setItem("recentSongs", JSON.stringify(recentSongs));
}

// ----------------------
// Playlists & All Songs
// ----------------------

function renderPlaylists() {
  let html = "";
  playlists.forEach((playlist) => {
    html += `
      <article class="playlist-card">
        <img src="${playlist.cover}" alt="${playlist.title}">
        <div class="playlist-info">
          <h3>${playlist.title}</h3>
          <p>${playlist.songs.length} Songs</p>
        </div>
        <button class="play-btn">
          <i data-lucide="play"></i>
        </button>
      </article>
    `;
  });
  playlistList.innerHTML = html;
  lucide.createIcons();
}

function renderAllSongs() {
  let html = "";
  songs.forEach((song, index) => {
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
          <i data-lucide="ellipsis"></i>
        </button>
      </article>
    `;
  });
  songsList.innerHTML = html;
  lucide.createIcons();

  document.querySelectorAll(".songs-card").forEach((card) => {
    card.addEventListener("click", () => {
      loadSong(Number(card.dataset.index));
      playSong();
    });
  });
}

// ----------------------
// Favorites Logic
// ----------------------

function updateFavoriteButton() {
    if (isFavorite) {
        favoriteBtn.innerHTML = `<i data-lucide="heart" fill="currentColor" color="#ff4040"></i>`;
        favoriteBtn.classList.add("active");
    } else {
        favoriteBtn.innerHTML = `<i data-lucide="heart"></i>`;
        favoriteBtn.classList.remove("active");
    }
    lucide.createIcons();
}

function renderFavoritesCount() {
   const liked = getLikedSongs();
   if(favSongCount) {
       favSongCount.textContent = `${liked.length} songs`;
   }
}

function renderLikedSongs() {
  const liked = getLikedSongs();
  let html = "";

  if(liked.length === 0) {
    likedSongsList.innerHTML = `<p style="text-align:center; margin-top: 50px; color: var(--clr-text-muted);">No favorite songs yet.</p>`;
    return;
  }

  liked.forEach((index) => {
    const song = songs[index];
    html += `
      <article class="songs-card" data-index="${index}">
        <div class="songs-left">
          <img src="${song.cover}" alt="${song.title}">
          <div class="songs-info">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
          </div>
        </div>
        <button class="favorite-btn active remove-liked-btn" data-index="${index}">
          <i data-lucide="heart" fill="currentColor"></i>
        </button>
      </article>
    `;
  });

  likedSongsList.innerHTML = html;
  lucide.createIcons(); 

  likedSongsList.querySelectorAll(".songs-card").forEach((card) => {
    card.addEventListener("click", () => {
      loadSong(Number(card.dataset.index));
      playSong();
      likedSongsScreen.classList.add("hidden");
      playerScreen.classList.remove("hidden");
    });
  });

  likedSongsList.querySelectorAll(".remove-liked-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); 
      const songIndex = Number(btn.dataset.index);
      toggleLikedSong(songIndex);

      if (songIndex === currentSongIndex) {
        isFavorite = false;
        updateFavoriteButton();
      }
      renderLikedSongs();
      renderFavoritesCount();
    });
  });
}

// ----------------------
// Navigation & Screen Switch Logic
// ----------------------

// Variables
const searchScreen = document.querySelector('.search-screen'); 
const profileScreen = document.querySelector('.profile-screen'); 
const searchNavBtn = document.querySelectorAll('.nav-item')[1];
const profileNavBtn = document.querySelectorAll('.nav-item')[3];
const closeLibraryBtn = document.querySelector('.close-library-btn');
const closeSearchBtn = document.querySelector('.close-search-btn');

// Helper function to hide all screens
function hideAllScreens() {
  homeScreen.classList.add('hidden');
  libraryScreen.classList.add('hidden');
  likedSongsScreen.classList.add('hidden');
  playerScreen.classList.add('hidden');
  if(searchScreen) searchScreen.classList.add('hidden');
  if(profileScreen) profileScreen.classList.add('hidden');
}

// Main Bottom Nav
homeNavBtn.addEventListener('click', () => {
  hideAllScreens();
  homeScreen.classList.remove('hidden');
  document.querySelector('.nav-item.active')?.classList.remove('active');
  homeNavBtn.classList.add('active');
});

searchNavBtn.addEventListener('click', () => {
  hideAllScreens();
  if(searchScreen) searchScreen.classList.remove('hidden'); 
  document.querySelector('.nav-item.active')?.classList.remove('active');
  searchNavBtn.classList.add('active');
});

libraryNavBtn.addEventListener('click', () => {
  hideAllScreens();
  libraryScreen.classList.remove('hidden');
  document.querySelector('.nav-item.active')?.classList.remove('active');
  libraryNavBtn.classList.add('active');
  renderFavoritesCount();
});

profileNavBtn.addEventListener('click', () => {
  hideAllScreens();
  if(profileScreen) profileScreen.classList.remove('hidden');
  document.querySelector('.nav-item.active')?.classList.remove('active');
  profileNavBtn.classList.add('active');
  lucide.createIcons();
});

// Inner Screen Interactions
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

if (closeLibraryBtn) {
  closeLibraryBtn.addEventListener('click', () => {
    hideAllScreens();
    homeScreen.classList.remove('hidden');
    document.querySelector('.nav-item.active')?.classList.remove('active');
    homeNavBtn.classList.add('active');
  });
}

if (closeSearchBtn) {
  closeSearchBtn.addEventListener('click', () => {
    hideAllScreens();
    homeScreen.classList.remove('hidden');
    document.querySelector('.nav-item.active')?.classList.remove('active');
    homeNavBtn.classList.add('active');
  });
}