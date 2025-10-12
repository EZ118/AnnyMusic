class SearchView {
    constructor() {
        this.keyword = "";
        this.platform = "netease";
        this.searchResults = [];
    }
    oninit() {
        this.keyword = "";
        this.platform = "netease";
        this.searchResults = [];
    }
    doSearch(keyword) {
        if (!keyword) { return; }
        getSearchResult(keyword, this.platform, (res) => {
            this.searchResults = res;
            m.redraw();
        });
    }
    doPlayMusic(musicInfo) {
        PlayerView.play(musicInfo);
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
                                        src: result.cover,
                                        alt: result.name,
                                        class: "cover"
                                    })
                                ),
                                m("td", result.name),
                                m("td", result.artist),
                                m("td",
                                    m("button", {
                                        title: "Play now",
                                        onclick: () => {
                                            doPlayMusic(result);
                                        }
                                    }, " ▸ "),
                                    m("button", {
                                        title: "Add to favorites",
                                        onclick: () => {
                                            doPlayMusic(result);
                                        }
                                    }, " ☆ "),
                                    m("button", {
                                        title: "Add to current playlist",
                                        onclick: () => {
                                            doPlayMusic(result);
                                        }
                                    }, " + ")
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