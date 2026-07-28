// ----------------------
// Search
// ----------------------

searchInput.addEventListener("input", handleSearch);

function handleSearch() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredSongs = songs.filter((song) => {
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  });

  console.log(filteredSongs);
}

function filterSongs() {}

function renderSearchResults() {}

function clearSearch() {}
