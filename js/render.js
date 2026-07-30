const colorThief = new ColorThief();

const updatePlayingFromUI = () => {
  const playingFromSection = document.querySelector(".playing-from");
  const playingFromTitle = document.querySelector(".playing-from h3");
  
  if (currentPlaylistName !== "") {
    playingFromTitle.textContent = currentPlaylistName;
    playingFromSection.classList.remove("hidden"); // UI dikhao
  } else {
    playingFromSection.classList.add("hidden"); // UI chhupa do
  }
};

// ----------------------
// Rendering & Saving Data
// ----------------------
const saveRecentSong = (index) => {
  let recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recent = [index, ...recent.filter(i => i !== index)].slice(0, 10);
  localStorage.setItem("recentSongs", JSON.stringify(recent));
};

const renderRecentSongs = () => {
  const recent = JSON.parse(localStorage.getItem("recentSongs")) || [];
  recentList.innerHTML = recent.map(i => `
    <article class="song-card" data-index="${i}">
      <img src="${songs[i].cover}" alt="${songs[i].title}">
      <h1>${songs[i].title}</h1>
      <p>${songs[i].artist}</p>
    </article>`).join('');
};

const renderPlaylists = () => {
  playlistList.innerHTML = playlists.map((p, i) => `
    <article class="playlist-card" data-index="${i}">
      <img src="${p.cover}" alt="${p.title}">
      <div class="playlist-info">
        <h1>${p.title}</h1>
        <p>${p.songs.length} Songs</p>
      </div>
      <button class="play-btn"><i data-lucide="play"></i></button>
    </article>`).join('');
  lucide.createIcons();
};

// Playlist Card par click karne ka logic
playlistList.addEventListener('click', (e) => {
  const card = e.target.closest('.playlist-card');
  const playBtn = e.target.closest('.play-btn'); // Check karein ki play dabaya hai ya nahi

  if (card) {
    const playlistIndex = Number(card.dataset.index);
    const selectedPlaylist = playlists[playlistIndex];

    // AGAR DIRECT PLAY BUTTON DABAYA HAI:
    if (playBtn) {
      e.stopPropagation(); // Card ko click hone se roko (screen open nahi hogi)
      
      // Check karein ki playlist me gaane hain ya nahi
      if (selectedPlaylist.songs.length > 0) {
        currentPlaylistName = selectedPlaylist.title; // Playlist ka naam set karein
        updatePlayingFromUI();
        
        // Playlist ke array me se pehla gaana play karein[cite: 11]
        loadSong(selectedPlaylist.songs[0]); 
        playSong();
      }
      return; // Code yahin se wapas bhej do, screen mat kholo
    }

    // AGAR PLAY BUTTON NAHI, BALKI CARD DABAYA HAI (Toh screen kholo):
    currentPlaylistName = selectedPlaylist.title; // Screen open hote hi context set karein
    updatePlayingFromUI();

    // Playlist ka Top Section Update karna
    playlistDetailCover.src = selectedPlaylist.cover;
    playlistDetailName.textContent = selectedPlaylist.title;
    playlistDetailCount.textContent = `${selectedPlaylist.songs.length} Songs`;

    // Playlist ke Andar ke Gaane Render karna
    playlistDetailSongs.innerHTML = selectedPlaylist.songs.map(songIndex => {
      const s = songs[songIndex];
      return `
        <article class="songs-card" data-index="${songIndex}">
          <div class="songs-left">
            <img src="${s.cover}" alt="${s.title}">
            <div class="songs-info">
              <h1>${s.title}</h1>
              <p>${s.artist}</p>
            </div>
          </div>
          <button class="more-btn"><i data-lucide="ellipsis"></i></button>
        </article>`;
    }).join('');

    if (playBtn) {
      e.stopPropagation(); 
      if (selectedPlaylist.songs.length > 0) {
        currentPlaylistName = selectedPlaylist.title; 
        currentPlaylistQueue = selectedPlaylist.songs; // QUEUE SET KIYA
        updatePlayingFromUI();
        
        loadSong(selectedPlaylist.songs[0]); 
        playSong();
      }
      return; 
    }

    playlistDetailSongs.addEventListener('click', (e) => {
  const card = e.target.closest('.songs-card');
  if (card) {
    // Current active playlist ki array dhoondh kar Queue set kardi
    const p = playlists.find(p => p.title === currentPlaylistName);
    if (p) currentPlaylistQueue = p.songs;

    loadSong(Number(card.dataset.index));
    playSong();
    
    // Naya Navigation tracking logic
    activeScreenBeforePlayer = playlistDetailScreen; 
    playlistDetailScreen.classList.add('hidden');
    playerScreen.classList.remove('hidden'); 
  }
});

    // Nayi screen dikhana
    homeScreen.classList.add('hidden');
    playlistDetailScreen.classList.remove('hidden');
    lucide.createIcons();
  }
});

