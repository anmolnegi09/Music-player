// ==========================================
// GLOBAL VARIABLES & UTILITIES
// ==========================================
window.userQueue = window.userQueue || [];

window.showToast = function (message) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("show");

  if (typeof lucide !== "undefined") lucide.createIcons();
  if (window.toastTimeout) clearTimeout(window.toastTimeout);

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
};

// ==========================================
// INITIALIZATION & UI SETUP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 🌟 FIX: Restore the Queue State from LocalStorage
  try {
    const savedQueue = localStorage.getItem("currentPlaylistQueue");
    if (savedQueue) window.currentPlaylistQueue = JSON.parse(savedQueue);

    const savedName = localStorage.getItem("currentPlaylistName");
    if (savedName) window.currentPlaylistName = savedName;

    const savedUserQueue = localStorage.getItem("userQueue");
    if (savedUserQueue) window.userQueue = JSON.parse(savedUserQueue);
  } catch (e) {
    console.warn("Could not restore queue state", e);
  }

  const savedIndex = localStorage.getItem("currentSongIndex");
  if (
    savedIndex !== null &&
    typeof songs !== "undefined" &&
    songs[Number(savedIndex)]
  ) {
    currentSongIndex = Number(savedIndex);
  } else {
    currentSongIndex = 0;
  }

  // Update the UI Header with the restored name!
  if (typeof updatePlayingFromUI === "function") updatePlayingFromUI();

  if (typeof loadSong === "function") loadSong(currentSongIndex);

  if (typeof renderRecentSongs === "function") renderRecentSongs();
  if (typeof renderPlaylists === "function") renderPlaylists();
  if (typeof renderSuggestedSongs === "function") renderSuggestedSongs();
  if (typeof renderFeaturedPlaylists === "function") renderFeaturedPlaylists();
  if (typeof renderFavoritesCount === "function") renderFavoritesCount();
  if (typeof renderLibrary === "function") renderLibrary();

  // ==========================================
  // 3-DOT OPTIONS MENU LOGIC
  // ==========================================
  const optionsSheet = document.getElementById("songOptionsSheet");
  const optionsOverlay = document.getElementById("optionsOverlay");
  const optCover = document.getElementById("options-cover");
  const optTitle = document.getElementById("options-title");
  const optArtist = document.getElementById("options-artist");
  const optLikeBtn = document.getElementById("opt-like");

  function updateMenuHeartIcon(isLiked) {
    const heartIcon =
      optLikeBtn?.querySelector("svg") || optLikeBtn?.querySelector("i");
    const likeText = optLikeBtn?.querySelector("span");
    if (!heartIcon || !likeText) return;

    if (isLiked) {
      likeText.innerText = "Unlike";
      heartIcon.style.fill = "var(--clr-danger)";
      heartIcon.style.color = "var(--clr-danger)";
    } else {
      likeText.innerText = "Like";
      heartIcon.style.fill = "none";
      heartIcon.style.color = "var(--clr-text-muted)";
    }
  }

  document.body.addEventListener("click", (e) => {
    const moreBtn = e.target.closest(".more-btn");
    const playerMenuBtn = e.target.closest(".player-menu-btn");

    if (moreBtn || playerMenuBtn) {
      e.stopPropagation();

      const optQueueNext = document.getElementById("opt-queue-next");
      const optQueueLast = document.getElementById("opt-queue-last");
      const optLikeToggle = document.getElementById("opt-like");

      if (playerMenuBtn) {
        if (
          typeof currentSongIndex !== "undefined" &&
          songs[currentSongIndex]
        ) {
          const currentSong = songs[currentSongIndex];

          optionsSheet.dataset.itemType = "song";
          optionsSheet.dataset.songIndex = currentSongIndex;
          optCover.src = currentSong.cover;
          optTitle.innerText = currentSong.title;
          optArtist.innerText = currentSong.artist;

          if (optQueueNext) optQueueNext.style.display = "none";
          if (optQueueLast) optQueueLast.style.display = "none";
          if (optLikeToggle) optLikeToggle.style.display = "none";

          optionsOverlay?.classList.remove("hidden");
          optionsOverlay?.classList.add("active");
          optionsSheet?.classList.add("active");
        }
        return;
      }

      if (optQueueNext) optQueueNext.style.display = "flex";
      if (optQueueLast) optQueueLast.style.display = "flex";
      if (optLikeToggle) optLikeToggle.style.display = "flex";

      const card = moreBtn.closest(
        ".suggested-card, .songs-card, .featured-card, .song-card, .playlist-card, .library-playlist-card",
      );
      if (!card) return;

      const isPlaylist =
        card.classList.contains("featured-card") ||
        card.classList.contains("playlist-card") ||
        card.classList.contains("library-playlist-card");

      if (isPlaylist) {
        const artistName =
          card.dataset.artist ||
          card.querySelector("h1, h4")?.textContent.trim();
        optionsSheet.dataset.itemType = "playlist";
        optionsSheet.dataset.artistName = artistName;

        const firstSong = songs.find((s) => s.artist === artistName);
        optCover.src = firstSong
          ? firstSong.cover
          : card.querySelector("img")?.src || "";
        optTitle.innerText = `${artistName} Mix`;
        optArtist.innerText = "Playlist";

        let likedPlaylists =
          JSON.parse(localStorage.getItem("likedPlaylists")) || [];
        updateMenuHeartIcon(likedPlaylists.includes(artistName));
      } else {
        optionsSheet.dataset.itemType = "song";
        let selectedSongIndex = -1;

        if (card.dataset.index !== undefined) {
          selectedSongIndex = parseInt(card.dataset.index);
        } else {
          const titleText = (
            card.querySelector(".player-title, h4, h3, h1")?.textContent || ""
          ).trim();
          selectedSongIndex = songs.findIndex(
            (s) => s.title.toLowerCase().trim() === titleText.toLowerCase(),
          );
        }

        if (selectedSongIndex !== -1 && songs[selectedSongIndex]) {
          const selectedSong = songs[selectedSongIndex];
          optionsSheet.dataset.songIndex = selectedSongIndex;
          optCover.src = selectedSong.cover;
          optTitle.innerText = selectedSong.title;
          optArtist.innerText = selectedSong.artist;

          let likedSongs =
            typeof getLikedSongs === "function"
              ? getLikedSongs()
              : JSON.parse(localStorage.getItem("likedSongs")) || [];
          updateMenuHeartIcon(likedSongs.includes(selectedSongIndex));
        } else {
          optionsSheet.dataset.songIndex = "";
          optCover.src = card.querySelector("img")?.src || "";
          optTitle.innerText =
            card.querySelector(".player-title, h4, h3, h1")?.textContent ||
            "Unknown Title";
          optArtist.innerText =
            card.querySelector(".player-artist, p")?.textContent ||
            "Unknown Artist";
          updateMenuHeartIcon(false);
        }
      }

      optionsOverlay?.classList.remove("hidden");
      optionsOverlay?.classList.add("active");
      optionsSheet?.classList.add("active");
    }
  });

  function closeOptionsSheet() {
    if (!optionsSheet || !optionsOverlay) return;
    optionsSheet.classList.remove("active");
    optionsOverlay.classList.remove("active");
    setTimeout(() => optionsOverlay.classList.add("hidden"), 300);
  }

  optionsOverlay?.addEventListener("click", closeOptionsSheet);

  optLikeBtn?.addEventListener("click", () => {
    const itemType = optionsSheet.dataset.itemType;

    if (itemType === "playlist") {
      const artistName = optionsSheet.dataset.artistName;
      let likedPlaylists =
        JSON.parse(localStorage.getItem("likedPlaylists")) || [];

      if (likedPlaylists.includes(artistName)) {
        likedPlaylists = likedPlaylists.filter((name) => name !== artistName);
        if (typeof showToast === "function")
          showToast(`Removed ${artistName} Mix`);
      } else {
        likedPlaylists.push(artistName);
        if (typeof showToast === "function")
          showToast(`Saved ${artistName} Mix`);
      }
      localStorage.setItem("likedPlaylists", JSON.stringify(likedPlaylists));
      if (typeof renderLibrary === "function") renderLibrary();
    } else {
      const songIndex = parseInt(optionsSheet.dataset.songIndex);

      if (isNaN(songIndex) || songIndex < 0) {
        if (typeof showToast === "function")
          showToast("Error: Cannot like this item.");
        setTimeout(closeOptionsSheet, 250);
        return;
      }

      if (typeof toggleLikedSong === "function") {
        const isNowLiked = toggleLikedSong(songIndex);
        if (typeof showToast === "function")
          showToast(
            isNowLiked ? "Added to Liked Songs" : "Removed from Liked Songs",
          );

        if (
          typeof currentSongIndex !== "undefined" &&
          currentSongIndex === songIndex
        ) {
          isFavorite = isNowLiked;
          if (typeof updateFavoriteButton === "function")
            updateFavoriteButton();
        }

        if (typeof renderFavoritesCount === "function") renderFavoritesCount();
        if (typeof renderLikedSongs === "function") renderLikedSongs();
      } else {
        let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
        if (likedSongs.includes(songIndex)) {
          likedSongs = likedSongs.filter((id) => id !== songIndex);
          if (typeof showToast === "function")
            showToast("Removed from Liked Songs");
        } else {
          likedSongs.push(songIndex);
          if (typeof showToast === "function")
            showToast("Added to Liked Songs");
        }
        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
      }
      if (typeof renderLibrary === "function") renderLibrary();
    }

    setTimeout(closeOptionsSheet, 250);
  });

  const optPlayNext = document.getElementById("opt-queue-next");
  const optAddQueue = document.getElementById("opt-queue-last");

  optPlayNext?.addEventListener("click", () => {
    if (optionsSheet.dataset.itemType === "playlist") {
      const artistName = optionsSheet.dataset.artistName;
      const mixSongs = songs.filter((s) => s.artist === artistName);

      if (mixSongs.length > 0) {
        mixSongs.forEach((song) => {
          window.userQueue = window.userQueue.filter((s) => s.id !== song.id);
        });
        window.userQueue = [...mixSongs, ...window.userQueue];
        if (typeof showToast === "function")
          showToast(`Playing ${artistName} Mix next`);
      }
    } else {
      const songIndex = parseInt(optionsSheet.dataset.songIndex);
      const songToQueue = songs[songIndex];
      if (songToQueue) {
        window.userQueue = window.userQueue.filter(
          (s) => s.id !== songToQueue.id,
        );
        window.userQueue.unshift(songToQueue);
        if (typeof showToast === "function")
          showToast(`Will play next: ${songToQueue.title}`);
      }
    }
    // 🌟 FIX: Save manual queue instantly
    localStorage.setItem("userQueue", JSON.stringify(window.userQueue));
    closeOptionsSheet();
  });

  optAddQueue?.addEventListener("click", () => {
    if (optionsSheet.dataset.itemType === "playlist") {
      const artistName = optionsSheet.dataset.artistName;
      const mixSongs = songs.filter((s) => s.artist === artistName);

      if (mixSongs.length > 0) {
        mixSongs.forEach((song) => {
          window.userQueue = window.userQueue.filter((s) => s.id !== song.id);
        });
        window.userQueue = [...window.userQueue, ...mixSongs];
        if (typeof showToast === "function")
          showToast(`Added ${artistName} Mix to queue`);
      }
    } else {
      const songIndex = parseInt(optionsSheet.dataset.songIndex);
      const songToQueue = songs[songIndex];
      if (songToQueue) {
        window.userQueue = window.userQueue.filter(
          (s) => s.id !== songToQueue.id,
        );
        window.userQueue.push(songToQueue);
        if (typeof showToast === "function")
          showToast(`Added to queue: ${songToQueue.title}`);
      }
    }
    // 🌟 FIX: Save manual queue instantly
    localStorage.setItem("userQueue", JSON.stringify(window.userQueue));
    closeOptionsSheet();
  });

  const optShareBtn =
    document.getElementById("opt-share") ||
    document.querySelector(".more-menu-share");
  optShareBtn?.addEventListener("click", async () => {
    const isPlaylist = optionsSheet.dataset.itemType === "playlist";
    const title = isPlaylist
      ? `${optionsSheet.dataset.artistName} Mix`
      : optTitle.innerText;
    const shareText = `Check out ${title} on Aura!`;
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: title, text: shareText, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        if (typeof showToast === "function")
          showToast("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Share canceled");
    }
    closeOptionsSheet();
  });

  const homeScreen = document.querySelector(".home-screen");
  const libraryScreen = document.querySelector(".library-screen");
  const likedSongsScreen = document.querySelector(".liked-songs-screen");
  const searchScreen = document.querySelector(".search-screen");
  const profileScreen = document.querySelector(".profile-screen");

  function hideAllScreens() {
    [
      homeScreen,
      libraryScreen,
      likedSongsScreen,
      searchScreen,
      profileScreen,
    ].forEach((screen) => {
      if (screen) screen.classList.add("hidden");
    });
  }

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.textContent.toLowerCase();

      document
        .querySelectorAll(".nav-item")
        .forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");

      if (text.includes("library")) {
        hideAllScreens();
        libraryScreen?.classList.remove("hidden");
        if (typeof renderLibrary === "function") renderLibrary();
      } else if (text.includes("home")) {
        hideAllScreens();
        homeScreen?.classList.remove("hidden");
      } else if (text.includes("search")) {
        hideAllScreens();
        searchScreen?.classList.remove("hidden");
      } else if (text.includes("profile")) {
        hideAllScreens();
        profileScreen?.classList.remove("hidden");
      }
    });
  });

  document
    .querySelector(".back-to-library-btn")
    ?.addEventListener("click", () => {
      likedSongsScreen?.classList.add("hidden");
      libraryScreen?.classList.remove("hidden");
    });
});

