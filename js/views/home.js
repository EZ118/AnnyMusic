class HomeView {
    constructor() {
        this.currentQuote = "";
    }

    oninit() {
        this.currentQuote = this.getRandomQuote();
        this.recentlyPlayed = statMgr.data.songs || [{}, {}, {}];
        this.recentPlaylist = statMgr.data.playlists || [{}, {}, {}];
    }

    getRandomQuote() {
        const musicQuotes = [
            "音乐是比一切智慧、一切哲学更高的启示。——贝多芬",
            "没有音乐，生活将是一个错误。——尼采",
            "音乐表达那些无法言说、又不可能沉默的东西。——维克多·雨果",
            "技术是有限的，但音乐是无限的。——帕布罗·卡萨尔斯",
            "一首伟大的歌曲，能改变一个人的一生。——艾瑞莎·弗兰克林",
            "音乐是情感的记忆。——克劳德·德彪西",
            "音乐是上帝赐给人类最美的礼物。——马丁·路德",
            "节奏是音乐的灵魂。——约翰·科尔特兰",
            "音乐能说出非语言所能表达的东西。——海因里希·海涅",
            "音乐是唯一一种全世界都能听懂的语言。——亨利·W·朗费罗",
            "音乐是灵魂的语言。——贝多芬",
            "当我创作时，我仿佛听到了神的声音。——肖邦",
            "音乐是自由的表达，它不属于任何人。——约翰·凯奇",
            "没有旋律，就没有音乐。——巴赫",
            "音乐是人类最古老、最原始的艺术形式。——阿尔弗雷德·诺斯·怀特海",
            "真正的音乐来自内心，而非技巧。——小泽征尔",
            "我写歌，是因为我无法用语言表达我的感受。——约翰·列侬",
            "音乐是一种超越语言的力量。——马友友",
            "音乐是通往宇宙的桥梁。——约翰·丹佛"
        ];
        return musicQuotes[Math.floor(Math.random() * musicQuotes.length)];
    }

    view(vnode) {
        return [
            m(".banner", [
                m("h1", "Home"),
                m("p", this.currentQuote)
            ]),
            m(".home-row", [
                m(".home-section", [
                    m("h2", "Recently Played"),
                    this.recentlyPlayed.map((item) => {
                        return m("div",
                            {
                                class: "music-card",
                                onclick: () => {
                                    PlayerView.play(item);
                                }
                            },
                            [
                                m("img.cover", { src: item.img, onerror: (e) => { e.currentTarget.src = "./img/default_cover.svg"; m.redraw(); } }),
                                m("div.info", [
                                    m("h3.title", item.name),
                                    m("p.artist", item.singer)
                                ])
                            ]
                        )
                    })
                ]),
                m(".home-section", { style: { "grid-template-columns": "repeat(1, 1fr)" } }, [
                    m("h2", "Recent Playlist"),
                    this.recentPlaylist.map((item) => {
                        return m("div",
                            {
                                class: "music-card"
                            },
                            [
                                m("img.cover", { src: "./img/default_cover.svg" }),
                                m("div.info", [
                                    m("h3.title", item.name),
                                    m("p.artist", item.singer)
                                ])
                            ]
                        )
                    })
                ])
            ])

        ]
    }
}

export default HomeView;