import { PlayerView } from "./player.js";

// ============================================
// 1. 状态管理 - 简化的响应式状态
// ============================================
class DialogState {
    constructor() {
        this.isVisible = false;
        this.config = null;
        this.data = {};
    }

    show(config) {
        this.isVisible = true;
        this.config = config;
        this.data = config.initialData || {};
        m.redraw();
    }

    hide() {
        this.isVisible = false;
        this.config = null;
        this.data = {};
        m.redraw();
    }

    updateData(key, value) {
        this.data[key] = value;
        m.redraw();
    }
}

const dialogState = new DialogState();

// ============================================
// 2. Dialog 内容组件 - 分离关注点
// ============================================

// 添加到播放列表组件
const AddToPlaylistContent = {
    oninit(vnode) {
        const { currentSong, playlists } = vnode.attrs.data;

        // 初始化选中状态
        const selectedPlaylists = new Set();
        if (playlists && currentSong?.source && currentSong?.songmid) {
            Object.keys(playlists).forEach(playlistId => {
                const playlist = playlists[playlistId];
                const exists = playlist.list.some(song =>
                    song.source === currentSong.source &&
                    song.songmid === currentSong.songmid
                );
                if (exists) selectedPlaylists.add(playlistId);
            });
        }

        dialogState.updateData('selectedPlaylists', selectedPlaylists);
    },

    view(vnode) {
        const { playlists } = vnode.attrs.data;
        const selectedPlaylists = dialogState.data.selectedPlaylists || new Set();
        const playlistIds = Object.keys(playlists || {});

        const togglePlaylist = (playlistId) => {
            const newSelected = new Set(selectedPlaylists);
            if (newSelected.has(playlistId)) {
                newSelected.delete(playlistId);
            } else {
                newSelected.add(playlistId);
            }
            dialogState.updateData('selectedPlaylists', newSelected);
        };

        return [
            m('h2.dialog-title', '添加到播放列表'),
            m('div.dialog-body', [
                playlistIds.length === 0
                    ? m('p.empty-message', '暂无播放列表')
                    : m('div.playlist-list',
                        playlistIds.map(playlistId => {
                            const playlist = playlists[playlistId];
                            const isSelected = selectedPlaylists.has(playlistId);
                            return m('div.playlist-item', {
                                className: isSelected ? 'selected' : '',
                                onclick: () => togglePlaylist(playlistId)
                            }, [
                                m('input[type=checkbox]', {
                                    checked: isSelected,
                                    onclick: (e) => {
                                        e.stopPropagation();
                                        togglePlaylist(playlistId);
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
};

// 音乐信息组件
const MusicInfoContent = {
    view(vnode) {
        const { name, singer, albumName, source, albumId, songmid } = vnode.attrs.data;

        return [
            m('h2.dialog-title', '信息'),
            m('div.dialog-body', { style: "user-select:text;" }, [
                m('div.playlist-item', [m('b.playlist-name', "名  称: "), name]),
                m('div.playlist-item', [m('b.playlist-name', "艺  人: "), singer]),
                m('div.playlist-item', [m('b.playlist-name', "专  辑: "), albumName]),
                m('div.playlist-item', [m('b.playlist-name', "来  源: "), source]),
                m('div.playlist-item', [m('b.playlist-name', "专辑ID: "), albumId]),
                m('div.playlist-item', [m('b.playlist-name', "歌曲ID: "), songmid])
            ])
        ];
    }
};

// 播放队列组件
// 播放队列组件
const PlayQueueContent = {
    view(vnode) {
        const list = dialogState.data.list || [];
        const { onItemClick } = vnode.attrs;

        const removeItem = (index) => {
            if (confirm("Remove from queue?")) {
                const newList = [...list];
                newList.splice(index, 1);
                dialogState.updateData('list', newList);
            }
        };

        const clearQueue = () => {
            if (confirm("Clear the queue?")) {
                dialogState.updateData('list', []);
            }
        };

        return [
            m('h2.dialog-title', '播放队列'),
            m('div.dialog-body', { onclick: onItemClick },
                list.map((item, index) =>
                    m('div.playlist-item', {
                        onclick: () => {
                            PlayerView.play(item)
                        },
                        oncontextmenu: (e) => {
                            e.preventDefault();
                            removeItem(index);
                        }
                    }, [
                        m('b.playlist-name', item.name),
                        " - ",
                        item.singer
                    ])
                )
            ),
            m('div.dialog-footer', [
                m('button.text-btn', { onclick: clearQueue }, '清空'),
                m('button.text-btn', {
                    onclick: () => {
                        // 从 dialogState.config 中获取 onConfirm
                        const { onConfirm } = dialogState.config;
                        if (onConfirm) {
                            onConfirm({ list: dialogState.data.list });
                        }
                        dialogState.hide();
                    }
                }, '隐藏')
            ])
        ];
    }
};

// ============================================
// 3. Dialog 容器组件
// ============================================
export const Dialog = {
    view() {
        if (!dialogState.isVisible || !dialogState.config) return null;

        const { type, data, onConfirm, onCancel, showFooter = true } = dialogState.config;

        // 根据类型选择内容组件
        const ContentComponent = {
            'addToPlaylist': AddToPlaylistContent,
            'musicInfo': MusicInfoContent,
            'playQueue': PlayQueueContent
        }[type];

        if (!ContentComponent) {
            console.error(`Unknown dialog type: ${type}`);
            return null;
        }

        const handleConfirm = () => {
            const result = { ...dialogState.data };

            // 特殊处理：添加到播放列表
            if (type === 'addToPlaylist') {
                result.updatedPlaylists = getUpdatedPlaylists(
                    dialogState.data,
                    data
                );
            }

            onConfirm?.(result);
            dialogState.hide();
        };

        const handleCancel = () => {
            onCancel?.();
            dialogState.hide();
        };

        return m("dialog", {
            oncreate: (vnode) => {
                vnode.dom.showModal();
            },
            onupdate: (vnode) => {
                if (dialogState.isVisible && !vnode.dom.open) {
                    vnode.dom.showModal();
                } else if (!dialogState.isVisible && vnode.dom.open) {
                    vnode.dom.close();
                }
            }
        },
            m('div.dialog-content', [
                m(ContentComponent, {
                    data,
                    onItemClick: dialogState.config.onItemClick
                }),
                showFooter && m('div.dialog-footer', [
                    m('button.text-btn.cancel', { onclick: handleCancel }, '取消'),
                    m('button.text-btn.confirm', { onclick: handleConfirm }, '确定')
                ])
            ])
        );
    }
};

// ============================================
// 4. 工具函数
// ============================================
function getUpdatedPlaylists(internalState, configData) {
    const { playlists, currentSong } = configData;
    if (!playlists) return playlists;

    const updatedPlaylists = JSON.parse(JSON.stringify(playlists));
    const { mp3, ...songData } = currentSong;
    const selectedPlaylists = internalState.selectedPlaylists || new Set();

    Object.keys(updatedPlaylists).forEach(playlistId => {
        const playlist = updatedPlaylists[playlistId];
        const existingIndex = playlist.list.findIndex(song =>
            song.source === songData.source &&
            song.songmid === songData.songmid
        );

        const shouldExist = selectedPlaylists.has(playlistId);

        if (shouldExist && existingIndex === -1) {
            playlist.list.push(songData);
        } else if (!shouldExist && existingIndex !== -1) {
            playlist.list.splice(existingIndex, 1);
        }
    });

    return updatedPlaylists;
}

// ============================================
// 5. 公共 API
// ============================================

// 添加到播放列表
export function showAddToPlaylistDialog(currentSong, playlists) {
    return new Promise((resolve) => {
        dialogState.show({
            type: 'addToPlaylist',
            data: { currentSong, playlists },
            initialData: {},
            onConfirm: resolve,
            onCancel: () => resolve({ cancelled: true })
        });
    });
}

// 显示音乐信息
export function showMusicInfoDialog(musicInfo) {
    return new Promise((resolve) => {
        dialogState.show({
            type: 'musicInfo',
            data: musicInfo,
            onConfirm: resolve,
            onCancel: () => resolve({ cancelled: true })
        });
    });
}

// 显示播放队列
export function showPlayQueueDialog(list, onItemClick) {
    return new Promise((resolve) => {
        dialogState.show({
            type: 'playQueue',
            data: {},
            initialData: { list },
            showFooter: false,
            onItemClick,
            onConfirm: resolve,
            onCancel: () => resolve({ cancelled: true })
        });
    });
}

// 通用接口（向后兼容）
export function showDialog(options = {}) {
    const { mode, ...rest } = options;

    const typeMap = {
        'addToPlaylist': 'addToPlaylist',
        'showMusicInfo': 'musicInfo',
        'showPlayQueue': 'playQueue'
    };

    return new Promise((resolve) => {
        dialogState.show({
            type: typeMap[mode] || mode,
            data: rest,
            initialData: rest,
            onConfirm: (result) => {
                options.onConfirm?.(result);
                resolve(result);
            },
            onCancel: () => {
                options.onCancel?.();
                resolve({ cancelled: true, result: null });
            },
            onItemClick: options.onClick,
            showFooter: mode !== 'showPlayQueue'
        });
    });
}

export const show = showDialog;
export const hide = () => dialogState.hide();

export default {
    Dialog,
    showDialog,
    showAddToPlaylistDialog,
    showMusicInfoDialog,
    showPlayQueueDialog,
    show,
    hide
};