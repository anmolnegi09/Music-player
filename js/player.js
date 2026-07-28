// ----------------------
// Mini Player
// ----------------------

function loadSong(index) {
  currentSongIndex = index;
  localStorage.setItem("currentSongIndex", currentSongIndex);
  saveRecentSong(currentSongIndex);

  const song = songs[currentSongIndex];

  updateMiniPlayer(song);
  updateFullPlayer(song);

  audio.src = song.audio;

  updatePlayerButton();

  renderRecentSongs();
}

function playSong() {
  audio.play();
  updatePlayerButton();
}

function updateMiniPlayer(song) {
  miniCover.src = song.cover;
  miniCover.alt = song.title;

  miniTitle.textContent = song.title;
  miniArtist.textContent = song.artist;
}

// ----------------------
// Play / Pause
// ----------------------

function updatePlayerButton() {
  if (audio.paused) {
    playerBtn.innerHTML = `<i data-lucide="play"></i>`;
    playBtnLarge.innerHTML = `<i data-lucide="play"></i>`;
  } else {
    playerBtn.innerHTML = `<i data-lucide="pause"></i>`;
    playBtnLarge.innerHTML = `<i data-lucide="pause"></i>`;
  }

  lucide.createIcons();
}

playerBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }

  updatePlayerButton();
});

playBtnLarge.addEventListener("click", (e) => {
  e.stopPropagation();

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }

  updatePlayerButton();
});

// ----------------------
// player screen
// ----------------------

miniPlayer.addEventListener("click", () => {
  homeScreen.classList.add("hidden");
  playerScreen.classList.remove("hidden");
});

backBtn.addEventListener("click", () => {
  playerScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
});

function updateFullPlayer(song) {
  playerCover.src = song.cover;
  playerCover.alt = song.title;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
}

// ----------------------
// Progress Bar
// ----------------------

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTime.textContent = formatTime(audio.currentTime);
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;

  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// ----------------------
// Shuffle Button
// ----------------------

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active", isShuffle);
});

// ----------------------
// Previous Button
// ----------------------

previousBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1) % songs.length;

  loadSong(currentSongIndex);
  playSong();
});

// ----------------------
// Next Button
// ----------------------

nextBtn.addEventListener("click", () => {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }

  loadSong(currentSongIndex);
  playSong();
});

// ----------------------
// Repeat Button
// ----------------------

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle("active", isRepeat);
});

audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    if (isShuffle) {
      currentSongIndex = Math.floor(Math.random() * songs.length);
    } else {
      currentSongIndex = (currentSongIndex + 1) % songs.length;
    }

    loadSong(currentSongIndex);
    playSong();
  }
});

// ----------------------
// Queue Button
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

    songItem.className = "queue-item";

    if (index === currentSongIndex) {
      songItem.classList.add("playing");
    }

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


