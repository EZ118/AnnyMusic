let dialogState = {
    isVisible: false,
    options: {
        onConfirm: () => { },
        onCancel: () => { },
        title: "",
        content: "", // 这个现在总是函数
    },
    internalState: {}
};

// --- 内容渲染函数 ---

function _renderAddToPlaylistContent(state, update) {
    const playlists = dialogState.options.playlists || {};
    const playlistIds = Object.keys(playlists);

    return [
        m('h2.dialog-title', '添加到播放列表'),
        m('div.dialog-body', [
            playlistIds.length === 0
                ? m('p.empty-message', '暂无播放列表')
                : m('div.playlist-list',
                    playlistIds.map(playlistId => {
                        const playlist = playlists[playlistId];
                        const isSelected = state.selectedPlaylists.has(playlistId);

                        return m('div.playlist-item', {
                            className: isSelected ? 'selected' : '',
                            onclick: () => _togglePlaylist(playlistId, state, update)
                        }, [
                            m('input[type=checkbox]', {
                                checked: isSelected,
                                onclick: (e) => {
                                    e.stopPropagation();
                                    _togglePlaylist(playlistId, state, update);
                                }
                            }),
                            m('span.playlist-name', playlist.name),
                            m('span.playlist-count', ` (${playlist.list.length}首)`)
                        ]);
                    })
                )
        ])
    ];
}

function _renderMusicInfoContent(state) {
    // 现在 state 包含了传入的 name, singer, albumName 等
    return [
        m('h2.dialog-title', '信息'),
        m('div.dialog-body', { style: "user-select:text;" }, [
            m('div.playlist-item', [m('b.playlist-name', "名  称: "), state.name]),
            m('div.playlist-item', [m('b.playlist-name', "艺  人: "), state.singer]),
            m('div.playlist-item', [m('b.playlist-name', "专  辑: "), state.albumName]),
            m('div.playlist-item', [m('b.playlist-name', "来  源: "), state.source]),
            m('div.playlist-item', [m('b.playlist-name', "专辑ID: "), state.albumId]),
            m('div.playlist-item', [m('b.playlist-name', "歌曲ID: "), state.songmid])
        ])
    ];
}

function _renderPlayQueueContent(state, update) {
    const list = state.list || [];
    return [
        m('h2.dialog-title', '播放队列'),
        m('div.dialog-body',
            list.map((item, index) => {
                return m('div.playlist-item',
                    {
                        onclick: () => console.log("Play item:", item),
                        oncontextmenu: (event) => {
                            event.preventDefault();
                            if (confirm("Remove from queue?")) {
                                list.splice(index, 1);
                                update("list", [...list]);
                                m.redraw();
                            }
                        }
                    },
                    [m('b.playlist-name', item.name), " - ", item.singer]
                );
            })
        ),
        m('div.dialog-footer', [
            m('button.text-btn', {
                onclick: () => {
                    if (confirm("Clear the queue?")) {
                        state.list = [];
                        update("list", []);
                        m.redraw();
                    }
                }
            }, '清空'),
            m('button.text-btn', {
                onclick: () => onConfirm() // 隐藏并确认
            }, '隐藏')
        ])
    ];
}

function _togglePlaylist(playlistId, state, update) {
    if (state.selectedPlaylists.has(playlistId)) {
        state.selectedPlaylists.delete(playlistId);
    } else {
        state.selectedPlaylists.add(playlistId);
    }
    update("selectedPlaylists", state.selectedPlaylists);
    m.redraw();
}

function _getUpdatedPlaylists(internalState, playlists) {
    if (!playlists) return playlists;
    const updatedPlaylists = JSON.parse(JSON.stringify(playlists || {}));
    const { mp3, ...currentSong } = internalState.currentSong;

    Object.keys(updatedPlaylists).forEach(playlistId => {
        const playlist = updatedPlaylists[playlistId];
        const existingIndex = playlist.list.findIndex(song =>
            song.source === currentSong.source &&
            song.songmid === currentSong.songmid
        );

        const shouldExist = internalState.selectedPlaylists.has(playlistId);

        if (shouldExist && existingIndex === -1) {
            playlist.list.push(currentSong);
        } else if (!shouldExist && existingIndex !== -1) {
            playlist.list.splice(existingIndex, 1);
        }
    });

    return updatedPlaylists;
}