// Playlist Screen se wapas Home aane ka button
closePlaylistBtn?.addEventListener('click', () => {
  playlistDetailScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
});

// Playlist ke andar se gaana play karne ka logic
playlistDetailSongs.addEventListener('click', (e) => {
  const card = e.target.closest('.songs-card');
  if (card) {
    loadSong(Number(card.dataset.index));
    playSong();
    
    // Optional: Gaana click karte hi Full Player kholna ho toh:
    playlistDetailScreen.classList.add('hidden');
    playerScreen.classList.remove('hidden'); 
  }
});

const renderAllSongs = () => {
  songsList.innerHTML = songs.map((s, i) => `
    <article class="songs-card" data-index="${i}">
      <div class="songs-left">
        <img src="${s.cover}" alt="${s.title}">
        <div class="songs-info">
          <h1>${s.title}</h1>
          <p>${s.artist}</p>
        </div>
      </div>
      <button class="more-btn"><i data-lucide="ellipsis"></i></button>
    </article>`).join('');
  lucide.createIcons();
};

[recentList, songsList].forEach(list => {
  list.addEventListener("click", (e) => {
    const card = e.target.closest(".song-card, .songs-card");
    if (card) { 
      currentPlaylistName = ""; 
      currentPlaylistQueue = [];
      updatePlayingFromUI();

      loadSong(Number(card.dataset.index)); 
      playSong(); 
    }
  });
});

// ----------------------
// Favorites System (Mini Player Linked)
// ----------------------
const updateFavoriteButton = () => {
  // SVG Icon Design: Agar liked hai toh lal rang fill karo, nahi toh outline rakho
  const iconHTML = isFavorite 
    ? `<i data-lucide="heart" fill="currentColor" color="#ff4040"></i>` 
    : `<i data-lucide="heart"></i>`;

  // Full Player Button Update
  favoriteBtn.innerHTML = iconHTML;
  favoriteBtn.classList.toggle("active", isFavorite);

  // Mini Player Button Update
  if (miniLikeBtn) {
    miniLikeBtn.innerHTML = iconHTML;
    miniLikeBtn.classList.toggle("active", isFavorite);
  }

  lucide.createIcons();
};

const renderFavoritesCount = () => {
  if (favSongCount) favSongCount.textContent = `${getLikedSongs().length} songs`;
};

const renderLikedSongs = () => {
  const liked = getLikedSongs();
  
  if (!liked.length) {
    likedSongsList.innerHTML = `<p style="text-align:center; margin-top: 50px; color: var(--clr-text-muted);">No favorite songs yet.</p>`;
    return;
  }

  likedSongsList.innerHTML = liked.map(i => `
    <article class="songs-card" data-index="${i}">
      <div class="songs-left">
        <img src="${songs[i].cover}" alt="${songs[i].title}">
        <div class="songs-info">
          <h1>${songs[i].title}</h1>
          <p>${songs[i].artist}</p>
        </div>
      </div>
      <button class="favorite-btn active remove-liked-btn" data-index="${i}">
        <i data-lucide="heart" fill="currentColor" color="#ff4040"></i>
      </button>
    </article>`).join('');
  lucide.createIcons();
};

likedSongsList.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-liked-btn");
  const card = e.target.closest(".songs-card");
  
  if (removeBtn) {
    const index = Number(removeBtn.dataset.index);
    if (toggleLikedSong(index) === false && index === currentSongIndex) {
      isFavorite = false;
      updateFavoriteButton();
    }
    renderLikedSongs();
    renderFavoritesCount();
  } else if (card) {
    loadSong(Number(card.dataset.index));
    playSong();
    likedSongsScreen.classList.add("hidden");
    playerScreen.classList.remove("hidden");
  }
});

// ----------------------
// Main Navigation Logic
// ----------------------
const screens = [homeScreen, searchScreen, libraryScreen, profileScreen];

navBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    screens.forEach(s => s?.classList.add('hidden'));
    document.querySelector('.nav-item.active')?.classList.remove('active');
    
    btn.classList.add('active');
    screens[idx]?.classList.remove('hidden');
    
    if (idx === 2) renderFavoritesCount();
    if (idx === 3) lucide.createIcons();
  });
});

favoritesFolder.addEventListener('click', () => {
  libraryScreen.classList.add('hidden');
  likedSongsScreen.classList.remove('hidden');
  renderLikedSongs();
});

backToLibraryBtn.addEventListener('click', () => {
  likedSongsScreen.classList.add('hidden');
  libraryScreen.classList.remove('hidden');
  renderFavoritesCount();
});

[closeLibraryBtn, closeSearchBtn].forEach(btn => {
  btn?.addEventListener('click', () => navBtns[0].click());
});