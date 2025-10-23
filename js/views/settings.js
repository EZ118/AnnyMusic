import Tabs from "../components/tabs.js";

class SettingsView {
    constructor() {
        this.sourceList = getStorageSync("externalMusicSource") || [];
    }

    oninit(vnode) {
        vnode.state.selected = 0;
    }

    importMusicSource() {
        pickFile(".js,.ts", (file) => {
            const reader = new FileReader();
            reader.readAsText(file, "text");
            reader.onload = (e) => {
                const res = e.target.result;
                if (!res) { alert("脚本不存在！"); return; }

                let metadata = parseMetadata(res);
                if (!metadata.name) { alert("脚本元数据错误"); return; }

                const userComfirm = confirm(`是否添加该脚本？ \n\n- 名称: ${metadata.name} \n- 作者: ${metadata.author}\n- 简介: ${metadata.description}`);
                if (!userComfirm) { return; }

                metadata["rawScript"] = res;
                this.sourceList.push(metadata);
                setStorageSync("externalMusicSource", this.sourceList);
                alert("已添加，下次加载时生效");
            }
        });
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
                        alert("未保存，功能未开发");
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
                            "当前音源: ",
                            m("button", {
                                onclick: () => {
                                    this.importMusicSource()
                                }
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
                        label: "歌词设置", key: "lyric", content: [
                            m("h3", "歌词设置"),
                        ]
                    },
                    {
                        label: "搜索设置", key: "search", content: [
                            m("h3", "搜索设置"),
                        ]
                    },
                    {
                        label: "快捷键", key: "shortcut", content: [
                            m("h3", "快捷键"),
                        ]
                    },
                    {
                        label: "备份与恢复", key: "backup", content: [
                            m("h3", "备份与恢复"),
                        ]
                    },
                    {
                        label: "其他", key: "others", content: [
                            m("h3", "其他"),
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