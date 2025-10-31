const defaultQuality = "128k";

const LyricView = {
    oninit() {
        LyricView.isVisible = false;
        LyricView.lyric = [];
        LyricView.currentInfo = {};
        LyricView.isVisible = false;

        LyricView.currentLrcLine = -1; // 歌词行数计数器

        LyricView.startProgressTracking();
    },

    show(mode) {
        if (mode != false) {
            // 显示歌词面板
            document.querySelector("#lyric_view").style.display = "flex";
            document.querySelector("#lyric_view").style.top = "0";
            document.querySelector("footer").style.left = "0";
            document.querySelector("footer").style.width = "100vw";
            LyricView.isVisible = true;
        } else {
            // 隐藏歌词面板
            document.querySelector("footer").style = "";
            document.querySelector("#lyric_view").style.top = "100vh";
            setTimeout(() => {
                document.querySelector("#lyric_view").style.display = "none";
            }, 200);
            LyricView.isVisible = false;
        }
    },


    toggle(info) {
        if (!info) return;

        if (!LyricView.isVisible) {
            LyricView.show(true);

            // 载入歌词
            if (LyricView.currentInfo != info || LyricView.lyric.length <= 2) {
                LyricView.currentInfo = info;
                LyricView.lyric = [
                    { time: 0, text: "加载中..." }
                ];
                m.redraw();

                // 获取歌词
                if (LyricView.currentInfo.songmid) {
                    getLyricSource(info, (lrc) => {
                        if (!lrc) {
                            LyricView.lyric = [
                                { time: 0, text: "暂无歌词" }
                            ];
                        } else {
                            LyricView.currentLrcLine = -1;
                            LyricView.lyric = parseLrc(lrc);
                        }
                        m.redraw();
                    });
                } else {
                    LyricView.lyric = [
                        { time: 0, text: "无播放内容" }
                    ];
                    m.redraw();
                }
            }
        } else {
            LyricView.show(false);
        }
    },

    scrollToLine(n) {
        const percent = 0.3; // 30%
        const container = document.querySelector("#lyric_view .right");
        if (!container) return;

        const target = container.children[n];
        if (!target) return;

        LyricView.currentLrcLine = n;

        const scrollTop = target.offsetTop - (container.clientHeight * percent);
        container.scrollTo({ top: scrollTop, behavior: 'smooth' });
    },


    startProgressTracking() {
        setInterval(() => {
            if (PlayerView.audio.duration && !PlayerView.audio.paused) {
                const currentTime = PlayerView.currentTime;

                if (!LyricView.lyric || LyricView.lyric.length === 0) return;

                let currentLineIndex = 0;
                for (let i = LyricView.lyric.length - 1; i >= 0; i--) {
                    if (LyricView.lyric[i].time <= currentTime + 0.7) {
                        if (i != LyricView.currentLrcLine) {
                            LyricView.scrollToLine(i);
                        }
                        break;
                    }
                }
                m.redraw();
            }
        }, 700);
    },

    jumpTo(time) {
        PlayerView.currentTime = PlayerView.audio.currentTime = time;
    },

    view(vnode) {
        return [
            m(".left", [
                m("button.icon-btn", { onclick: () => { LyricView.show(false); } }, m.trust(ICON.expand)),
                m("img.cover", { src: LyricView.currentInfo.img, alt: "", onerror: (e) => { e.currentTarget.src = "./img/default_cover.svg"; m.redraw(); } }),
                m("div", [
                    m("h2", LyricView.currentInfo.name),
                    m("h3", LyricView.currentInfo.singer)
                ])
            ]),
            m(".right", [
                m("div", { style: { height: "30vh" } }),
                LyricView.lyric.map((item, index) => {
                    return m(
                        "p",
                        {
                            class: (LyricView.currentLrcLine == index) ? "active" : "",
                            onclick: () => {
                                LyricView.jumpTo(item.time);
                            }
                        },
                        item.text
                    );
                }),
                m("div", { style: { height: "70vh" } })
            ])
        ]
    }
}

