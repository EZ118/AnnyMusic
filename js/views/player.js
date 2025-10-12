const PlayerView = {

    oninit() {
        PlayerView.duration = 100;
        PlayerView.currentTime = 0;
        PlayerView.cover = "https://picsum.photos/64/64?random=1";
    },


    play(musicInfo) {
        //alert(musicInfo)
        //PlayerView.currentTime = musicInfo.time;
        //m.redraw();
    },

    handleMouseClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left; // 点击位置相对于元素左边界的距离
        const percentX = (clickX / rect.width); // 转换为百分比
        PlayerView.currentTime = percentX * PlayerView.duration; // 调整进度
        // console.log(percentX, PlayerView.duration);
        m.redraw();
    },
    view(vnode) {
        return [
            m('.progressbar', { onclick: PlayerView.handleMouseClick },
                m('.progressbar-track', { style: { width: (PlayerView.currentTime / PlayerView.duration * 100) + '%' } })
            ),

            m('.controls',
                m('img', { src: PlayerView.cover, alt: "ALBUM", class: "left" }),
                m('.right', [
                    m(".controlBtn", { onclick: () => {PlayerView.play()} }, m.trust( ICON.prevSong )),
                    m(".controlBtn", { onclick: () => {PlayerView.play()} }, m.trust( ICON.play )),
                    m(".controlBtn", { onclick: () => {PlayerView.play()} }, m.trust( ICON.nextSong ))
                ]),
            )
        ]
    }
}

export default PlayerView;