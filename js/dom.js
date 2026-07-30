// ----------------------
// Audio & State Variables
// ----------------------
const audio = new Audio();
let currentSongIndex = localStorage.getItem("currentSongIndex") ? Number(localStorage.getItem("currentSongIndex")) : 0;
let isRepeat = false;
let isShuffle = false;
let isFavorite = false;

// ----------------------
// Main Screens & Lists
// ----------------------
const homeScreen = document.querySelector(".home-screen");
const playerScreen = document.querySelector(".player-screen");
const queueScreen = document.querySelector(".queue-screen");
const searchScreen = document.querySelector('.search-screen'); 
const libraryScreen = document.querySelector('.library-screen');
const likedSongsScreen = document.querySelector('.liked-songs-screen');
const profileScreen = document.querySelector('.profile-screen'); 

const recentList = document.querySelector(".recent-list");
const playlistList = document.querySelector(".playlist-list");
const songsList = document.querySelector(".songs-list");
const queueList = document.querySelector(".queue-list");
const searchList = document.querySelector(".search-list");
const likedSongsList = document.querySelector('.liked-songs-list');

// ----------------------
// Mini Player Elements (Optimized with GetElementById)
// ----------------------
const miniPlayer = document.getElementById("miniPlayer");
const miniCover = document.getElementById("miniCover");
const miniArtist = document.getElementById("miniArtist");
const miniTitle = document.getElementById("miniTitle");
const playerBtn = document.getElementById("playerBtn");
const miniNextBtn = document.getElementById("miniNextBtn");
const miniLikeBtn = document.getElementById("miniLikeBtn");

// ----------------------
// Full Player Elements
// ----------------------
const backBtn = document.querySelector(".back-btn");
const playerCover = document.querySelector(".player-cover-img"); // Fixed class name
const playerTitle = document.querySelector(".song-details h2");
const playerArtist = document.querySelector(".song-details p");

const previousBtn = document.querySelector(".previous-btn");
const playBtnLarge = document.querySelector(".play-btn-large");
const nextBtn = document.querySelector(".next-btn");
const repeatBtn = document.querySelector(".repeat-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");
const favoriteBtn = document.querySelector(".favorite-btn");

const progressBar = document.querySelector(".progress-bar");
const currentTime = document.querySelector(".current-time");
const duration = document.querySelector(".duration");

// ----------------------
// Library & Nav Elements
// ----------------------
const queueBtn = document.querySelector(".queue-btn");
const closeQueue = document.querySelector(".close-queue");
const searchInput = document.querySelector(".search-input");
const searchResults = document.querySelector(".search-results");

const navBtns = document.querySelectorAll('.nav-item');
const favoritesFolder = document.getElementById('favorites-folder');
const backToLibraryBtn = document.querySelector('.back-to-library-btn');
const favSongCount = document.getElementById('fav-song-count');
const closeLibraryBtn = document.querySelector('.close-library-btn');
const closeSearchBtn = document.querySelector('.close-search-btn');