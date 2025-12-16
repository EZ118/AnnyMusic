/*
 * This script is for counting songs listened and generate 'popular songs', 'recently played', 'popular playlists' etc..
 * Not finished yet.
 */

class StatMgr {
    constructor() {
        // init
        this.data = getStorageSync("statisticData") || { songs: [], playlists: [] };
    }

    data(dataName) {
        if (dataName == "popular_songs") {
            return this.data["songs"].map((item, index) => {
                // do sth. ...
                if (index < 7) return item;
            });
        } else if (dataName == "recent_songs") {
            return this.data["songs"].map((item, index) => {
                // do sth. ...
                if (index < 7) return item;
            });
        } else if (dataName == "recent_playlists") {
            return this.data["playlists"].map((item, index) => {
                // do sth. ...
                if (index < 7) return item;
            });
        }
    }
}

export default StatMgr