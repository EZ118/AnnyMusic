import MusicList from "../components/list.js";

class PlaylistView {
    constructor() {
    }

    oninit() {
        this.playlistId = m.route.param("id");
        this.loadPlaylists();
    }

    onupdate() {
        // 页面切换时需要重新渲染
        if ((!this.playlistId && m.route.param("id")) || (this.playlistId && !m.route.param("id"))) {
            this.playlistId = m.route.param("id");
            m.redraw();
        }
    }

    loadPlaylists() {
        this.playlists = getStorageSync("playlists") || {};
        m.redraw();
    }

    createPlaylist() {
        
    }

    playPlaylist(id) {
        PlayerView.addToPlaylist(this.playlists[id].list);
    }

    renamePlaylist(id){
        const res = prompt("Enter the new title for your playlist.", this.playlists[id].name);
        if(res) {
            this.playlists[id].name = res;
            setStorageSync("playlists", this.playlists);
            this.loadPlaylists();
        }
    }

    deletePlaylist(id) {
        const res = confirm("Are you sure to delete the playlist?");
        if (res) {
            delete this.playlists[id];
            setStorageSync("playlists", this.playlists);
            this.loadPlaylists();
        }
    }

    view(vnode) {
        if (!this.playlistId) {
            // 如果是查看 全部播放列表
            return [
                m(".banner", [
                    m("h1", "Playlists"),
                    m("p", "A small home for wandering thoughts.")
                ]),
                m(".row",
                    Object.entries(this.playlists).map(([key, val]) => {
                        return m("div", { class: "playlist-card" }, [
                            m("img.cover", { src: "./img/default_cover.svg" }),
                            m("h3.title", val.name),
                            m("button.icon-btn", {
                                title: "Play",
                                onclick: () => this.playPlaylist(key)
                            }, m.trust(ICON.play)),
                            m("button.icon-btn", {
                                title: "Rename",
                                onclick: () => this.renamePlaylist(key)
                            }, m.trust(ICON.edit)),
                            m("button.icon-btn", {
                                title: "Delete",
                                onclick: () => this.deletePlaylist(key)
                            }, m.trust(ICON.delete))
                        ])
                    })
                )
            ]
        } else {
            // 如果是浏览 单个播放列表
            if (!this.playlists.hasOwnProperty(this.playlistId)) {
                // 传入错误参数处理
                return [
                    m("button.icon-btn", { onclick: () => m.route.set("/playlist") }, m.trust(ICON.arrowBack)),
                    m("b", " ❌ 播放列表不存在")
                ];
            }

            return [
                m(".banner-tint", [
                    m("button.icon-btn", { onclick: () => m.route.set("/playlist") }, m.trust(ICON.arrowBack)),
                    m("h1", this.playlists[this.playlistId].name),
                    m.trust(ICON.playList)
                ]),
                m(".row", [
                    m(MusicList, { data: this.playlists[this.playlistId].list })
                ])
            ]
        }
    }
}

export default PlaylistView;


/*
播放列表playlists结构：
{
  "114514": {
    "name": "测试列表",
    "list": [
      {
        "source": "wy",
        "songmid": 5264842,
        "hash": null,
        "name": "渡口",
        "albumName": "惠威T200A试音碟",
        "singer": "蔡琴",
        "img": "",
        "vip": false
      },
      {
        "source": "wy",
        "songmid": 28892231,
        "hash": null,
        "name": "无法原谅",
        "albumName": "无法原谅",
        "singer": "李佳璐",
        "img": "",
        "vip": true
      }
    ]
  }
}

*/