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
