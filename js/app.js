// ==========================================
// GLOBAL VARIABLES & UTILITIES
// ==========================================
let userQueue = []; // Temporarily holds our queued songs

// Global Toast Notification Function
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
  // --- 1. Load Saved State ---
  const savedIndex = localStorage.getItem("currentSongIndex");
  if (savedIndex !== null && songs && songs[Number(savedIndex)]) {
    currentSongIndex = Number(savedIndex);
  } else {
    currentSongIndex = 0;
  }

  if (songs && songs.length > 0) {
    if (typeof loadSong === "function") loadSong(currentSongIndex);
  }

  // --- 2. Render UI Sections ---
  if (typeof renderRecentSongs === "function") renderRecentSongs();
  if (typeof renderPlaylists === "function") renderPlaylists();
  if (typeof renderSuggestedSongs === "function") renderSuggestedSongs();
  if (typeof renderFeaturedPlaylists === "function") renderFeaturedPlaylists();
  if (typeof renderFavoritesCount === "function") renderFavoritesCount();
  if (typeof renderLibrary === "function") renderLibrary();

  // ==========================================
  // 3-DOT OPTIONS MENU LOGIC (Dual-Mode)
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

  // 1. OPENING THE MENU (Bulletproof Matcher)
  document.body.addEventListener("click", (e) => {
    const moreBtn = e.target.closest(".more-btn");
    if (moreBtn) {
      e.stopPropagation();
      const card = moreBtn.closest(
        ".suggested-card, .songs-card, .featured-card, .song-card, article, div",
      );
      if (!card) return;

      const isPlaylist = card.classList.contains("featured-card");

      if (isPlaylist) {
        // --- PLAYLIST MODE ---
        const artistName = card.dataset.artist;
        optionsSheet.dataset.itemType = "playlist";
        optionsSheet.dataset.artistName = artistName;

        optCover.src = card.querySelector("img")?.src || "";
        optTitle.innerText = `${artistName} Mix`;
        optArtist.innerText = "Playlist";

        let likedPlaylists =
          JSON.parse(localStorage.getItem("likedPlaylists")) || [];
        updateMenuHeartIcon(likedPlaylists.includes(artistName));
      } else {
        // --- SONG MODE ---
        optionsSheet.dataset.itemType = "song";

        // 🌟 ROBUST MATCHING: Find the song precisely
        let selectedSong = null;

        // 1. Try matching via direct data attributes if available
        const directId = card.dataset.songId || card.dataset.index;
        if (directId !== undefined && songs[directId]) {
          selectedSong = songs[directId];
        }

        // 2. Fallback: Clean and precise text matching
        if (!selectedSong) {
          const titleEl = card.querySelector(
            ".player-title, h4, h3, .song-title",
          );
          const artistEl = card.querySelector(
            ".player-artist, p, .song-artist",
          );

          const title = (
            titleEl?.textContent ||
            titleEl?.innerText ||
            ""
          ).trim();
          const artist = (
            artistEl?.textContent ||
            artistEl?.innerText ||
            ""
          ).trim();

          selectedSong = songs.find(
            (s) =>
              s.title.toLowerCase() === title.toLowerCase() &&
              s.artist.toLowerCase() === artist.toLowerCase(),
          );
        }

        // 3. Absolute fallback to whatever image/text is inside the card if database lookup fails
        const coverSrc = card.querySelector("img")?.src || "";
        const fallbackTitle =
          card.querySelector("h4, h3")?.textContent || "Unknown Title";
        const fallbackArtist =
          card.querySelector("p")?.textContent || "Unknown Artist";

        if (selectedSong) {
          optionsSheet.dataset.songId = selectedSong.id;
          optCover.src = selectedSong.cover || coverSrc;
          optTitle.innerText = selectedSong.title;
          optArtist.innerText = selectedSong.artist;

          let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
          updateMenuHeartIcon(likedSongs.includes(selectedSong.id));
        } else {
          // If no database match, use visual elements directly
          optionsSheet.dataset.songId = "";
          optCover.src = coverSrc;
          optTitle.innerText = fallbackTitle.trim();
          optArtist.innerText = fallbackArtist.trim();
          updateMenuHeartIcon(false);
        }
      }

      optionsOverlay?.classList.remove("hidden");
      optionsOverlay?.classList.add("active");
      optionsSheet?.classList.add("active");
    }
  });

  // 2. CLOSING THE MENU
  function closeOptionsSheet() {
    if (!optionsSheet || !optionsOverlay) return;
    optionsSheet.classList.remove("active");
    optionsOverlay.classList.remove("active");
    setTimeout(() => optionsOverlay.classList.add("hidden"), 300);
  }

  optionsOverlay?.addEventListener("click", closeOptionsSheet);

  // 3. THE LIKE BUTTON LOGIC
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
      const songId = parseInt(optionsSheet.dataset.songId);
      let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];

      if (likedSongs.includes(songId)) {
        likedSongs = likedSongs.filter((id) => id !== songId);
        if (typeof showToast === "function")
          showToast("Removed from Liked Songs");
      } else {
        likedSongs.push(songId);
        if (typeof showToast === "function") showToast("Added to Liked Songs");
      }
      localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
      if (typeof renderLibrary === "function") renderLibrary();
    }

    setTimeout(closeOptionsSheet, 250);
  });

  // 4. QUEUE SYSTEM LOGIC
  const optPlayNext = document.getElementById("opt-queue-next");
  const optAddQueue = document.getElementById("opt-queue-last");
  window.userQueue = window.userQueue || [];

  optPlayNext?.addEventListener("click", () => {
    if (optionsSheet.dataset.itemType === "playlist") {
      if (typeof showToast === "function")
        showToast("Playlists load instantly on click!");
    } else {
      const songId = parseInt(optionsSheet.dataset.songId);
      const songToQueue = songs.find((s) => s.id === songId);
      if (songToQueue) {
        window.userQueue = window.userQueue.filter((s) => s.id !== songId);
        window.userQueue.unshift(songToQueue);
        if (typeof showToast === "function")
          showToast(`Will play next: ${songToQueue.title}`);
      }
    }
    closeOptionsSheet();
  });

  optAddQueue?.addEventListener("click", () => {
    if (optionsSheet.dataset.itemType === "playlist") {
      if (typeof showToast === "function")
        showToast("Added playlist to background queue!");
    } else {
      const songId = parseInt(optionsSheet.dataset.songId);
      const songToQueue = songs.find((s) => s.id === songId);
      if (songToQueue) {
        window.userQueue = window.userQueue.filter((s) => s.id !== songId);
        window.userQueue.push(songToQueue);
        if (typeof showToast === "function")
          showToast(`Added to queue: ${songToQueue.title}`);
      }
    }
    closeOptionsSheet();
  });

  // 5. SHARE LOGIC
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

  // ==========================================
  // NATIVE SCREEN SWITCHING (FIXED GLITCH)
  // ==========================================
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

      // Update active nav styling
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

  // Back button from Liked Songs view
  document
    .querySelector(".back-to-library-btn")
    ?.addEventListener("click", () => {
      likedSongsScreen?.classList.add("hidden");
      libraryScreen?.classList.remove("hidden");
    });
});

