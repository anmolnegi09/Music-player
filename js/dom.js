const audio = new Audio();
const savedSong = localStorage.getItem("currentSongIndex");

const homeScreen = document.querySelector(".home-screen");
const recentList = document.querySelector(".recent-list");
const playlistList = document.querySelector(".playlist-list");
const songsList = document.querySelector(".songs-list");

const miniCover = document.querySelector(".player-left img");
const miniTitle = document.querySelector(".player-info h3");
const miniArtist = document.querySelector(".player-info p");
const playerBtn = document.querySelector(".player-btn");
const miniPlayer = document.querySelector(".mini-player");

const playerScreen = document.querySelector(".player-screen");
const backBtn = document.querySelector(".back-btn");
const playerCover = document.querySelector(".player-cover img");
const playerTitle = document.querySelector(".song-details h2");
const playerArtist = document.querySelector(".song-details p");

const previousBtn = document.querySelector(".previous-btn");
const playBtnLarge = document.querySelector(".play-btn-large");
const nextBtn = document.querySelector(".next-btn");
const progressBar = document.querySelector(".progress-bar");
const currentTime = document.querySelector(".current-time");
const duration = document.querySelector(".duration");
const repeatBtn = document.querySelector(".repeat-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");

let isRepeat = false;
let isShuffle = false;

const queueBtn = document.querySelector(".queue-btn");
const queueScreen = document.querySelector(".queue-screen");
const closeQueue = document.querySelector(".close-queue");
const queueList = document.querySelector(".queue-list");

let currentSongIndex = 0;

const searchInput = document.querySelector(".search-input");
const searchResults = document.querySelector(".search-results");
const searchList = document.querySelector(".search-list");