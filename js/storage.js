const getLikedSongs = () => {
  try {
    const storedData = localStorage.getItem("likedSongs");
    // Explicitly handle null cases before passing to JSON.parse
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    // Upgraded to warn so you can see if data corruption occurs
    console.warn("Error parsing likedSongs from localStorage. Resetting.", error.message);
    return [];
  }
};

const toggleLikedSong = (index) => {
  // Failsafe: Prevent saving 'null' or 'undefined' if an event listener glitches
  if (index === null || index === undefined) return false;

  let liked = getLikedSongs();

  liked = liked.includes(index)
    ? liked.filter((i) => i !== index)
    : [index, ...liked];

  try {
    localStorage.setItem("likedSongs", JSON.stringify(liked));
  } catch (error) {
    // Failsafe: Prevents the app from crashing if the browser's local storage quota is full
    console.error("Failed to save to localStorage. Storage might be full.", error.message);
  }
  
  return liked.includes(index);
};