const recentList = document.querySelector(".recent-list");
const playlistList = document.querySelector(".playlist-list");
const songsList = document.querySelector(".songs-list");

function renderRecentSongs() {
  let html = "";

  songs.forEach((song) => {
    html += `<article class="song-card">
            <img src="${song.cover}" />
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
    </article>`;
  });

  recentList.innerHTML = html;
}

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
}

function renderAllSongs() {
  let html = "";

  songs.forEach((song) => {
    html += ` <article class="songs-card">
            <div class="songs-left">
              <img src="${song.cover}" />

              <div class="songs-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
              </div>
            </div>

            <button class="more-btn">
              <i data-lucide="ellipsis"></i>
            </button>
          </article>`;
  });
  songsList.innerHTML = html;
}
