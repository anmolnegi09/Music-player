// ----------------------
// Mini Player & Initialization
// ----------------------
function loadSong(index) {
  if (!songs || !songs[index]) return;

  currentSongIndex = index;
  localStorage.setItem("currentSongIndex", currentSongIndex);

  // 🌟 FIX: Save the active queue and name to survive reloads!
  localStorage.setItem("currentPlaylistName", window.currentPlaylistName || "");
  localStorage.setItem(
    "currentPlaylistQueue",
    JSON.stringify(window.currentPlaylistQueue || []),
  );

  if (typeof saveRecentSong === "function") {
    saveRecentSong(currentSongIndex);
  }

  if (typeof renderRecentSongs === "function") {
    renderRecentSongs();
  }

  const song = songs[currentSongIndex];

  if (song.cover && song.cover.includes("hqdefault.jpg")) {
    song.cover = song.cover.replace("hqdefault.jpg", "maxresdefault.jpg");
  }

  applyDynamicColor(song.cover);
  updateMiniPlayer(song);
  updateFullPlayer(song);

  audio.src = song.audio;
  updatePlayerButton();

  const liked = typeof getLikedSongs === "function" ? getLikedSongs() : [];
  isFavorite = liked.includes(currentSongIndex);
  updateFavoriteButton?.();
}
function playSong() {
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => updatePlayerButton())
      .catch((err) => {
        console.warn("Audio load interrupted smoothly. Loading next...", err);
      });
  } else {
    updatePlayerButton();
  }
}

function updateMiniPlayer(song) {
  if (miniCover) {
    miniCover.src = song.cover || "";
    miniCover.alt = song.title || "Unknown";
  }
  if (miniArtist) miniArtist.textContent = song.artist || "Unknown Artist";
  if (miniTitle) miniTitle.textContent = song.title || "Unknown Title";
}

function updateFullPlayer(song) {
  if (playerCover) {
    playerCover.src = song.cover || "";
    playerCover.alt = song.title || "Unknown";
  }
  if (playerTitle) playerTitle.textContent = song.title || "Unknown Title";
  if (playerArtist) playerArtist.textContent = song.artist || "Unknown Artist";
}

// ----------------------
// Mini Player Buttons
// ----------------------
miniNextBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  playNext();
});

miniLikeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (typeof toggleLikedSong === "function") {
    isFavorite = toggleLikedSong(currentSongIndex);
    updateFavoriteButton?.();
    renderFavoritesCount?.();
  }
});

// ----------------------
// Play / Pause Logic
// ----------------------
function updatePlayerButton() {
  const icon = audio.paused ? "play" : "pause";
  const iconHTML = `<i data-lucide="${icon}"></i>`;

  if (playerBtn) playerBtn.innerHTML = iconHTML;
  if (playBtnLarge) playBtnLarge.innerHTML = iconHTML;

  if (typeof lucide !== "undefined") lucide.createIcons();
}

function togglePlay(e) {
  if (e) e.stopPropagation();
  audio.paused ? playSong() : audio.pause();
  updatePlayerButton();
}

playerBtn?.addEventListener("click", togglePlay);
playBtnLarge?.addEventListener("click", togglePlay);

// ----------------------
// Player Screen Navigation
// ----------------------
const allPlayerScreens = [
  homeScreen,
  searchScreen,
  libraryScreen,
  profileScreen,
  playlistDetailScreen,
  likedSongsScreen,
];

function openFullPlayer() {
  activeScreenBeforePlayer =
    allPlayerScreens.find(
      (screen) => screen && !screen.classList.contains("hidden"),
    ) || null;

  allPlayerScreens.forEach((screen) => screen?.classList.add("hidden"));
  playerScreen?.classList.remove("hidden");
}

miniPlayer?.addEventListener("click", openFullPlayer);

backBtn?.addEventListener("click", () => {
  playerScreen?.classList.add("hidden");
  (activeScreenBeforePlayer || homeScreen)?.classList.remove("hidden");
});

// ----------------------
// Progress Bar
// ----------------------
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progressBar.value = (audio.currentTime / audio.duration) * 100;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

progressBar?.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// ----------------------
// Track Navigation (Smart Queue Engine)
// ----------------------
function playNext() {
  // Priority 1: User explicitly queued a manual song
  if (window.userQueue && window.userQueue.length > 0) {
    const nextQueuedSong = window.userQueue.shift();
    const queuedIndex = songs.findIndex((s) => s.id === nextQueuedSong.id);
    if (queuedIndex !== -1) {
      currentSongIndex = queuedIndex;
      loadSong(currentSongIndex);
      playSong();
      if (typeof renderQueue === "function") renderQueue();
      return;
    }
  }

  // Priority 2: Use Playlist Queue or default to all songs
  const activeArray =
    window.currentPlaylistQueue && window.currentPlaylistQueue.length > 0
      ? window.currentPlaylistQueue
      : songs.map((_, i) => i);

  if (typeof isShuffle !== "undefined" && isShuffle) {
    currentSongIndex =
      activeArray[Math.floor(Math.random() * activeArray.length)];
  } else {
    const currentIndex = activeArray.indexOf(currentSongIndex);
    currentSongIndex = activeArray[(currentIndex + 1) % activeArray.length];
  }

  loadSong(currentSongIndex);
  playSong();
  if (typeof renderQueue === "function") renderQueue();
}