function renderFeaturedPlaylists() {
  const container = document.getElementById("featuredPlaylistList");
  if (!container || typeof songs === "undefined" || !songs.length) return;

  let uniqueArtists = [...new Set(songs.map((song) => song.artist))];
  uniqueArtists = uniqueArtists.sort(() => 0.5 - Math.random()).slice(0, 6);

  container.innerHTML = uniqueArtists
    .map((artist) => {
      const artistSongs = songs.filter((s) => s.artist === artist);
      const leadSong = artistSongs[0];

      return `
      <article class="featured-card" data-artist="${artist}" style="cursor: pointer;">
        <img src="${leadSong?.cover || ""}" alt="${artist} Mix">
        <div class="featured-card-footer">
          <div class="featured-card-info">
            <p>Artist Mix</p>
            <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${artist}</h4>
          </div>
          <button class="more-btn"><i data-lucide="more-vertical" size="16"></i></button>
        </div>
        <div style="display: none;">
          <h4 class="player-title">${leadSong?.title || ""}</h4>
          <p class="player-artist">${leadSong?.artist || ""}</p>
        </div>
      </article>`;
    })
    .join("");

  if (typeof lucide !== "undefined") lucide.createIcons();

  container.onclick = (e) => {
    const card = e.target.closest(".featured-card");
    const moreBtn = e.target.closest(".more-btn");

    if (card && !moreBtn) {
      const artistName = card.dataset.artist;
      const mixIndices = songs
        .map((s, index) => (s.artist === artistName ? index : -1))
        .filter((index) => index !== -1);

      if (mixIndices.length > 0) {
        window.currentPlaylistQueue = mixIndices;
        window.currentPlaylistName = `${artistName} Mix`;
        if (typeof updatePlayingFromUI === "function") updatePlayingFromUI();

        currentSongIndex = mixIndices[0];
        if (typeof loadSong === "function") loadSong(currentSongIndex);
        if (typeof playSong === "function") playSong();
        if (typeof showToast === "function")
          showToast(`Playing ${artistName} Mix`);
        if (typeof renderQueue === "function") renderQueue();
      }
    }
  };
}

