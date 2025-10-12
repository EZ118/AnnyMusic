class HomeView {
    constructor() {
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.audio.addEventListener('ended', () => {
            this.next();
        });
    }

    view(vnode) {
        return m("div", [
            m("h1", "Home")
        ])
    }
}

export default HomeView;