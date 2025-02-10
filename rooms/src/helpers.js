function cleanSongTitle(songTitle) {
    return songTitle
        .replace(/\s*\([^)]*\)|\s*\[[^\]]*\]|\s*\{[^}]*\}/g, '')
        .replace(/[^a-zA-Z0-9\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function getSongNameFromData(trackData) {
    return trackData.item.name;
}

module.exports = {
    cleanSongTitle,
    getSongNameFromData
};