function playPrevious() {
  const activeArray =
    window.currentPlaylistQueue && window.currentPlaylistQueue.length > 0
      ? window.currentPlaylistQueue
      : songs.map((_, i) => i);

  const currentIndex = activeArray.indexOf(currentSongIndex);

  if (currentIndex === -1) {
    currentSongIndex = activeArray[0];
  } else {
    currentSongIndex =
      activeArray[(currentIndex - 1 + activeArray.length) % activeArray.length];
  }

  loadSong(currentSongIndex);
  playSong();
  if (typeof renderQueue === "function") renderQueue();
}

previousBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  playPrevious();
});

nextBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  playNext();
});

shuffleBtn?.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

repeatBtn?.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

// ----------------------
// Auto-skip on Dead Stream
// ----------------------
let consecutivePlaybackFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 5;

audio.addEventListener("error", () => {
  consecutivePlaybackFailures++;
  console.warn(
    `Playback failed for "${songs[currentSongIndex]?.title}" (${consecutivePlaybackFailures}/${MAX_CONSECUTIVE_FAILURES}). Skipping...`,
  );

  if (consecutivePlaybackFailures >= MAX_CONSECUTIVE_FAILURES) {
    console.error(
      "Too many consecutive playback failures. Stopping auto-skip.",
    );
    return;
  }

  playNext();
});

audio.addEventListener("playing", () => {
  consecutivePlaybackFailures = 0;
});

// ----------------------
// Queue Screen
// ----------------------
queueBtn?.addEventListener("click", () => {
  renderQueue();
  queueScreen?.classList.add("show");
});

closeQueue?.addEventListener("click", () => {
  queueScreen?.classList.remove("show");
});

