import MusicList from "../components/list.js";

class SearchView {
    constructor() { }
    oninit() {
        this.keyword = "";
        this.platform = "wy"; // 初始默认搜索小蜗音乐
        this.searchResults = [];
    }
    doSearch(keyword) {
        if (!keyword || !keyword.trim()) { return; }
        getSearchResult(keyword, this.platform, (res) => {
            this.searchResults = res;
            m.redraw();
        });
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
                m(".search-source",
                    [
                        "Platform: [",
                        m("button.item", {
                            style: {
                                background: "#ffb4a9"
                            },
                            onclick: () => {
                                this.platform = "wy";
                                this.doSearch(this.keyword);
                            },
                            title: "小荟音乐"
                        }),
                        m("button.item", {
                            style: {
                                background: "#b4c5ff"
                            },
                            onclick: () => {
                                this.platform = "kg";
                                this.doSearch(this.keyword);
                            },
                            title: "小枸音乐"
                        }),
                        m("button.item", {
                            style: {
                                background: "#e0c723"
                            },
                            onclick: () => {
                                this.platform = "kw";
                                this.doSearch(this.keyword);
                            },
                            title: "小蜗音乐"
                        }),
                        m("button.item", {
                            style: {
                                background: "#55df95"
                            },
                            onclick: () => {
                                this.platform = "tx";
                                this.doSearch(this.keyword);
                            },
                            title: "小秋音乐"
                        }),
                        "]"
                    ]
                ),

                this.searchResults.length ? [
                    m(MusicList, { data: this.searchResults })
                ] : [
                    m("h2.tiptext-onblank", "~ 搜我所想 ~")
                ]
            ])
        ];
    }
}
export default SearchView;