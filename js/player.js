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
  if (typeof lucide !== 'undefined') lucide.createIcons(); 
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
  activeScreenBeforePlayer = allPlayerScreens.find(screen => screen && !screen.classList.contains("hidden")) || null;

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
function getActiveQueue() {
  return currentPlaylistQueue.length > 0
    ? currentPlaylistQueue
    : songs.map((_, i) => i);
}

// Optimized: Created a single function to handle index math for both Next and Previous buttons.
function getNewSongIndex(step) {
  const queue = getActiveQueue();
  let currentIndex = queue.indexOf(currentSongIndex);
  if (currentIndex === -1) currentIndex = 0;
  
  if (isShuffle && step > 0) { // Only shuffle on 'next'
      return queue[Math.floor(Math.random() * queue.length)];
  }
  
  return queue[(currentIndex + step + queue.length) % queue.length];
}

function playNext() {
  currentSongIndex = getNewSongIndex(1);
  loadSong(currentSongIndex);
  playSong();
}

shuffleBtn?.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

previousBtn?.addEventListener("click", () => {
  currentSongIndex = getNewSongIndex(-1);
  loadSong(currentSongIndex);
  playSong();
});

nextBtn?.addEventListener("click", playNext);

repeatBtn?.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    playNext();
  }
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
    `Playback failed for "${songs[currentSongIndex]?.title}" (${consecutivePlaybackFailures}/${MAX_CONSECUTIVE_FAILURES}). Skipping...`
  );

  if (consecutivePlaybackFailures >= MAX_CONSECUTIVE_FAILURES) {
    console.error("Too many songs failed to play in a row. Stopping auto-skip.");
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

  const queueToRender = getActiveQueue();
  const fragment = document.createDocumentFragment();

  queueToRender.forEach((songIndex) => {
    const song = songs[songIndex];
    if (!song) return;

    const songItem = document.createElement("div");
    songItem.className = `queue-item ${songIndex === currentSongIndex ? "playing" : ""}`;
    songItem.dataset.index = songIndex;
    // Added fallbacks for properties inside innerHTML
    songItem.innerHTML = `
      <img src="${song.cover || ''}" alt="${song.title || 'Unknown'}">
      <div>
        <h4>${song.title || 'Unknown Title'}</h4>
        <p>${song.artist || 'Unknown Artist'}</p>
      </div>
    `;
    fragment.appendChild(songItem);
  });

  queueList.innerHTML = "";
  queueList.appendChild(fragment);
}

queueList?.addEventListener("click", (e) => {
  const item = e.target.closest(".queue-item");
  if (!item) return;
  
  const songIndex = Number(item.dataset.index);
  loadSong(songIndex);
  playSong();
  renderQueue();
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
    if (typeof colorThief === 'undefined') throw new Error("colorThief is not defined"); 
    
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