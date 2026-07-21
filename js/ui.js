const recentList = document.querySelector(".recent-list");
const playlistList = document.querySelector(".playlist-list");
const songsList = document.querySelector(".songs-list");

const miniCover = document.querySelector(".player-left img");
const miniTitle = document.querySelector(".player-info h3");
const miniArtist = document.querySelector(".player-info p");
const playerBtn = document.querySelector(".player-btn");

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
      currentSongIndex = Number(card.dataset.index);

      const song = songs[currentSongIndex];

      updateMiniPlayer(song);

      audio.src = song.audio;
      audio.play();

      updatePlayerButton();
    });
  });
}

// ----------------------
// Mini Player
// ----------------------

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

playerBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }

  updatePlayerButton();
});