export function showDialog(options = {}) {
    dialogState.isVisible = true;
    dialogState.options = {
        onConfirm: () => { },
        onCancel: () => { },
        title: "",
        content: "", // 重置为函数
        ...options // 将传入的 options 合并到 dialogState.options
    };
    dialogState.internalState = {};

    // --- 根据 mode 设置 internalState 和 content 函数 ---
    if (options.mode === "addToPlaylist") {
        dialogState.options.title = "添加到播放列表";
        dialogState.internalState.currentSong = options.currentSong || {};
        dialogState.internalState.selectedPlaylists = new Set();

        if (options.playlists && dialogState.internalState.currentSong.source && dialogState.internalState.currentSong.songmid) {
            Object.keys(options.playlists).forEach(playlistId => {
                const playlist = options.playlists[playlistId];
                const exists = playlist.list.some(song =>
                    song.source === dialogState.internalState.currentSong.source &&
                    song.songmid === dialogState.internalState.currentSong.songmid
                );
                if (exists) {
                    dialogState.internalState.selectedPlaylists.add(playlistId);
                }
            });
        }
        dialogState.options.content = _renderAddToPlaylistContent;
    } else if (options.mode === "showMusicInfo") {
        dialogState.options.title = "信息";
        // --- 关键改动：将传入的音乐信息复制到 internalState ---
        dialogState.internalState = {
            ...options // 将 name, singer, albumName, source, albumId, songmid 等复制进去
        };
        dialogState.options.content = _renderMusicInfoContent;
    } else if (options.mode === "showPlayQueue") {
        dialogState.options.title = "播放队列";
        // --- 关键改动：将传入的队列列表复制到 internalState ---
        dialogState.internalState = {
            list: options.list || [] // 只复制 list，避免覆盖其他可能的属性
        };
        dialogState.options.content = _renderPlayQueueContent;
    } else {
        // 如果没有匹配的 mode，可以设置一个默认内容或保持 content 为空字符串
        dialogState.options.content = (state) => [m('h2.dialog-title', options.title || ""), m('div.dialog-body', options.content || "未知模式")];
    }

    return new Promise((resolve, reject) => {
        const originalOnConfirm = options.onConfirm;
        const originalOnCancel = options.onCancel;

        dialogState.options.onConfirm = (result) => {
            originalOnConfirm?.(result);
            resolve(result);
        };

        dialogState.options.onCancel = () => {
            originalOnCancel?.();
            resolve({ cancelled: true, result: null });
        };

        m.redraw();
    });
}

function onConfirm() {
    const result = { ...dialogState.internalState };
    if (dialogState.options.mode === "addToPlaylist") {
        result.updatedPlaylists = _getUpdatedPlaylists(dialogState.internalState, dialogState.options.playlists);
    }
    dialogState.options.onConfirm(result);
    _closeDialog();
}

function onCancel() {
    dialogState.options.onCancel();
    _closeDialog();
}

function _closeDialog() {
    dialogState.isVisible = false;
    dialogState.options = {};
    dialogState.internalState = {};
    m.redraw();
}

export const Dialog = {
    view(vnode) {
        if (!dialogState.isVisible) return null;

        const { title = "", content = "" } = dialogState.options;
        const { internalState } = dialogState;

        let contentVnode = null;
        if (typeof content === "function") {
            contentVnode = content(internalState, (key, value) => {
                dialogState.internalState[key] = value;
                m.redraw();
            });
        } else {
            contentVnode = [m('h2.dialog-title', title), m('div.dialog-body', content)];
        }

        return m("dialog", {
            oncreate: (vnode) => {
                if (dialogState.isVisible) {
                    vnode.dom.showModal();
                }
            },
            onupdate: (vnode) => {
                if (dialogState.isVisible) {
                    if (!vnode.dom.open) {
                         vnode.dom.showModal();
                    }
                } else {
                    if (vnode.dom.open) {
                         vnode.dom.close();
                    }
                }
            }
        }, [
            m('div.dialog-content', [
                contentVnode,

                dialogState.options.mode !== "showPlayQueue" && m('div.dialog-footer', [
                    m('button.text-btn.cancel', { onclick: () => onCancel() }, '取消'),
                    m('button.text-btn.confirm', { onclick: () => onConfirm() }, '确定')
                ])
            ])
        ]);
    }
};

export const show = showDialog;
export const hide = () => _closeDialog();

export default { Dialog, showDialog, show, hide };