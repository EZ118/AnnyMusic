import MusicList from "../components/list.js";

class PlaylistView {
    constructor() {
    }

    oninit() {
        this.playlistId = m.route.param("id");
        this.playlists = {};
        this.loadPlaylists();
    }

    onupdate() {
        // 页面切换时需要重新渲染
        if ((!this.playlistId && m.route.param("id")) || (this.playlistId && !m.route.param("id"))) {
            this.playlistId = m.route.param("id");
            this.loadPlaylists();
        }
    }

    loadPlaylists() {
        // 加载所有播放列表
        this.playlists = getStorageSync("playlists") || {};
        m.redraw();
    }

    createPlaylist() {
        // 创建播放列表
        const res = prompt("Enter a title for your new playlist.", "");
        if (res.trim() && res.length < 150) {
            this.playlists = {
                ...this.playlists,
                [ (new Date()).valueOf() ]: {
                    "name": res,
                    "list": []
                }
            }
            
            setStorageSync("playlists", this.playlists);
            this.loadPlaylists();
        }
    }

    playPlaylist(id) {
        // 播放完整播放列表
        PlayerView.addToQueue(this.playlists[id].list);
    }

    renamePlaylist(id){
        // 重命名播放列表
        const res = prompt("Enter a new title for your playlist.", this.playlists[id].name);
        if(res) {
            this.playlists[id].name = res;
            setStorageSync("playlists", this.playlists);
            this.loadPlaylists();
        }
    }

    deletePlaylist(id) {
        // 删除播放列表
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
                m("button.fab-btn", { onclick: () => this.createPlaylist() }, m.trust(ICON.add)),
                m(".row",
                    Object.keys(this.playlists).length ? Object.entries(this.playlists).map(([key, val]) => {
                        return m("div", { class: "playlist-card" }, [
                            m("img.cover", {
                                onclick: () => m.route.set("/playlist/" + key),
                                src: "./img/default_cover.svg"
                            }),
                            m("h3.title", {
                                onclick: () => m.route.set("/playlist/" + key)
                            }, val.name),
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
                    }) : m("h2.tiptext-onblank", "点击“+”以新增列表")
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
                    m("h1", [
                        m("button.icon-btn", { onclick: () => m.route.set("/playlist") }, m.trust(ICON.arrowBack)),
                        this.playlists[this.playlistId].name
                    ]),
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
  "114514": {                       // 列表被创建时的时间戳
    "name": "测试列表",             // 播放列表
    "list": [
      {
        "source": "wy",             // 音乐平台
        "songmid": 1145141,         // 歌曲 ID
        "hash": null,               // 歌曲 HASH （仅kg源）
        "name": "先辈之声",         // 歌曲名称
        "albumName": "小小试音碟",  // 专辑名称
        "albumId": "11451419",      // 专辑名称
        "singer": "田所浩二",       // 歌手
        "img": "",                  // 封面（加载错误则显示默认封面）
      }
    ]
  }
}

*/