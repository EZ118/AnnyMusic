const defaultQuality = "128k";

const PlayerView = {
    oninit() {
        PlayerView.currentInfo = {};
        PlayerView.duration = 0.01; // 音频总时长
        PlayerView.currentTime = 0; // 当前播放进度
        PlayerView.cover = "./img/default_cover.svg"; // 歌曲封面
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

            // 加载
            PlayerView.audio.src = newKey.mp3;
            PlayerView.cover = newKey.cover;
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
    view(vnode) {
        return [
            m('.progressbar', { onclick: PlayerView.handleMouseClick },
                m('.progressbar-track', { style: { width: (PlayerView.currentTime / PlayerView.duration * 100) + '%' } })
            ),

            m('.controls',
                m('img', { src: PlayerView.cover, title: PlayerView.currentInfo.title, class: "left" }),
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