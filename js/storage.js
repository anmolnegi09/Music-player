const getLikedSongs = () => {
  try {
    const storedData = localStorage.getItem("likedSongs");
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    return [];
  }
};

const toggleLikedSong = (index) => {
  if (index === null || index === undefined) return false;

  let liked = getLikedSongs();

  liked = liked.includes(index)
    ? liked.filter((i) => i !== index)
    : [index, ...liked];

  try {
    localStorage.setItem("likedSongs", JSON.stringify(liked));
  } catch (error) {}
  
  return liked.includes(index);
};