const recentList = document.querySelector(".recent-list");
const allSongs = document.querySelector(".all-songs");

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

// function renderPlaylists() {}

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
  allSongs.innerHTML = html;
}
