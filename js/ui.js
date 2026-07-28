const audio = new Audio();
// window.audio = new Audio();
const savedSong = localStorage.getItem("currentSongIndex");

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

const previousBtn = document.querySelector(".previous-btn");
const playBtnLarge = document.querySelector(".play-btn-large");
const nextBtn = document.querySelector(".next-btn");
const progressBar = document.querySelector(".progress-bar");
const currentTime = document.querySelector(".current-time");
const duration = document.querySelector(".duration");
const repeatBtn = document.querySelector(".repeat-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");

let isRepeat = false;
let isShuffle = false;

const queueBtn = document.querySelector(".queue-btn");
const queueScreen = document.querySelector(".queue-screen");
const closeQueue = document.querySelector(".close-queue");
const queueList = document.querySelector(".queue-list");

let currentSongIndex = 0;

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

  // Agar song pehle se hai to remove
  recentSongs = recentSongs.filter((songIndex) => songIndex !== index);

  // Sabse upar add
  recentSongs.unshift(index);

  // Sirf latest 10 songs rakho
  recentSongs = recentSongs.slice(0, 10);

  localStorage.setItem("recentSongs", JSON.stringify(recentSongs));
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
  localStorage.setItem("currentSongIndex", currentSongIndex);
  saveRecentSong(currentSongIndex);

  const song = songs[currentSongIndex];

  updateMiniPlayer(song);
  updateFullPlayer(song);

  audio.src = song.audio;

  updatePlayerButton();

  renderRecentSongs();
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
    playBtnLarge.innerHTML = `<i data-lucide="play"></i>`;
  } else {
    playerBtn.innerHTML = `<i data-lucide="pause"></i>`;
    playBtnLarge.innerHTML = `<i data-lucide="pause"></i>`;
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

playBtnLarge.addEventListener("click", (e) => {
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

// ----------------------
// Progress Bar
// ----------------------

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTime.textContent = formatTime(audio.currentTime);
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;

  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// ----------------------
// Shuffle Button
// ----------------------

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

// ----------------------
// Previous Button
// ----------------------

previousBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1) % songs.length;

  loadSong(currentSongIndex);
  playSong();
});

// ----------------------
// Next Button
// ----------------------

nextBtn.addEventListener("click", () => {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }

  loadSong(currentSongIndex);
  playSong();
});

// ----------------------
// Repeat Button
// ----------------------

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    if (isShuffle) {
      currentSongIndex = Math.floor(Math.random() * songs.length);
    } else {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
    }

    loadSong(currentSongIndex);
    playSong();
  }
});

// ----------------------
// Queue Button
// ----------------------

queueBtn.addEventListener("click", () => {
  renderQueue();
  queueScreen.classList.add("show");
});

closeQueue.addEventListener("click", () => {
  queueScreen.classList.remove("show");
});

function renderQueue() {
  queueList.innerHTML = "";

  songs.forEach((song, index) => {
    const songItem = document.createElement("div");

    songItem.className = "queue-item";

    if (index === currentSongIndex) {
      songItem.classList.add("playing");
    }

    songItem.innerHTML = `
            <img src="${song.cover}" alt="">
            <div>
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
        `;

    songItem.addEventListener("click", () => {
      currentSongIndex = index;

      loadSong(currentSongIndex);

      playSong();

      renderQueue();
    });

    queueList.appendChild(songItem);
  });
}

// ----------------------
// Local Storage
// ----------------------

if (savedSong !== null) {
  currentSongIndex = Number(savedSong);
} else {
  currentSongIndex = Math.floor(Math.random() * songs.length);
}

loadSong(currentSongIndex);
