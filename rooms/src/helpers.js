function cleanSongTitle(songTitle) {
    return songTitle
        .replace(/\s*\([^)]*\)|\s*\[[^\]]*\]|\s*\{[^}]*\}/g, '')
        .replace(/[^a-zA-Z0-9\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

console.log(cleanSongTitle("BUNKER/PREROLL")); 
console.log(cleanSongTitle("Pozdro (feat. Kanye West)"));
console.log(cleanSongTitle("Co?! - GÓwno"));

function getSongNameFromData(trackData) {
    return trackData.item.name;
}

module.exports = {
    cleanSongTitle,
    getSongNameFromData
};

// BUNKERPREROLL
// Pozdro
// Co Gówno