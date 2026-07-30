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
  audio.play();
  updatePlayerButton();
}

function updateMiniPlayer(song) {
  miniCover.src = song.cover;
  miniCover.alt = song.title;
  
  miniArtist.textContent = song.artist; // <p> tag
  miniTitle.textContent = song.title;   // <h1> tag
}

function updateFullPlayer(song) {
  playerCover.src = song.cover;
  playerCover.alt = song.title;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
}

// ----------------------
// Mini Next Button
// ----------------------
miniNextBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Ye bohot zaroori hai! Isse full player open nahi hoga.

  // Aapka existing next button ka logic
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }

  loadSong(currentSongIndex);
  playSong();
});

// ----------------------
// Mini Like Button
// ----------------------
miniLikeBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Full player ko open hone se rokna

  // Aapka existing like button ka logic
  isFavorite = toggleLikedSong(currentSongIndex);
  
  // Icon ko fill ya outline karne ke liye function call
  updateFavoriteButton(); 
  
  // Note: Aapko updateFavoriteButton() function me 'miniLikeBtn' ke icon ko bhi 
  // update karne ka logic add karna padega (fill="currentColor" ya empty).
});

// ----------------------
// Play / Pause Logic
// ----------------------

function updatePlayerButton() {
  const icon = audio.paused ? "play" : "pause";
  playerBtn.innerHTML = `<i data-lucide="${icon}"></i>`;
  playBtnLarge.innerHTML = `<i data-lucide="${icon}"></i>`;
  lucide.createIcons();
}

function togglePlay(e) {
  if (e) e.stopPropagation();
  audio.paused ? audio.play() : audio.pause();
  updatePlayerButton();
}

playerBtn.addEventListener("click", togglePlay);
playBtnLarge.addEventListener("click", togglePlay);

// ----------------------
// Player Screen Navigation
// ----------------------

miniPlayer.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  playerScreen.classList.remove("hidden");
});

backBtn.addEventListener("click", () => {
  playerScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
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
// Track Navigation
// ----------------------

function playNext() {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  loadSong(currentSongIndex);
  playSong();
}

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

previousBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
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
  queueList.innerHTML = "";

  songs.forEach((song, index) => {
    const songItem = document.createElement("div");
    songItem.className = `queue-item ${index === currentSongIndex ? "playing" : ""}`;
    songItem.innerHTML = `
            <img src="${song.cover}" alt="">
            <div>
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
        `;

    songItem.addEventListener("click", () => {
      currentSongIndex = index;
      loadSong(currentSongIndex);
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
  renderFavoritesCount(); 
});

// ----------------------
// Dynamic Color System
// ----------------------

function applyDynamicColor(imgUrl) {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = imgUrl;

  img.addEventListener('load', () => {
    const miniPlayerEl = document.querySelector('.mini-player');

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

      // The stray gradient line is now safely tucked back inside where it belongs!
      miniPlayerEl.style.background = `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0.35) 0%, var(--clr-surface-light) 60%)`;

    } catch (error) {
      console.log("Color extraction error:", error);
      if (miniPlayerEl) miniPlayerEl.style.background = 'var(--clr-surface-light)';
    }
  });
}