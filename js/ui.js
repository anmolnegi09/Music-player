const randomIndex = Math.floor(Math.random() * songs.length);

const homeScreen = document.querySelector(".home-screen");
const recentList = document.querySelector(".recent-list");
const playlistList = document.querySelector(".playlist-list");
const songsList = document.querySelector(".songs-list");

const miniCover = document.querySelector(".player-left img");
const miniTitle = document.querySelector(".player-info h3");
const miniArtist = document.querySelector(".player-info p");
const playerBtn = document.querySelector(".player-btn");
const miniPlayer = document.querySelector(".mini-player");

const playerScreen = document.querySelector(".player-screen");
const backBtn = document.querySelector(".back-btn");
const playerCover = document.querySelector(".player-cover img");
const playerTitle = document.querySelector(".song-details h2");
const playerArtist = document.querySelector(".song-details p");

let currentSongIndex = 0;

// ----------------------
// Recently Played
// ----------------------

function renderRecentSongs() {
  let html = "";

  songs.forEach((song) => {
    html += `
      <article class="song-card">
        <img src="${song.cover}" alt="${song.title}">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </article>
    `;
  });

  recentList.innerHTML = html;
}

// ----------------------
// Playlists
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

// ----------------------
// All Songs
// ----------------------

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
// Mini Player
// ----------------------

function loadSong(index) {
  currentSongIndex = index;

  const song = songs[currentSongIndex];

  updateMiniPlayer(song);
  updateFullPlayer(song);

  audio.src = song.audio;

  updatePlayerButton();
}

function playSong() {
  audio.play();
  updatePlayerButton();
}

function updateMiniPlayer(song) {
  miniCover.src = song.cover;
  miniCover.alt = song.title;

  miniTitle.textContent = song.title;
  miniArtist.textContent = song.artist;
}

// ----------------------
// Play / Pause
// ----------------------

function updatePlayerButton() {
  if (audio.paused) {
    playerBtn.innerHTML = `<i data-lucide="play"></i>`;
  } else {
    playerBtn.innerHTML = `<i data-lucide="pause"></i>`;
  }

  lucide.createIcons();
}

playerBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }

  updatePlayerButton();
});

// ----------------------
// player screen
// ----------------------

miniPlayer.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  playerScreen.classList.remove("hidden");
});

backBtn.addEventListener("click", () => {
  playerScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
});

function updateFullPlayer(song) {
  playerCover.src = song.cover;
  playerCover.alt = song.title;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
}
