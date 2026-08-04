// ----------------------
// Mini Player & Initialization
// ----------------------
function loadSong(index) {
  if (!songs || !songs[index]) return;

  currentSongIndex = index;
  localStorage.setItem("currentSongIndex", currentSongIndex);

  if (typeof saveRecentSong === "function") {
    saveRecentSong(currentSongIndex);
  }

  // Add this line so the UI updates instantly without reloading the page
  if (typeof renderRecentSongs === "function") {
    renderRecentSongs();
  }

  const song = songs[currentSongIndex];

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
  // Added fallback empty strings to prevent 'null' rendering in UI
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
// Added Optional Chaining (?.) to all event listeners.
// If the button doesn't exist in HTML, the JS won't crash.
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

  // Guard against the Lucide library failing to load
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
  // Optimized: Replaced the for-loop with the cleaner array `.find()` method.
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
  if (isNaN(seconds)) return "0:00"; // Safe guard against NaN errors
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

  // Priority 2: Use the Playlist Queue, OR default to all songs
  const activeArray =
    window.currentPlaylistQueue && window.currentPlaylistQueue.length > 0
      ? window.currentPlaylistQueue
      : songs.map((_, i) => i); // Fallback to global library

  if (typeof isShuffle !== "undefined" && isShuffle) {
    currentSongIndex =
      activeArray[Math.floor(Math.random() * activeArray.length)];
  } else {
    const currentIndex = activeArray.indexOf(currentSongIndex);
    // Move forward, loop seamlessly back to the start if we hit the end!
    currentSongIndex = activeArray[(currentIndex + 1) % activeArray.length];
  }

  loadSong(currentSongIndex);
  playSong();
  if (typeof renderQueue === "function") renderQueue();
}

function playPrevious() {
  // Determine if we are in a playlist or normal mode
  const activeArray =
    window.currentPlaylistQueue && window.currentPlaylistQueue.length > 0
      ? window.currentPlaylistQueue
      : songs.map((_, i) => i);

  const currentIndex = activeArray.indexOf(currentSongIndex);

  // If the song somehow isn't in the active array, just restart the array
  if (currentIndex === -1) {
    currentSongIndex = activeArray[0];
  } else {
    // Go backwards, loop to the very end if we are at the beginning!
    currentSongIndex =
      activeArray[(currentIndex - 1 + activeArray.length) % activeArray.length];
  }

  loadSong(currentSongIndex);
  playSong();
  if (typeof renderQueue === "function") renderQueue();
}

// Ensure the buttons trigger our new bulletproof functions
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
// Auto-skip on dead stream
// ----------------------
let consecutivePlaybackFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 5;

