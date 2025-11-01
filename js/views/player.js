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

    load(info) {
        if (info) LyricView.currentInfo = info;
        if (LyricView.currentInfo.songmid) {
            getLyricSource(LyricView.currentInfo, (lrc) => {
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
                LyricView.load();
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

        PlayerView.songQueue = [];
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

        PlayerView.audio.addEventListener('ended', () => {
            console.log("自动播放下一首歌曲")
            PlayerView.nextSong();
        });
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

    play(musicInfo, fromQueueControl = false) {
        // 处理播放队列逻辑（仅当不是从队列控制调用时）
        if (musicInfo && !fromQueueControl) {
            // 检查是否是当前正在播放的歌曲
            const isCurrentPlaying = PlayerView.currentInfo.songmid &&
                PlayerView.currentInfo.source === musicInfo.source &&
                PlayerView.currentInfo.songmid === musicInfo.songmid;

            if (isCurrentPlaying) {
                // 如果是当前正在播放的歌曲，从头开始
                PlayerView.audio.currentTime = 0;
                PlayerView.currentTime = 0;
                PlayerView.audio.play();
                console.log('[PlayerView.play] 重新播放当前歌曲');
                m.redraw();
                return;
            }

            // 检查歌曲是否在队列中
            const queueIndex = PlayerView.songQueue.findIndex(song =>
                song.source === musicInfo.source &&
                song.songmid === musicInfo.songmid
            );

            if (queueIndex !== -1) {
                // 歌曲在队列中，从该位置开始播放
                // 将队列重新排序：从找到的位置开始
                PlayerView.songQueue = [
                    ...PlayerView.songQueue.slice(queueIndex),
                    ...PlayerView.songQueue.slice(0, queueIndex)
                ];
                console.log('[PlayerView.play] 从队列中的歌曲开始播放');
            } else {
                // 歌曲不在队列中，插入到当前播放位置
                if (PlayerView.currentInfo.songmid) {
                    // 如果有正在播放的歌曲，找到它在队列中的位置
                    const currentIndex = PlayerView.songQueue.findIndex(song =>
                        song.source === PlayerView.currentInfo.source &&
                        song.songmid === PlayerView.currentInfo.songmid
                    );

                    if (currentIndex !== -1) {
                        // 在当前歌曲后面插入
                        PlayerView.songQueue.splice(currentIndex + 1, 0, musicInfo);
                    } else {
                        // 当前歌曲不在队列中，插入到队列开头
                        PlayerView.songQueue.unshift(musicInfo);
                    }
                } else {
                    // 没有正在播放的歌曲，插入到队列开头
                    PlayerView.songQueue.unshift(musicInfo);
                }
                console.log('[PlayerView.play] 歌曲已添加到队列');
            }
        }

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
        });



        // 刷新歌词
        if(LyricView.isVisible) {
            LyricView.load(musicInfo);
        }
    },

    prevSong() {
        if (PlayerView.songQueue.length === 0) {
            console.log('[PlayerView.prevSong] 播放队列为空');
            return;
        }

        // 找到当前歌曲在队列中的位置
        const currentIndex = PlayerView.songQueue.findIndex(song =>
            song.source === PlayerView.currentInfo.source &&
            song.songmid === PlayerView.currentInfo.songmid
        );

        let prevSong;
        if (currentIndex === -1) {
            // 当前歌曲不在队列中，播放队列最后一首
            prevSong = PlayerView.songQueue[PlayerView.songQueue.length - 1];
        } else if (currentIndex === 0) {
            // 当前是第一首，循环到最后一首
            prevSong = PlayerView.songQueue[PlayerView.songQueue.length - 1];
        } else {
            // 播放前一首
            prevSong = PlayerView.songQueue[currentIndex - 1];
        }

        PlayerView.play(prevSong, true);
        console.log('[PlayerView.prevSong] 播放上一首');
    },

    nextSong() {
        if (PlayerView.songQueue.length === 0) {
            console.log('[PlayerView.nextSong] 播放队列为空');
            return;
        }

        // 找到当前歌曲在队列中的位置
        const currentIndex = PlayerView.songQueue.findIndex(song =>
            song.source === PlayerView.currentInfo.source &&
            song.songmid === PlayerView.currentInfo.songmid
        );

        let nextSong;
        if (currentIndex === -1) {
            // 当前歌曲不在队列中，播放队列第一首
            nextSong = PlayerView.songQueue[0];
        } else if (currentIndex === PlayerView.songQueue.length - 1) {
            // 当前是最后一首，循环到第一首
            nextSong = PlayerView.songQueue[0];
        } else {
            // 播放下一首
            nextSong = PlayerView.songQueue[currentIndex + 1];
        }

        PlayerView.play(nextSong, true);
        console.log('[PlayerView.nextSong] 播放下一首');
    },

    view(vnode) {
        return [
            m('.progressbar', { onclick: PlayerView.handleMouseClick },
                m('.progressbar-track', { style: { width: (PlayerView.currentTime / PlayerView.duration * 100) + '%' } })
            ),

            m('.controls',
                m('img', { src: PlayerView.currentInfo.img, title: PlayerView.currentInfo.title, class: "left", onclick: PlayerView.toggleFullscreen, onerror: (e) => { e.currentTarget.src = "./img/default_cover.svg"; m.redraw(); } }),
                m('.center', [
                    m(".controlBtn", { onclick: () => { PlayerView.prevSong() } }, m.trust(ICON.prevSong)),
                    m(".controlBtn", { onclick: () => { PlayerView.audio.paused ? PlayerView.audio.play() : PlayerView.audio.pause(); } }, PlayerView.audio.paused ? m.trust(ICON.play) : m.trust(ICON.pause)),
                    m(".controlBtn", { onclick: () => { PlayerView.nextSong() } }, m.trust(ICON.nextSong))
                ]),
                m('.right', `${formatDuration(PlayerView.currentTime) || "00:00"}/${formatDuration(PlayerView.duration)}`)
            )
        ]
    },




    // external functions
    addToPlaylist(currentSong) {
        Dialog.show("addToPlaylist", {
            playlists: getStorageSync("playlists") || {},
            currentSong: currentSong
        }).then(updatedPlaylists => {
            setStorageSync("playlists", updatedPlaylists);
            // 保存更新后的播放列表
        }).catch(updatedPlaylists => {
            // setStorageSync("playlists", updatedPlaylists);
        });
    },

    addToQueue(currentSong) {
        // 检查是否是列表（数组）
        if (Array.isArray(currentSong)) {
            // 替换整个播放队列
            PlayerView.songQueue = [...currentSong];
            console.log('已替换播放队列:', PlayerView.songQueue);

            // 从第一首开始播放
            if (PlayerView.songQueue.length > 0) {
                PlayerView.play(PlayerView.songQueue[0], true);
            }
            return;
        }

        // 原先的单曲逻辑
        // 检查是否是当前正在播放的歌曲
        if (PlayerView.currentInfo.source === currentSong.source &&
            PlayerView.currentInfo.songmid === currentSong.songmid) {
            console.log('歌曲已在播放中');
            return;
        }

        // 检查是否已在播放队列中
        const existsInQueue = PlayerView.songQueue.some(song =>
            song.source === currentSong.source &&
            song.songmid === currentSong.songmid
        );

        if (existsInQueue) {
            console.log('歌曲已在播放队列中');
            return;
        }

        // 添加到队列末尾
        PlayerView.songQueue.push(currentSong);
        console.log('已添加到播放队列:', PlayerView.songQueue);
    }
}

// export default PlayerView;