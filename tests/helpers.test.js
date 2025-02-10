const { cleanSongTitle, getSongNameFromData } = require('../rooms/src/helpers');

describe('cleanSongTitle', () => {
    test('delete slash', () => {
        expect(cleanSongTitle('BUNKER/PREROLL')).toBe('bunkerpreroll');
    });

    test('delete feats', () => {
        expect(cleanSongTitle('Pozdro (feat. Kanye West)')).toBe('pozdro');
    });

    test('usuwa tekst w nawiasach klamrowych', () => {
        expect(cleanSongTitle('CO!?! - KłĘbuszek')).toBe('co kłębuszek');
    });
});

describe('getSongNameFromData', () => {
    test('check if name is correct', () => {
        const trackData = {
            "timestamp": 1739201655759,
            "context": {
              "external_urls": {
                "spotify": "https://open.spotify.com/playlist/37i9dQZF1E36jHwDw1zuSl"
              },
              "href": "https://api.spotify.com/v1/playlists/37i9dQZF1E36jHwDw1zuSl",
              "type": "playlist",
              "uri": "spotify:playlist:37i9dQZF1E36jHwDw1zuSl"
            },
            "progress_ms": 200057,
            "item": {
              "album": {
                "album_type": "album",
                "artists": [
                  {
                    "external_urls": {
                      "spotify": "https://open.spotify.com/artist/4V8LLVI7PbaPR0K2TGSxFF"
                    },
                    "href": "https://api.spotify.com/v1/artists/4V8LLVI7PbaPR0K2TGSxFF",
                    "id": "4V8LLVI7PbaPR0K2TGSxFF",
                    "name": "Tyler, The Creator",
                    "type": "artist",
                    "uri": "spotify:artist:4V8LLVI7PbaPR0K2TGSxFF"
                  }
                ],
                "available_markets": [
                  "AR",
                  "AU",
                  "AT",
                  "BE",
                  "BO",
                  "BR",
                ],
                "external_urls": {
                  "spotify": "https://open.spotify.com/album/0U28P0QVB1QRxpqp5IHOlH"
                },
                "href": "https://api.spotify.com/v1/albums/0U28P0QVB1QRxpqp5IHOlH",
                "id": "0U28P0QVB1QRxpqp5IHOlH",
                "images": [
                  {
                    "height": 640,
                    "url": "https://i.scdn.co/image/ab67616d0000b273124e9249fada4ff3c3a0739c",
                    "width": 640
                  },
                  {
                    "height": 300,
                    "url": "https://i.scdn.co/image/ab67616d00001e02124e9249fada4ff3c3a0739c",
                    "width": 300
                  },
                  {
                    "height": 64,
                    "url": "https://i.scdn.co/image/ab67616d00004851124e9249fada4ff3c3a0739c",
                    "width": 64
                  }
                ],
                "name": "CHROMAKOPIA",
                "release_date": "2024-10-28",
                "release_date_precision": "day",
                "total_tracks": 14,
                "type": "album",
                "uri": "spotify:album:0U28P0QVB1QRxpqp5IHOlH"
              },
              "artists": [
                {
                  "external_urls": {
                    "spotify": "https://open.spotify.com/artist/4V8LLVI7PbaPR0K2TGSxFF"
                  },
                  "href": "https://api.spotify.com/v1/artists/4V8LLVI7PbaPR0K2TGSxFF",
                  "id": "4V8LLVI7PbaPR0K2TGSxFF",
                  "name": "Tyler, The Creator",
                  "type": "artist",
                  "uri": "spotify:artist:4V8LLVI7PbaPR0K2TGSxFF"
                },
                {
                  "external_urls": {
                    "spotify": "https://open.spotify.com/artist/5IcR3N7QB1j6KBL8eImZ8m"
                  },
                  "href": "https://api.spotify.com/v1/artists/5IcR3N7QB1j6KBL8eImZ8m",
                  "id": "5IcR3N7QB1j6KBL8eImZ8m",
                  "name": "ScHoolboy Q",
                  "type": "artist",
                  "uri": "spotify:artist:5IcR3N7QB1j6KBL8eImZ8m"
                },
                {
                  "external_urls": {
                    "spotify": "https://open.spotify.com/artist/6Jrxnp0JgqmeUX1veU591p"
                  },
                  "href": "https://api.spotify.com/v1/artists/6Jrxnp0JgqmeUX1veU591p",
                  "id": "6Jrxnp0JgqmeUX1veU591p",
                  "name": "Santigold",
                  "type": "artist",
                  "uri": "spotify:artist:6Jrxnp0JgqmeUX1veU591p"
                }
              ],
              "available_markets": [
                "AR",
                "AU",
                "AT",
              ],
              "disc_number": 1,
              "duration_ms": 207272,
              "explicit": true,
              "external_ids": {
                "isrc": "USQX92405793"
              },
              "external_urls": {
                "spotify": "https://open.spotify.com/track/2aYHxnMF2umAavtgBvmkY1"
              },
              "href": "https://api.spotify.com/v1/tracks/2aYHxnMF2umAavtgBvmkY1",
              "id": "2aYHxnMF2umAavtgBvmkY1",
              "is_local": false,
              "name": "Thought I Was Dead (feat. ScHoolboy Q & Santigold)",
              "popularity": 78,
              "preview_url": null,
              "track_number": 11,
              "type": "track",
              "uri": "spotify:track:2aYHxnMF2umAavtgBvmkY1"
            },
            "currently_playing_type": "track",
            "actions": {
              "disallows": {
                "resuming": true
              }
            },
            "is_playing": true
          };
        expect(getSongNameFromData(trackData)).toBe('Thought I Was Dead (feat. ScHoolboy Q & Santigold)');
    });
});