audio.addEventListener("error", () => {
  consecutivePlaybackFailures++;
  // Changed to console.warn to highlight it better in dev tools
  console.warn(
    `Playback failed for "${songs[currentSongIndex]?.title}" (${consecutivePlaybackFailures}/${MAX_CONSECUTIVE_FAILURES}). Skipping...`,
  );

  if (consecutivePlaybackFailures >= MAX_CONSECUTIVE_FAILURES) {
    console.error(
      "Too many songs failed to play in a row. Stopping auto-skip.",
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
  if (!queueList) return;
  queueList.innerHTML = ""; // Clear the list

  let html = "";

  // 1. MANUAL QUEUE ("Up Next" - Songs explicitly added)
  if (window.userQueue && window.userQueue.length > 0) {
    html += `<h4 style="padding: 10px 0; color: var(--clr-text); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Up Next</h4>`;
    
    window.userQueue.forEach((song, index) => {
      html += `
        <div class="queue-list-row" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="queue-song-info" data-queue-index="${index}" style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; cursor: pointer;">
            <img src="${song.cover || ''}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0;">
            <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
              <p style="margin: 0 0 4px 0; font-size: 0.75rem; text-transform: uppercase; color: var(--clr-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.artist || 'Unknown'}</p>
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 500; color: var(--clr-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title || 'Unknown'}</h4>
            </div>
          </div>
          <button class="remove-queue-btn" data-queue-index="${index}" style="background: none; border: none; padding: 10px; cursor: pointer; color: var(--clr-text-muted);">
            <i data-lucide="x" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
      `;
    });
  }

  // 2. PLAYLIST QUEUE (Shows the whole list, highlights the active song)
  if (window.currentPlaylistQueue && window.currentPlaylistQueue.length > 0) {
    html += `<h4 style="padding: 15px 0 5px 0; color: var(--clr-text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px;">Playing from Playlist</h4>`;
    
    window.currentPlaylistQueue.forEach((songIndex) => {
      const song = songs[songIndex];
      const isPlaying = songIndex === currentSongIndex; // Magic check!

      // Dynamic styles based on whether it is playing or not
      const textColor = isPlaying ? "var(--clr-primary, #a855f7)" : "var(--clr-text, #fff)";
      const artistColor = isPlaying ? "var(--clr-primary, #a855f7)" : "var(--clr-text-muted, #aaa)";
      const opacity = isPlaying ? "1" : "0.5";
      const border = isPlaying ? "2px solid var(--clr-primary, #a855f7)" : "none";
      const rightIcon = isPlaying ? `<i data-lucide="bar-chart-2" style="width: 20px; height: 20px; color: var(--clr-primary, #a855f7);"></i>` : "";

      html += `
        <div class="queue-list-row" style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); opacity: ${opacity};">
          <div class="playlist-song-info" data-song-index="${songIndex}" style="display: flex; align-items: center; gap: 15px; flex: 1; min-width: 0; cursor: pointer;">
            <img src="${song.cover || ''}" style="width: 45px; height: 45px; border-radius: 6px; object-fit: cover; flex-shrink: 0; border: ${border};">
            <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0;">
              <p style="margin: 0 0 4px 0; font-size: 0.75rem; text-transform: uppercase; color: ${artistColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.artist || 'Unknown'}</p>
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 500; color: ${textColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title || 'Unknown'}</h4>
            </div>
          </div>
          <div>${rightIcon}</div>
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
  }

  if (typeof lucide !== 'undefined') lucide.createIcons(); 
}

// THE NEW SMART CLICK LISTENER
queueList?.addEventListener("click", (e) => {
  // 1. Remove manual song
  const removeBtn = e.target.closest(".remove-queue-btn");
  if (removeBtn) {
    e.stopPropagation();
    const indexToRemove = Number(removeBtn.dataset.queueIndex);
    window.userQueue.splice(indexToRemove, 1);
    renderQueue();
    return;
  }

  // 2. Play manual song instantly
  const manualSongInfo = e.target.closest(".queue-song-info");
  if (manualSongInfo) {
    const qIndex = Number(manualSongInfo.dataset.queueIndex);
    const realIndex = songs.findIndex(
      (s) => s.id === window.userQueue[qIndex].id,
    );
    if (realIndex !== -1) {
      window.userQueue.splice(qIndex, 1); // Remove from queue since we are playing it
      currentSongIndex = realIndex;
      loadSong(currentSongIndex);
      playSong();
      renderQueue();
    }
    return;
  }

  // 3. Play playlist song instantly
  const playlistSongInfo = e.target.closest(".playlist-song-info");
  if (playlistSongInfo) {
    const realIndex = Number(playlistSongInfo.dataset.songIndex);
    currentSongIndex = realIndex;
    loadSong(currentSongIndex);
    playSong();
    renderQueue(); // Re-render so the queue shifts upward!
  }
});

queueList?.addEventListener("click", (e) => {
  // 1. Did the user click the "X" remove button?
  const removeBtn = e.target.closest(".remove-queue-btn");
  if (removeBtn) {
    e.stopPropagation(); // Stop click from playing the song
    const indexToRemove = Number(removeBtn.dataset.queueIndex);

    // Remove that specific song from the array
    window.userQueue.splice(indexToRemove, 1);

    // Re-draw the visual queue to show it's gone
    renderQueue();
    return;
  }

  // 2. Did the user click the song info to play it?
  const songInfo = e.target.closest(".queue-song-info");
  if (songInfo) {
    const qIndex = Number(songInfo.dataset.queueIndex);
    const songToPlay = window.userQueue[qIndex];

    // Find where this song lives in the main database
    const realIndex = songs.findIndex((s) => s.id === songToPlay.id);

    if (realIndex !== -1) {
      // Take it out of the queue (since we are playing it right now)
      window.userQueue.splice(qIndex, 1);

      // Load and play it
      currentSongIndex = realIndex;
      loadSong(currentSongIndex);
      playSong();

      // Update the UI
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
  if (!miniPlayerEl) return; // Fail fast if element missing

  try {
    // Guard against ColorThief script failing to load in HTML
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
  if (imgUrl) colorProbeImg.src = imgUrl; // Guard against empty URL
}

// ----------------------
// Auto-Play Engine
// ----------------------
audio.addEventListener("ended", () => {
  // If repeat is toggled on, loop the current song
  if (typeof isRepeat !== "undefined" && isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    // Otherwise, move to the next song in the queue/playlist
    if (typeof playNext === "function") {
      playNext();
    }
  }
});