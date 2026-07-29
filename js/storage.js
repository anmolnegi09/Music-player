currentSongIndex = localStorage.getItem("currentSongIndex") !== null 
  ? Number(localStorage.getItem("currentSongIndex")) 
  : Math.floor(Math.random() * songs.length);

const getLikedSongs = () => JSON.parse(localStorage.getItem("likedSongs")) || [];

const toggleLikedSong = (index) => {
  let liked = getLikedSongs();
  
  // If liked, filter it out. If not liked, add it to the start of the array.
  liked = liked.includes(index) 
    ? liked.filter(i => i !== index) 
    : [index, ...liked];
    
  localStorage.setItem("likedSongs", JSON.stringify(liked));
  return liked.includes(index); 
};