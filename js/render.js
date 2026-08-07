let colorThief = null;
try {
  if (typeof ColorThief !== "undefined") {
    colorThief = new ColorThief();
  }
} catch (e) {}

const updatePlayingFromUI = () => {};

function shuffledIndices(count, take) {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, take);
}

const getSafeRecentSongs = () => {
  try {
    return JSON.parse(localStorage.getItem("recentSongs")) || [];
  } catch (error) {
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
        <img src="${song?.cover || ""}" alt="${song?.title || "Unknown"}">
        <p>${song?.artist || "Unknown Artist"}</p>
        <h1>${song?.title || "Unknown"}</h1>
      </article>`;
    })
    .join("");
};

const renderPlaylists = () => {
  if (!playlistList || !playlists) return;

  playlistList.innerHTML = playlists
    .map(
      (p, i) => `
      <article class="playlist-card" data-index="${i}">
        <img src="${p?.cover || ""}" alt="${p?.title || "Playlist"}">
        <div class="playlist-info">
          <h1>${p?.title || "Unknown Playlist"}</h1>
          <p>${p?.songs?.length || 0} Songs</p>
        </div>
        <button class="play-btn"><i data-lucide="play"></i></button>
      </article>`,
    )
    .join("");

  if (typeof lucide !== "undefined") lucide.createIcons();
};

const renderSuggestedSongs = () => {
  const gridContainer = document.getElementById("suggestedGrid");
  if (!gridContainer || !songs || !songs.length) return;

  const indices = shuffledIndices(songs.length, Math.min(8, songs.length));

  gridContainer.innerHTML = indices
    .map((index) => {
      const song = songs[index];
      return `
      <article class="suggested-card" data-index="${index}">
        <img src="${song?.cover || ""}" alt="${song?.title || "Unknown"}">
        <div class="suggested-info">
          <p>${song?.artist || "Unknown Artist"}</p>
          <h4>${song?.title || "Unknown"}</h4>
        </div>
        <button class="more-btn"><i data-lucide="ellipsis-vertical" size="16"></i></button>
      </article>`;
    })
    .join("");

  if (typeof lucide !== "undefined") lucide.createIcons();
};

playlistList?.addEventListener("click", (e) => {
  const card = e.target.closest(".playlist-card");
  if (!card) return;

  const playBtn = e.target.closest(".play-btn");
  const playlistIndex = Number(card.dataset.index);
  const selectedPlaylist = playlists[playlistIndex];

  if (!selectedPlaylist) return;

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

  if (playlistDetailCover)
    playlistDetailCover.src = selectedPlaylist.cover || "";
  if (playlistDetailName)
    playlistDetailName.textContent =
      selectedPlaylist.title || "Unknown Playlist";
  if (playlistDetailCount)
    playlistDetailCount.textContent = `${selectedPlaylist.songs?.length || 0} Songs`;

  if (playlistDetailSongs) {
    playlistDetailSongs.style.display = "flex";
    playlistDetailSongs.style.flexDirection = "column";
    playlistDetailSongs.style.padding = "0 20px 120px 20px";
    playlistDetailSongs.style.width = "100%";
    playlistDetailSongs.style.gap = "0";

    playlistDetailSongs.innerHTML = (selectedPlaylist.songs || [])
      .map((songIndex) => {
        const s = songs[songIndex];
        if (!s) return "";
        const isHq = s.cover && s.cover.includes("hqdefault");

        return `
          <article class="songs-card" data-index="${songIndex}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; width: 100%;">
            <div class="songs-left" style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0;">
              <div style="width: 45px; height: 45px; border-radius: 6px; overflow: hidden; flex-shrink: 0;">
                <img src="${s.cover || ""}" style="width: 100%; height: 100%; object-fit: cover; ${isHq ? "transform: scale(1.35);" : ""}">
              </div>
              <div class="songs-info" style="display: flex; flex-direction: column; justify-content: center; min-width: 0; flex: 1;">
                <h1 style="margin: 0 0 4px 0; font-size: 0.95rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--clr-text); width: 100%; display: block;">${s.title}</h1>
                <p style="margin: 0; font-size: 0.75rem; color: var(--clr-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-transform: uppercase; width: 100%; display: block;">${s.artist}</p>
              </div>
            </div>
            <button class="more-btn" style="background: none; border: none; color: var(--clr-text-muted); cursor: pointer; padding: 5px; flex-shrink: 0;"><i data-lucide="more-vertical" size="18"></i></button>
          </article>`;
      })
      .join("");
  }

  homeScreen?.classList.add("hidden");
  playlistDetailScreen?.classList.remove("hidden");
  if (typeof lucide !== "undefined") lucide.createIcons();
});

closePlaylistBtn?.addEventListener("click", () => {
  playlistDetailScreen?.classList.add("hidden");

  const libraryTabActive = document
    .querySelector(".nav-item:nth-child(3)")
    ?.classList.contains("active");

  if (libraryTabActive) {
    document.querySelector(".library-screen")?.classList.remove("hidden");
  } else {
    homeScreen?.classList.remove("hidden");
  }
});

playlistDetailSongs?.addEventListener("click", (e) => {
  const card = e.target.closest(".songs-card");
  if (!card) return;

  const p = playlists.find((p) => p.title === currentPlaylistName);
  if (p) currentPlaylistQueue = p.songs || [];

  loadSong(Number(card.dataset.index));
  playSong();
});

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

    const clickedIndex = Number(card.dataset.index);

    let allIndices = songs.map((_, i) => i).filter((i) => i !== clickedIndex);
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }

    window.currentPlaylistName = "All Songs";
    window.currentPlaylistQueue = [clickedIndex, ...allIndices];

    if (typeof updatePlayingFromUI === "function") updatePlayingFromUI();

    loadSong(clickedIndex);
    playSong();
  });
});

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

  if (typeof lucide !== "undefined") lucide.createIcons();
};

const renderFavoritesCount = () => {
  if (favSongCount && typeof getLikedSongs === "function") {
    favSongCount.textContent = `${getLikedSongs().length} songs`;
  }
};

const renderLikedSongs = () => {
  if (!likedSongsList) return;
  const liked = typeof getLikedSongs === "function" ? getLikedSongs() : [];

  if (!liked.length) {
    likedSongsList.innerHTML = `<p style="text-align:center; margin-top: 50px; color: var(--clr-text-muted);">No favorite songs yet.</p>`;
    return;
  }

  likedSongsList.innerHTML = liked
    .filter((i) => songs && songs[i])
    .map((i) => {
      const song = songs[i];
      return `
      <article class="songs-card" data-index="${i}" style="display: flex; align-items: center; justify-content: space-between; width: 100%; overflow: hidden; padding-right: 15px;">
        <div class="songs-left" style="display: flex; align-items: center; flex: 1; min-width: 0; gap: 15px;">
          <img src="${song?.cover || ""}" alt="${song?.title || "Unknown"}" style="flex-shrink: 0;">
          <div class="songs-info" style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
            <h1 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; font-size: 0.95rem;">
              ${song?.title || "Unknown"}
            </h1>
            <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; font-size: 0.75rem;">
              ${song?.artist || "Unknown Artist"}
            </p>
          </div>
        </div>
        <button class="favorite-btn active remove-liked-btn" data-index="${i}" style="flex-shrink: 0; background: none; border: none; cursor: pointer; padding: 5px;">
          <i data-lucide="heart" fill="currentColor" color="#ff4040"></i>
        </button>
      </article>`;
    })
    .join("");

  if (typeof lucide !== "undefined") lucide.createIcons();
};

likedSongsList?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-liked-btn");
  const card = e.target.closest(".songs-card");

  if (removeBtn) {
    const index = Number(removeBtn.dataset.index);
    if (
      typeof toggleLikedSong === "function" &&
      toggleLikedSong(index) === false &&
      index === currentSongIndex
    ) {
      isFavorite = false;
      updateFavoriteButton();
    }
    renderLikedSongs();
    renderFavoritesCount();
  } else if (card) {
    currentPlaylistName = "Liked Songs";
    currentPlaylistQueue =
      typeof getLikedSongs === "function" ? getLikedSongs() : [];
    updatePlayingFromUI();

    loadSong(Number(card.dataset.index));
    playSong();
  }
});

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
    if (idx === 3 && typeof lucide !== "undefined") lucide.createIcons();
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

const showMoreRecentBtn = document.getElementById("show-more-recent-btn");
const recentHistoryScreen = document.querySelector(".recent-history-screen");
const closeRecentHistoryBtn = document.getElementById("close-recent-history");
const recentHistoryList = document.getElementById("recent-history-list");
const homeScreenElement = document.querySelector(".home-screen");

showMoreRecentBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  homeScreenElement?.classList.add("hidden");
  recentHistoryScreen?.classList.remove("hidden");
  renderRecentHistoryFull();
});

closeRecentHistoryBtn?.addEventListener("click", () => {
  recentHistoryScreen?.classList.add("hidden");
  homeScreenElement?.classList.remove("hidden");
});

const renderRecentHistoryFull = () => {
  if (!recentHistoryList) return;

  let recent = getSafeRecentSongs();
  recent = recent.filter((i) => songs && songs[i] !== undefined);

  if (recent.length === 0) {
    recentHistoryList.innerHTML = `<p style="text-align:center; color: var(--clr-text-muted); padding-top: 30px;">No recent plays yet.</p>`;
    return;
  }

  recentHistoryList.innerHTML = recent
    .map((i) => {
      const song = songs[i];
      return `
        <article class="songs-card recent-history-card" data-index="${i}" style="padding: 0;">
          <div class="songs-left">
            <img src="${song.cover}" alt="${song.title}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
            <div class="songs-info" style="justify-content: center;">
              <p style="font-size: 10px; text-transform: uppercase; color: var(--clr-text-muted); margin-bottom: 2px;">${song.artist}</p>
              <h1 style="font-size: var(--fs-sm); font-weight: var(--fw-bold); color: var(--clr-text); margin: 0;">${song.title}</h1>
            </div>
          </div>
        </article>
        `;
    })
    .join("");

  if (typeof lucide !== "undefined") lucide.createIcons();
};

recentHistoryList?.addEventListener("click", (e) => {
  const card = e.target.closest(".recent-history-card");
  if (!card) return;

  const index = Number(card.dataset.index);

  currentPlaylistName = "Recent Plays";
  currentPlaylistQueue = getSafeRecentSongs().filter(
    (i) => songs && songs[i] !== undefined,
  );

  updatePlayingFromUI();

  if (typeof loadSong === "function") loadSong(index);
  if (typeof playSong === "function") playSong();
});