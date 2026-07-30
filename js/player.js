// ----------------------
// Mini Player & Initialization
// ----------------------
function loadSong(index) {
  currentSongIndex = index;
  localStorage.setItem("currentSongIndex", currentSongIndex);
  saveRecentSong(currentSongIndex);

  const song = songs[currentSongIndex];

  applyDynamicColor(song.cover);
  updateMiniPlayer(song);
  updateFullPlayer(song);

  audio.src = song.audio;
  updatePlayerButton();
  renderRecentSongs();

  const liked = getLikedSongs();
  isFavorite = liked.includes(currentSongIndex);
  updateFavoriteButton();
}

function playSong() {
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      updatePlayerButton();
    }).catch(error => {
      console.log("Audio load interrupted smoothly. Loading next...");
    });
  }
  updatePlayerButton();
}

function updateMiniPlayer(song) {
  if(miniCover) miniCover.src = song.cover;
  if(miniCover) miniCover.alt = song.title;
  if(miniArtist) miniArtist.textContent = song.artist;
  if(miniTitle) miniTitle.textContent = song.title;
}

function updateFullPlayer(song) {
  if(playerCover) playerCover.src = song.cover;
  if(playerCover) playerCover.alt = song.title;
  if(playerTitle) playerTitle.textContent = song.title;
  if(playerArtist) playerArtist.textContent = song.artist;
}

// ----------------------
// Mini Player Buttons
// ----------------------
miniNextBtn.addEventListener("click", (e) => {
  e.stopPropagation(); 
  playNext(); 
});

miniLikeBtn.addEventListener("click", (e) => {
  e.stopPropagation(); 
  isFavorite = toggleLikedSong(currentSongIndex);
  updateFavoriteButton(); 
  if(typeof renderFavoritesCount === "function") renderFavoritesCount();
});

// ----------------------
// Play / Pause Logic
// ----------------------
function updatePlayerButton() {
  const icon = audio.paused ? "play" : "pause";
  if(playerBtn) playerBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
  if(playBtnLarge) playBtnLarge.innerHTML = `<i data-lucide="${icon}"></i>`;
  lucide.createIcons();
}

function togglePlay(e) {
  if (e) e.stopPropagation();
  audio.paused ? playSong() : audio.pause();
  updatePlayerButton();
}

playerBtn.addEventListener("click", togglePlay);
playBtnLarge.addEventListener("click", togglePlay);

// ----------------------
// Player Screen Navigation (Bulletproof Routing)
// ----------------------
function openFullPlayer() {
  const allScreens = [
    homeScreen, searchScreen, libraryScreen, profileScreen, 
    playlistDetailScreen, likedSongsScreen
  ];

  for (let screen of allScreens) {
    if (screen && !screen.classList.contains("hidden")) {
      activeScreenBeforePlayer = screen;
      break; 
    }
  }

  allScreens.forEach(screen => {
    if (screen) screen.classList.add("hidden");
  });

  playerScreen.classList.remove("hidden");
}

miniPlayer.addEventListener("click", openFullPlayer);

backBtn.addEventListener("click", () => {
  playerScreen.classList.add("hidden");
  
  if (activeScreenBeforePlayer) {
    activeScreenBeforePlayer.classList.remove("hidden");
  } else {
    homeScreen.classList.remove("hidden"); 
  }
});

// ----------------------
// Progress Bar
// ----------------------
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTime.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// ----------------------
// Track Navigation (Smart Queue Engine)
// ----------------------
function playNext() {
  let queue = (typeof currentPlaylistQueue !== "undefined" && currentPlaylistQueue.length > 0) 
    ? currentPlaylistQueue 
    : songs.map((_, i) => i);
  
  let currentIndex = queue.indexOf(currentSongIndex);
  if (currentIndex === -1) currentIndex = 0; 

  if (isShuffle) {
    let randomIndex = Math.floor(Math.random() * queue.length);
    currentSongIndex = queue[randomIndex];
  } else {
    currentSongIndex = queue[(currentIndex + 1) % queue.length];
  }

  loadSong(currentSongIndex);
  playSong();
}

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

previousBtn.addEventListener("click", () => {
  let queue = (typeof currentPlaylistQueue !== "undefined" && currentPlaylistQueue.length > 0) 
    ? currentPlaylistQueue 
    : songs.map((_, i) => i);
  
  let currentIndex = queue.indexOf(currentSongIndex);
  if (currentIndex === -1) currentIndex = 0; 

  let prevIndex = (currentIndex - 1 + queue.length) % queue.length;
  currentSongIndex = queue[prevIndex];

  loadSong(currentSongIndex);
  playSong();
});

nextBtn.addEventListener("click", playNext);

repeatBtn.addEventListener("click", () => {
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
// Queue Screen
// ----------------------
queueBtn.addEventListener("click", () => {
  renderQueue();
  queueScreen.classList.add("show");
});

closeQueue.addEventListener("click", () => {
  queueScreen.classList.remove("show");
});

function renderQueue() {
  if(!queueList) return;
  queueList.innerHTML = "";

  let queueToRender = (typeof currentPlaylistQueue !== "undefined" && currentPlaylistQueue.length > 0) 
    ? currentPlaylistQueue 
    : songs.map((_, index) => index); 

  queueToRender.forEach((songIndex) => {
    const song = songs[songIndex]; 
    const songItem = document.createElement("div");
    
    songItem.className = `queue-item ${songIndex === currentSongIndex ? "playing" : ""}`;
    
    songItem.innerHTML = `
            <img src="${song.cover}" alt="">
            <div>
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
        `;

    songItem.addEventListener("click", () => {
      loadSong(songIndex); 
      playSong();
      renderQueue(); 
    });

    queueList.appendChild(songItem);
  });
}

// ----------------------
// Favorite Feature Button
// ----------------------
favoriteBtn.addEventListener("click", () => {
  isFavorite = toggleLikedSong(currentSongIndex);
  updateFavoriteButton();
  if(typeof renderFavoritesCount === "function") renderFavoritesCount(); 
});

// ----------------------
// Dynamic Color System
// ----------------------
function applyDynamicColor(imgUrl) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imgUrl;

  img.addEventListener('load', () => {
    const miniPlayerEl = document.getElementById('miniPlayer');

    try {
      const palette = colorThief.getPalette(img, 5);
      let chosenColor = palette[0]; 

      for (let i = 0; i < palette.length; i++) {
        const [r, g, b] = palette[i];
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        if (brightness < 130) { 
          chosenColor = palette[i];
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

      if(miniPlayerEl) miniPlayerEl.style.background = `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0.35) 0%, var(--clr-surface-light) 60%)`;

    } catch (error) {
      console.log("Color extraction error:", error);
      if (miniPlayerEl) miniPlayerEl.style.background = 'var(--clr-surface-light)';
    }
  });
}