import Tabs from "../components/tabs.js";

class SettingsView {
    constructor() {
    }

    oninit(vnode) {
        this.sourceList = getStorageSync("externalMusicSource") || [];
        vnode.state.selected = 0;
    }

    importMusicSource() {
        pickFile(".js,.ts", (file) => {
            const reader = new FileReader();
            reader.readAsText(file, "text");
            reader.onload = (e) => {
                const res = e.target.result;
                if (!res) { toast("脚本不存在！"); return; }

                let metadata = parseMetadata(res);
                if (!metadata.name) { toast("脚本元数据错误"); return; }

                if (res.includes(`='jsjiami.com.v`)) { alert("暂不支持导入该脚本！脚本代码可能包含自卫模式，导致 AnnyMusic 崩溃。"); return; }

                const userComfirm = confirm(`是否添加该脚本？ \n\n- 名称: ${metadata.name} \n- 作者: ${metadata.author}\n- 简介: ${metadata.description}`);
                if (!userComfirm) { return; }

                metadata["rawScript"] = res;
                this.sourceList.push(metadata);
                setStorageSync("externalMusicSource", this.sourceList);
                toast("已添加，下次加载时生效");
                m.redraw();
            }
        });
    }

    deleteMusicSource(index) {
        const res = confirm("Are you sure to delete this music source?");
        if (res) {
            this.sourceList.splice(index, 1);
            setStorageSync("externalMusicSource", this.sourceList);
            m.redraw();
        }
    }

    view(vnode) {
        return m(".settings-view", [
            m(".banner-tint", [
                m("h1", "Settings"),
                m.trust(ICON.settings)
            ]),
            m("button",
                {
                    class: "fab-btn",
                    title: "保存更改",
                    onclick: () => {
                        toast("未保存，功能未开发");
                    }
                },
                m.trust(ICON.save)
            ),
            m(Tabs, {
                tabs: [
                    {
                        label: "基本设置", key: "basic", content: [
                            m("h3", "基本设置"),

                            m("label", [
                                m("input[type=checkbox]"),
                                "启动时以全屏显示窗口"
                            ]),
                            m("label", [
                                m("input[type=checkbox]"),
                                "始终启用黑暗主题"
                            ]),

                            m("label", "自定义源"),
                            m("ol",
                                this.sourceList.map((item, index) => {
                                    return m(
                                        "il",
                                        { style: { display: "block" } },
                                        [
                                            item.name,
                                            " ",
                                            m("button.icon-btn", {
                                                onclick: () => this.deleteMusicSource(index)
                                            }, m.trust(ICON.delete))
                                        ]
                                    );
                                })
                            ),
                            m("button", {
                                onclick: () => this.importMusicSource()
                            }, "导入新音源"),

                            m("label", "语言"),
                            m("select", [
                                m("option[value='zh']", "简体中文"),
                                m("option[value='en']", "English")
                            ]),
                        ]
                    },
                    {
                        label: "播放设置", key: "player", content: [
                            m("h3", "播放设置"),
                        ]
                    },
                    {
                        label: "搜索设置", key: "search", content: [
                            m("h3", "搜索设置"),

                            m("label", [
                                m("input[type=checkbox]"),
                                "显示历史搜索记录"
                            ]),
                            m("label", [
                                m("input[type=checkbox]"),
                                "启动时自动聚焦搜索框"
                            ]),
                            m("label", "默认初始搜索源"),
                            m("select", [
                                m("option[value='wy']", "小荟音乐"),
                                m("option[value='kg']", "小枸音乐"),
                                m("option[value='kw']", "小蜗音乐"),
                                m("option[value='tx']", "小秋音乐")
                            ]),
                        ]
                    },
                    {
                        label: "快捷键", key: "shortcut", content: [
                            m("h3", "快捷键"),
                            
                            m("label", [
                                m("input[type=checkbox]"),
                                "启用"
                            ]),
                            m("label", "播放/暂停控制：Ctrl + F5 "),
                            m("label", "上一首歌曲：Ctrl + ← "),
                            m("label", "下一首歌曲：Ctrl + → "),
                            m("label", "聚焦搜索框：F1 ")
                        ]
                    },
                    {
                        label: "备份与恢复", key: "backup", content: [
                            m("h3", "备份与恢复"),

                            m("label", "部分数据（列表数据包括「试听列表」、「我的收藏］和用户自行创建的列表；设置数据不包括快捷键设置）"),
                            m("button", {
                                onclick: () => this.importPlaylists()
                            }, "导入列表"),
                            m("button", {
                                onclick: () => this.exportPlaylists()
                            }, "导出列表"),
                            m("button", {
                                onclick: () => this.importPref()
                            }, "导入设置"),
                            m("button", {
                                onclick: () => this.exportPref()
                            }, "导出设置"),

                            m("label", "所有数据（列表数据与设置数据）"),
                            m("button", {
                                onclick: () => this.importData()
                            }, "导入"),
                            m("button", {
                                onclick: () => this.exportData()
                            }, "导出"),

                            m("label", "其他备份格式（目前不支持恢复此类备份文件）"),
                            m("button", {
                                onclick: () => this.exportPlaylists_txt()
                            }, "导出TXT格式列表"),
                            m("button", {
                                onclick: () => this.exportPlaylists_csv()
                            }, "导出CSV格式列表"),
                        ]
                    },
                    {
                        label: "其他", key: "others", content: [
                            m("h3", "其他"),

                            m("label", "资源缓存管理"),
                            m("button", {
                                onclick: () => this.clearResCache()
                            }, "清理资源缓存"),

                            m("label", "其他缓存管理"),
                            m("button", {
                                onclick: () => this.clearUrlCache()
                            }, "清理歌曲URL缓存"),
                            m("button", {
                                onclick: () => this.clearLrcCache()
                            }, "清理歌词缓存"),

                            m("label", "列表数据管理"),
                            m("button", {
                                onclick: () => this.clearAllPlaylists()
                            }, "清空「播放列表」数据"),
                        ]
                    },
                    {
                        label: "关于 AnnyMusic", key: "about", content: [
                            m("h3", "关于 AnnyMusic"),
                            m.trust(`
                                本软件完全免费,代码已开源。开源地址: https://github.com/EZ118/AnnyMusic <br>
                                软件的常见问题可转至：桌面版常见问题 <br>
                                我们整理了一些常见的使用问题。仔细、仔细、仔细地阅读常见问题后，仍有问题可到 GitHub 提交 Issue。 <br>
                                由于软件开发的初衷仅是为了对新技术的学习与研究，因此软件直至停止维护都将会一直保持纯净。目前本项目的原始发布地址只有GitHub，其他渠道均为第三方转载发布，可信度请自行鉴别。 <br>
                                By: EZ118
                            `)
                        ]
                    },
                ],
                selected: vnode.state.selected,
                onselect: (i) => { vnode.state.selected = i; }
            })
        ])
    }
}

export default SettingsView;