const PlayerView = {
    oninit() {
        PlayerView.currentInfo = {
            songmid: null,
            hash: null,
            img: "./img/default_cover.svg",
            name: "暂无歌曲",
            singer: "选择歌曲以播放",
            albumName: "",
            mp3: null, // 音频链接
            source: "local",
        };
        PlayerView.duration = 0.01; // 音频总时长
        PlayerView.currentTime = 0; // 当前播放进度
        PlayerView.audio = new Audio(); // 音频播放对象

        PlayerView.startProgressTracking(); // 自动更新播放进度
    },


    play(musicInfo) {
        // 中断正在播放的音频
        if (!PlayerView.audio.paused) {
            PlayerView.audio.pause();
        }

        getMusicSource(musicInfo, defaultQuality, (newKey) => {
            // 中断正在播放的音频（再确认）
            if (!PlayerView.audio.paused) {
                PlayerView.audio.pause();
            }

            // 特殊源处理
            if (musicInfo.source == "kw") {
                newKey.mp3 = newKey.mp3.replace(/:\/\/([^.]+)\.sycdn\.kuwo\.cn\//, '://$1-sycdn.kuwo.cn/');
            }

            // 加载
            PlayerView.currentInfo = musicInfo;
            PlayerView.audio.src = newKey.mp3;
            PlayerView.audio.load();

            // 播放
            PlayerView.audio.play()
                .then(() => {
                    console.log('[PlayerView.play] Audio loaded, music starts to play:', PlayerView.audio.src);
                    m.redraw(); // 刷新DOM，更新信息如封面、进度、按钮图标
                })
                .catch(err => {
                    console.error('[PlayerView.play]', err);
                });

            // 获取音频时长
            PlayerView.audio.addEventListener('loadedmetadata', () => {
                console.log('[PlayerView.play] Metadata loaded, music duration', PlayerView.audio.duration);
                PlayerView.currentTime = 0;
                PlayerView.duration = PlayerView.audio.duration;
            });
        })
    },

    startProgressTracking() {
        // 播放进度自动更新
        let progressInterval;
        if (progressInterval) clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            if (PlayerView.audio.duration) {
                const currentTime = PlayerView.audio.currentTime;

                PlayerView.currentTime = currentTime;
                m.redraw();
            }
        }, 1000);
    },

    handleMouseClick(e) {
        // 处理进度条点击，调整进度
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left; // 点击位置相对于元素左边界的距离
        const percentX = (clickX / rect.width); // 转换为百分比
        PlayerView.currentTime = percentX * PlayerView.duration; // 调整进度
        PlayerView.audio.currentTime = PlayerView.currentTime; // 应用进度到音频
        // console.log(percentX, PlayerView.duration);
        m.redraw();
    },

    toggleFullscreen() {
        LyricView.toggle(PlayerView.currentInfo);
    },

    view(vnode) {
        return [
            m('.progressbar', { onclick: PlayerView.handleMouseClick },
                m('.progressbar-track', { style: { width: (PlayerView.currentTime / PlayerView.duration * 100) + '%' } })
            ),

            m('.controls',
                m('img', { src: PlayerView.currentInfo.img, title: PlayerView.currentInfo.title, class: "left", onclick: PlayerView.toggleFullscreen, onerror: (e) => { e.currentTarget.src = "./img/default_cover.svg"; m.redraw(); } }),
                m('.center', [
                    m(".controlBtn", { onclick: () => { PlayerView.play() } }, m.trust(ICON.prevSong)),
                    m(".controlBtn", { onclick: () => { PlayerView.audio.paused ? PlayerView.audio.play() : PlayerView.audio.pause(); } }, PlayerView.audio.paused ? m.trust(ICON.play) : m.trust(ICON.pause)),
                    m(".controlBtn", { onclick: () => { PlayerView.play() } }, m.trust(ICON.nextSong))
                ]),
                m('.right', `${formatDuration(PlayerView.currentTime) || "00:00"}/${formatDuration(PlayerView.duration)}`)
            )
        ]
    }
}

// export default PlayerView;