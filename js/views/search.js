class SearchView {
    constructor() { }
    oninit() {
        this.keyword = "";
        this.platform = "kw";
        this.searchResults = [];
    }
    doSearch(keyword) {
        if (!keyword || !keyword.trim()) { return; }
        getSearchResult(keyword, this.platform, (res) => {
            this.searchResults = res;
            m.redraw();
        });
    }
    doPlayMusic(musicInfo) {
        PlayerView.play(musicInfo);
    }
    getMusicLyric(musicInfo) {
        getLyricSource(musicInfo, (res) => {
            console.log(res);
        });
    }
    view(vnode) {
        return [
            m(".banner", [
                m("h1", {
                    onclick: () => {
                        this.doSearch(this.keyword);
                    }
                }, "Search"),
                m("input", {
                    type: "text",
                    class: "search-input",
                    placeholder: " ⌕ Type to search...",
                    value: this.keyword,
                    oninput: (e) => {
                        this.keyword = e.target.value;
                    },
                    onkeydown: (e) => {
                        if (e.key === "Enter") {
                            this.doSearch(this.keyword);
                        }
                    }
                })
            ]),
            m(".search-results-area", [
                m("h2", "Results"),
                m(
                    "select",
                    {
                        onchange: (e) => {
                            this.platform = e.target.value;
                            this.doSearch(this.keyword);
                        }
                    },
                    [
                        m("option", { value: "kw" }, "小蜗音乐"),
                        m("option", { value: "kg" }, "小枸音乐"),
                        m("option", { value: "tx" }, "小秋音乐"),
                        m("option", { value: "wy" }, "小荟音乐"),
                    ]
                ),
                m("table.search-results-list", [
                    m("thead", [
                        m("tr", [
                            m("th", { style: { width: "5%", maxWidth: "80px" } }, "   "),
                            m("th", { style: { width: "40%", minWidth: "150px" } }, "Name"),
                            m("th", { style: { width: "20%", minWidth: "50px" } }, "Artist"),
                            m("th", "Operation")
                        ])
                    ]),
                    m("tbody",
                        this.searchResults.map(result => {
                            return m("tr", [
                                m("td",
                                    m("img", {
                                        src: result.pic,
                                        alt: result.name,
                                        class: "cover",
                                        loading: "eager",
                                        onerror: (e) => {
                                            e.target.src = "./img/default_cover.svg";
                                        }
                                    })
                                ),
                                m("td", result.name),
                                m("td", result.artist),
                                m("td",
                                    m("button", {
                                        title: "Play now",
                                        onclick: () => {
                                            this.doPlayMusic(result);
                                        }
                                    }, " ▸ "),
                                    m("button", {
                                        title: "Add to favorites",
                                        onclick: () => {
                                            this.doPlayMusic(result);
                                        }
                                    }, " ☆ "),
                                    m("button", {
                                        title: "Add to current playlist",
                                        onclick: () => {
                                            this.doPlayMusic(result);
                                        }
                                    }, " + "),
                                    m("button", {
                                        title: "查看歌词",
                                        onclick: () => {
                                            this.getMusicLyric(result);
                                        }
                                    }, " 歌词获取 ")
                                )
                            ]);
                        })
                    )
                ])
            ])
        ];
    }
}
export default SearchView;