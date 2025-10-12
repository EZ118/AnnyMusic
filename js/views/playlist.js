class PlaylistView {
    constructor() {
        this.playlist = [];
    }

    view(vnode) {
        return [
            m(".banner", [
                m("h1", "Playlists"),
                m("p", "A small home for wandering thoughts.")
            ]),
            m(".row", [
            ])

        ]
    }
}

export default PlaylistView;