function renderQueue() {
  const queueList = document.querySelector(".queue-list");
  if (!queueList) return;
  queueList.innerHTML = "";

  let html = "";
  const playlistName = window.currentPlaylistName || "All Songs";

  // 1. MANUAL QUEUE ("Up Next")
  if (window.userQueue && window.userQueue.length > 0) {
    html += `<h4 style="padding: 15px 0 10px 0; color: var(--clr-text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Up Next</h4>`;

    window.userQueue.forEach((song, index) => {
      html += `
        <div class="queue-item" data-queue-index="${index}">
          <img src="${song.cover || ""}" alt="cover" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; overflow: hidden;">
            <p style="margin: 0 0 4px 0; font-size: 0.75rem; text-transform: uppercase; color: var(--clr-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; display: block;">${song.artist || "Unknown"}</p>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 500; color: var(--clr-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; display: block;">${song.title || "Unknown"}</h4>
          </div>
          <button class="remove-queue-btn" data-queue-index="${index}" style="background: none; border: none; padding: 5px; cursor: pointer; color: var(--clr-text-muted); flex-shrink: 0;">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
      `;
    });
  }

  // 2. CONTEXT QUEUE (Playlist or All Songs)
  let activeArray =
    window.currentPlaylistQueue && window.currentPlaylistQueue.length > 0
      ? window.currentPlaylistQueue
      : typeof songs !== "undefined"
        ? songs.map((_, i) => i)
        : [];

  // FIX: Removed the `.slice()` logic entirely! Now it shows previous songs too.

  if (activeArray.length > 0) {
    html += `<h4 style="padding: 15px 0 10px 0; color: var(--clr-text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Playing from ${playlistName}</h4>`;

    activeArray.forEach((songIndex) => {
      const song = songs[songIndex];
      if (!song) return;

      const isPlaying = songIndex === currentSongIndex;
      const playingClass = isPlaying ? "playing" : "";

      // Styling strictly matched to your screenshot (no opacity dimming, just color highlights)
      const rightIcon = isPlaying
        ? `<i data-lucide="bar-chart-2" style="width: 20px; height: 20px; color: var(--clr-primary); margin-left: auto; flex-shrink: 0;"></i>`
        : "";
      const textColor = isPlaying
        ? "var(--clr-primary, #a855f7)"
        : "var(--clr-text, #fff)";
      const artistColor = isPlaying
        ? "var(--clr-primary, #a855f7)"
        : "var(--clr-text-muted, #aaa)";
      const borderStyle = isPlaying
        ? "border: 2px solid var(--clr-primary, #a855f7);"
        : "";

      html += `
        <div class="queue-item ${playingClass}" data-song-index="${songIndex}">
          <img src="${song.cover || ""}" alt="cover" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0; ${borderStyle}">
          <div style="flex: 1; min-width: 0; overflow: hidden;">
            <p style="margin: 0 0 4px 0; font-size: 0.75rem; text-transform: uppercase; color: ${artistColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; display: block;">${song.artist || "Unknown"}</p>
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 500; color: ${textColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; display: block;">${song.title || "Unknown"}</h4>
          </div>
          ${rightIcon}
        </div>
      `;
    });
  }

  // 3. EMPTY STATE
  if (html === "") {
    queueList.innerHTML = `
      <div style="text-align: center; padding: var(--space-8) var(--space-4); color: var(--clr-text-muted);">
        <i data-lucide="list-music" style="width: 48px; height: 48px; margin-bottom: 10px; opacity: 0.5;"></i>
        <h3 style="color: var(--clr-text); margin-bottom: 5px;">Your queue is empty</h3>
        <p style="font-size: 0.9rem;">Add songs using the 3-dot menu!</p>
      </div>
    `;
  } else {
    queueList.innerHTML = html;

    // Auto-Scroll to the playing song!
    setTimeout(() => {
      const playingItem = queueList.querySelector(".queue-item.playing");
      if (playingItem) {
        playingItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }

  if (typeof lucide !== "undefined") lucide.createIcons();
}
// ----------------------
// SINGLE UNIFIED QUEUE CLICK LISTENER
// ----------------------
queueList?.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-queue-btn");
  if (removeBtn) {
    e.stopPropagation();
    const indexToRemove = Number(removeBtn.dataset.queueIndex);
    window.userQueue.splice(indexToRemove, 1);
    renderQueue();
    return;
  }

  const queueItem = e.target.closest(".queue-item");
  if (queueItem) {
    if (queueItem.dataset.queueIndex !== undefined) {
      const qIndex = Number(queueItem.dataset.queueIndex);
      const songToPlay = window.userQueue[qIndex];
      if (songToPlay) {
        const realIndex = songs.findIndex((s) => s.id === songToPlay.id);
        if (realIndex !== -1) {
          window.userQueue.splice(qIndex, 1);
          currentSongIndex = realIndex;
          loadSong(currentSongIndex);
          playSong();
          renderQueue();
        }
      }
      return;
    }

    if (queueItem.dataset.songIndex !== undefined) {
      const realIndex = Number(queueItem.dataset.songIndex);
      currentSongIndex = realIndex;
      loadSong(currentSongIndex);
      playSong();
      renderQueue();
    }
  }
});

// ----------------------
// Favorite Feature Button
// ----------------------
favoriteBtn?.addEventListener("click", () => {
  if (typeof toggleLikedSong === "function") {
    isFavorite = toggleLikedSong(currentSongIndex);
    updateFavoriteButton?.();
    renderFavoritesCount?.();
  }
});

// ----------------------
// Dynamic Color System
// ----------------------
const colorProbeImg = new Image();
colorProbeImg.crossOrigin = "Anonymous";

colorProbeImg.onload = () => {
  const miniPlayerEl = document.getElementById("miniPlayer");
  if (!miniPlayerEl) return;

  try {
    if (typeof colorThief === "undefined")
      throw new Error("colorThief is not defined");

    const palette = colorThief.getPalette(colorProbeImg, 5);
    let chosenColor = palette[0];

    for (const color of palette) {
      const [r, g, b] = color;
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness < 130) {
        chosenColor = color;
        break;
      }
    }

    let [r, g, b] = chosenColor;
    const finalBrightness = (r * 299 + g * 587 + b * 114) / 1000;

    if (finalBrightness > 130) {
      r = Math.floor(r * 0.35);
      g = Math.floor(g * 0.35);
      b = Math.floor(b * 0.35);
    }

    miniPlayerEl.style.background = `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0.35) 0%, var(--clr-surface-light) 60%)`;
  } catch (error) {
    console.warn("Color extraction error:", error.message);
    miniPlayerEl.style.background = "var(--clr-surface-light)";
  }
};

colorProbeImg.onerror = () => {
  const miniPlayerEl = document.getElementById("miniPlayer");
  if (miniPlayerEl) miniPlayerEl.style.background = "var(--clr-surface-light)";
};

function applyDynamicColor(imgUrl) {
  if (imgUrl) colorProbeImg.src = imgUrl;
}

// ----------------------
// Auto-Play Engine
// ----------------------
audio.addEventListener("ended", () => {
  if (typeof isRepeat !== "undefined" && isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    if (typeof playNext === "function") {
      playNext();
    }
  }
});
