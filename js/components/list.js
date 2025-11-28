// MusicList 组件（用于搜索、播放列表...）
const MusicList = {
    view: ({ attrs }) => {
        const listItems = attrs.data;

        return m("table.music-list", [
            m("thead", [
                m("tr", [
                    m("th", { style: { width: "42px" } }, "#"),
                    m("th", { style: { width: "auto", minWidth: "100px" } }, "Name"),
                    m("th", { style: { width: "20%", minWidth: "50px" } }, "Artist"),
                    m("th", { style: { width: "20%", minWidth: "50px" } }, "Album"),
                    m("th", { style: { width: "175px" } }, " Actions")
                ])
            ]),
            m("tbody",
                listItems.map((item, index) => {
                    return m("tr", [
                        m("td", index + 1),
                        m("td", { ondblclick: () => PlayerView.play(item) }, item.name),
                        m("td", item.singer),
                        m("td", item.albumName),
                        m("td",
                            m("button", {
                                title: "Play now",
                                class: "icon-btn",
                                onclick: () => PlayerView.play(item)
                            }, m.trust(ICON.play)),
                            m("button", {
                                title: "Add to playlist",
                                class: "icon-btn",
                                onclick: () => PlayerView.addToPlaylist(item)
                            }, m.trust(ICON.star)),
                            m("button", {
                                title: "Add to queue",
                                class: "icon-btn",
                                onclick: () => PlayerView.addToQueue(item)
                            }, m.trust(ICON.add)),
                            m("button", {
                                title: "Show detail",
                                class: "icon-btn",
                                onclick: () => Dialog.show("showMusicInfo", item)
                            }, m.trust(ICON.info))
                        )
                    ]);
                })
            )
        ])
    }
};

export default MusicList;