function renderLibrary() {
  const grid = document.getElementById("library-grid");
  if (!grid) return;

  const likedSongs =
    typeof getLikedSongs === "function"
      ? getLikedSongs()
      : JSON.parse(localStorage.getItem("likedSongs")) || [];
  const likedPlaylists =
    JSON.parse(localStorage.getItem("likedPlaylists")) || [];

  let html = `
    <style>
      .library-playlist-card .lib-play-btn { opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
      .library-playlist-card:hover .lib-play-btn { opacity: 1; transform: translateY(0); }
      .library-playlist-card:hover .lib-bg { transform: scale(1.05); }
    </style>

    <div id="btn-liked-songs" style="background: var(--clr-surface-light, #2a2a35); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; aspect-ratio: 1/1; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.2s;">
      <i data-lucide="heart" style="fill: white; color: white; margin-bottom: 12px; width: 32px; height: 32px;"></i>
      <h4 style="margin: 0; font-size: 1.05rem; font-weight: 600;">Liked Songs</h4>
      <p style="margin: 6px 0 0 0; font-size: 0.8rem; color: var(--clr-text-muted, #aaa);">${likedSongs.length} songs</p>
    </div>
  `;

  likedPlaylists.forEach((artistName) => {
    const artistSongs =
      typeof songs !== "undefined"
        ? songs.filter((s) => s.artist === artistName)
        : [];
    const coverImg = artistSongs.length > 0 ? artistSongs[0].cover : "";

    html += `
      <div class="library-playlist-card" data-artist="${artistName}" style="position: relative; border-radius: 12px; cursor: pointer; aspect-ratio: 1/1; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
        <div class="lib-bg" style="position: absolute; inset: 0; background-image: url('${coverImg}'); background-size: cover; background-position: center; z-index: 1; transition: transform 0.4s ease;"></div>
        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%); z-index: 2;"></div>
        <button class="more-btn" style="position: absolute; top: 10px; right: 10px; z-index: 4; background: rgba(0,0,0,0.5); border: none; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px);">
          <i data-lucide="more-vertical" size="18"></i>
        </button>
        <button class="lib-play-btn" style="position: absolute; bottom: 15px; right: 15px; z-index: 4; background: var(--clr-primary, #a855f7); border: none; color: white; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.4);">
          <i data-lucide="play" size="22" fill="currentColor" style="margin-left: 2px;"></i>
        </button>
        <div style="position: relative; z-index: 3; pointer-events: none; width: 70%;">
          <h4 style="margin: 0; font-size: 1rem; color: white; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${artistName} Mix</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px;">Playlist</p>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

document.getElementById("library-grid")?.addEventListener("click", (e) => {
  const likedBtn = e.target.closest("#btn-liked-songs");
  if (likedBtn) {
    document.querySelector(".library-screen")?.classList.add("hidden");
    document.querySelector(".liked-songs-screen")?.classList.remove("hidden");
    if (typeof renderLikedSongs === "function") renderLikedSongs();
    return;
  }

  const playlistCard = e.target.closest(".library-playlist-card");
  const playBtn = e.target.closest(".lib-play-btn");
  const moreBtn = e.target.closest(".more-btn");

  if (moreBtn) return;

  if (playlistCard && typeof songs !== "undefined") {
    const artistName = playlistCard.dataset.artist;
    const mixIndices = songs
      .map((s, index) => (s.artist === artistName ? index : -1))
      .filter((index) => index !== -1);

    if (mixIndices.length > 0) {
      if (playBtn) {
        e.stopPropagation();
        window.currentPlaylistQueue = mixIndices;
        window.currentPlaylistName = `${artistName} Mix`;
        if (typeof updatePlayingFromUI === "function") updatePlayingFromUI();

        currentSongIndex = mixIndices[0];
        if (typeof loadSong === "function") loadSong(currentSongIndex);
        if (typeof playSong === "function") playSong();
        if (typeof showToast === "function")
          showToast(`Playing ${artistName} Mix`);
        if (typeof renderQueue === "function") renderQueue();
      } else {
        openLibraryPlaylistDetail(artistName, mixIndices);
      }
    }
  }
});

function openLibraryPlaylistDetail(artistName, mixIndices) {
  const detailScreen = document.querySelector(".playlist-detail-screen");
  const libraryScreen = document.querySelector(".library-screen");

  if (!detailScreen || !libraryScreen || typeof songs === "undefined") return;

  libraryScreen.classList.add("hidden");
  detailScreen.classList.remove("hidden");

  const leadSong = songs[mixIndices[0]];
  const coverImg = document.getElementById("playlist-detail-cover");

  // 🌟 FIX 1: Wrap the image to safely crop out the YouTube black bars!
  if (coverImg) {
    if (!coverImg.parentElement.classList.contains("cover-wrapper")) {
      const wrapper = document.createElement("div");
      wrapper.className = "cover-wrapper";
      wrapper.style.width = "220px";
      wrapper.style.height = "220px";
      wrapper.style.borderRadius = "var(--radius-xl)";
      wrapper.style.overflow = "hidden"; // Hides the zoomed black bars
      wrapper.style.margin = "0 auto 1rem auto";
      wrapper.style.boxShadow = "var(--shadow-lg)";

      coverImg.parentNode.insertBefore(wrapper, coverImg);
      wrapper.appendChild(coverImg);

      coverImg.style.width = "100%";
      coverImg.style.height = "100%";
      coverImg.style.margin = "0";
      coverImg.style.boxShadow = "none";
      coverImg.style.objectFit = "cover";
    }

    coverImg.src = leadSong.cover || "";
    // If it's a YouTube hqdefault, zoom in 35% to hide the black bars
    coverImg.style.transform =
      leadSong.cover && leadSong.cover.includes("hqdefault")
        ? "scale(1.35)"
        : "scale(1)";
  }

  document.getElementById("playlist-detail-name").innerText =
    `${artistName} Mix`;
  document.getElementById("playlist-detail-count").innerText =
    `${mixIndices.length} Songs`;

  const detailSongs = document.querySelector(".playlist-detail-songs");
  if (detailSongs) {
    // 🌟 FIX 2: Force strict vertical layout for the song list
    detailSongs.style.display = "flex";
    detailSongs.style.flexDirection = "column";
    detailSongs.style.padding = "0 20px 120px 20px";
    detailSongs.style.width = "100%";
    detailSongs.style.gap = "0";

    detailSongs.innerHTML = mixIndices
      .map((index) => {
        const s = songs[index];
        const isHq = s.cover && s.cover.includes("hqdefault");

        // 🌟 FIX 3: Structured list item with proper truncation and cropped mini-covers
        return `
        <article class="songs-card" data-index="${index}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; width: 100%;">
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
        </article>
      `;
      })
      .join("");

    if (typeof lucide !== "undefined") lucide.createIcons();

    detailSongs.onclick = (e) => {
      const card = e.target.closest(".songs-card");
      const mBtn = e.target.closest(".more-btn");
      if (card && !mBtn) {
        const songIdx = Number(card.dataset.index);
        window.currentPlaylistQueue = mixIndices;
        window.currentPlaylistName = `${artistName} Mix`;
        if (typeof updatePlayingFromUI === "function") updatePlayingFromUI();

        if (typeof loadSong === "function") loadSong(songIdx);
        if (typeof playSong === "function") playSong();
      }
    };
  }
}

document.getElementById("mini-prev")?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (typeof prevSong === "function") prevSong();
});

// ==========================================
// DYNAMIC PLAYER GRADIENT (ColorThief)
// ==========================================
const miniCoverImg = document.getElementById("miniCover");
const miniPlayerBox = document.getElementById("miniPlayer");
const fullPlayerScreen = document.querySelector(".player-screen");
const fullCoverImg = document.querySelector(".player-cover-img");

if (miniCoverImg && miniPlayerBox) {
  miniCoverImg.addEventListener("load", function () {
    try {
      const colorThief = new ColorThief();
      const [r, g, b] = colorThief.getColor(miniCoverImg);

      miniPlayerBox.style.background = `linear-gradient(to right, var(--clr-bg) 5%, rgba(${r}, ${g}, ${b}, 0.4) 50%, var(--clr-bg) 95%)`;
      miniCoverImg.style.boxShadow = `0 4px 20px rgba(${r}, ${g}, ${b}, 0.6)`;
      miniPlayerBox.style.borderTop = `1px solid rgba(${r}, ${g}, ${b}, 0.3)`;

      if (fullPlayerScreen) {
        fullPlayerScreen.style.backgroundImage = `radial-gradient(circle at 50% 40%, rgba(${r}, ${g}, ${b}, 0.5) 0%, var(--clr-bg) 70%)`;
      }
      if (fullCoverImg) {
        fullCoverImg.style.boxShadow = `0 25px 60px rgba(${r}, ${g}, ${b}, 0.5)`;
      }
    } catch (error) {
      console.log("ColorThief blocked by CORS, using default background.");
      miniPlayerBox.style.background = "var(--clr-surface-light)";
      miniPlayerBox.style.borderTop = "1px solid var(--clr-border)";
      miniCoverImg.style.boxShadow = "none";
      if (fullPlayerScreen) fullPlayerScreen.style.background = "var(--clr-bg)";
      if (fullCoverImg) fullCoverImg.style.boxShadow = "var(--shadow-lg)";
    }
  });
}

// ==========================================
// QUEUE SCREEN UI TOGGLE LOGIC
// ==========================================
window.addEventListener(
  "click",
  (e) => {
    const qBtn = e.target.closest(".queue-btn");
    const cBtn = e.target.closest(".close-queue");
    const qScreen = document.querySelector(".queue-screen");

    if (qBtn && qScreen) {
      e.stopPropagation();
      e.preventDefault();
      if (qScreen.classList.contains("show")) {
        qScreen.classList.remove("show");
      } else {
        if (typeof renderQueue === "function") renderQueue();
        qScreen.classList.add("show");
      }
    }

    if (cBtn && qScreen) {
      e.stopPropagation();
      qScreen.classList.remove("show");
    }
  },
  true,
);