// ==========================================
// FEATURED PLAYLISTS ENGINE (ARTIST MIXES)
// ==========================================
function renderFeaturedPlaylists() {
  const container = document.getElementById("featuredPlaylistList");
  if (!container || !songs || !songs.length) return;

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
            <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">
              ${artist}
            </h4>
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

// ==========================================
// LIBRARY SCREEN ENGINE
// ==========================================
function renderLibrary() {
  const grid = document.getElementById("library-grid");
  if (!grid) return;

  const likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
  const likedPlaylists =
    JSON.parse(localStorage.getItem("likedPlaylists")) || [];

  let html = `
    <div id="btn-liked-songs" style="background: var(--clr-surface-light, #2a2a35); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; aspect-ratio: 1/1; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
      <i data-lucide="heart" style="fill: white; color: white; margin-bottom: 12px; width: 32px; height: 32px;"></i>
      <h4 style="margin: 0; font-size: 1.05rem; font-weight: 600;">Liked Songs</h4>
      <p style="margin: 6px 0 0 0; font-size: 0.8rem; color: var(--clr-text-muted, #aaa);">${likedSongs.length} songs</p>
    </div>
  `;

  likedPlaylists.forEach((artistName) => {
    const artistSongs = songs.filter((s) => s.artist === artistName);
    const coverImg = artistSongs.length > 0 ? artistSongs[0].cover : "";

    html += `
      <div class="library-playlist-card" data-artist="${artistName}" style="position: relative; border-radius: 12px; cursor: pointer; aspect-ratio: 1/1; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
        <div style="position: absolute; inset: 0; background-image: url('${coverImg}'); background-size: cover; background-position: center; z-index: 1;"></div>
        <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%); z-index: 2;"></div>
        <div style="position: relative; z-index: 3;">
          <h4 style="margin: 0; font-size: 1rem; color: white; font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${artistName} Mix</h4>
          <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px;">Playlist</p>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Handle clicks inside the Library Grid
document.getElementById("library-grid")?.addEventListener("click", (e) => {
  const likedBtn = e.target.closest("#btn-liked-songs");
  if (likedBtn) {
    openLikedSongsView();
    return;
  }

  const playlistCard = e.target.closest(".library-playlist-card");
  if (playlistCard) {
    const artistName = playlistCard.dataset.artist;
    const mixIndices = songs
      .map((s, index) => (s.artist === artistName ? index : -1))
      .filter((index) => index !== -1);

    if (mixIndices.length > 0) {
      window.currentPlaylistQueue = mixIndices;
      currentSongIndex = mixIndices[0];

      if (typeof loadSong === "function") loadSong(currentSongIndex);
      if (typeof playSong === "function") playSong();
      if (typeof showToast === "function")
        showToast(`Playing ${artistName} Mix`);
      if (typeof renderQueue === "function") renderQueue();
    }
  }
});

// Open and render Liked Songs Sub-screen
function openLikedSongsView() {
  const libraryScreen = document.querySelector(".library-screen");
  const likedSongsScreen = document.querySelector(".liked-songs-screen");
  const likedSongsList = document.querySelector(
    ".liked-songs-screen .liked-songs-list",
  );

  const likedSongIds = JSON.parse(localStorage.getItem("likedSongs")) || [];
  if (likedSongIds.length === 0) {
    if (typeof showToast === "function") showToast("No liked songs yet!");
    return;
  }

  libraryScreen?.classList.add("hidden");
  likedSongsScreen?.classList.remove("hidden");

  let html = "";
  likedSongIds.forEach((songId) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;

    html += `
      <div class="liked-song-row" data-song-id="${song.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0;">
          <img src="${song.cover || ""}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover;">
          <div style="min-width: 0;">
            <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</h4>
            <p style="margin: 0; font-size: 0.75rem; color: var(--clr-text-muted);">${song.artist}</p>
          </div>
        </div>
      </div>
    `;
  });

  if (likedSongsList) {
    likedSongsList.innerHTML = html;
    if (typeof lucide !== "undefined") lucide.createIcons();

    likedSongsList.onclick = (e) => {
      const row = e.target.closest(".liked-song-row");
      if (row) {
        const songId = Number(row.dataset.songId);
        const realIndex = songs.findIndex((s) => s.id === songId);
        if (realIndex !== -1) {
          currentSongIndex = realIndex;
          window.currentPlaylistQueue = likedSongIds
            .map((id) => songs.findIndex((s) => s.id === id))
            .filter((i) => i !== -1);
          if (typeof loadSong === "function") loadSong(currentSongIndex);
          if (typeof playSong === "function") playSong();
          if (typeof showToast === "function")
            showToast(`Playing ${songs[realIndex].title}`);
        }
      }
    };
  }
}
