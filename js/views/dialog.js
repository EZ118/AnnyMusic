const Dialog = {
    oninit() {
        Dialog.submitFlag = 0;  // 0：用户未选择；1：用户选择并确认；2：用户放弃选择
        Dialog.mode = "";       // 对话框内容（展示收藏选择等等）
        Dialog.options = {};    // 存储传入的选项
        Dialog.ele = document.querySelector('dialog');
        Dialog.selectedPlaylists = new Set(); // 存储用户选择的播放列表ID
        Dialog.currentSong = null; // 当前歌曲信息
    },
    
    show(mode, options = {}) {
        Dialog.submitFlag = 0;
        Dialog.mode = mode;
        Dialog.options = options;
        
        // 如果是添加到播放列表模式，初始化选中状态
        if (mode === "addToPlaylist") {
            Dialog.currentSong = options.currentSong || {};
            Dialog.selectedPlaylists = new Set();
            
            // 查找当前歌曲已在哪些播放列表中
            if (options.playlists && Dialog.currentSong.source && Dialog.currentSong.songmid) {
                Object.keys(options.playlists).forEach(playlistId => {
                    const playlist = options.playlists[playlistId];
                    const exists = playlist.list.some(song => 
                        song.source === Dialog.currentSong.source && 
                        song.songmid === Dialog.currentSong.songmid
                    );
                    if (exists) {
                        Dialog.selectedPlaylists.add(playlistId);
                    }
                });
            }
        }
        
        Dialog.ele.showModal();
        m.redraw();
        
        return new Promise((resolve, reject) => {
            const closeHandler = () => {
                Dialog.ele.removeEventListener("close", closeHandler);
                
                if (Dialog.submitFlag === 1) {
                    // 用户确认提交
                    if (Dialog.mode === "addToPlaylist") {
                        const updatedPlaylists = Dialog._getUpdatedPlaylists();
                        resolve(updatedPlaylists);
                    } else {
                        resolve(Dialog.ele.returnValue);
                    }
                } else {
                    // 用户取消或关闭
                    if (Dialog.mode === "addToPlaylist") {
                        const updatedPlaylists = Dialog._getUpdatedPlaylists();
                        reject(updatedPlaylists);
                    } else {
                        reject(Dialog.ele.returnValue);
                    }
                }
                
                Dialog.mode = "";
                Dialog.options = {};
                m.redraw();
            };
            
            Dialog.ele.addEventListener("close", closeHandler);
        });
    },
    
    // 获取更新后的播放列表
    _getUpdatedPlaylists() {
        const playlists = JSON.parse(JSON.stringify(Dialog.options.playlists || {}));
        const currentSong = Dialog.currentSong;
        
        Object.keys(playlists).forEach(playlistId => {
            const playlist = playlists[playlistId];
            const existingIndex = playlist.list.findIndex(song => 
                song.source === currentSong.source && 
                song.songmid === currentSong.songmid
            );
            
            const shouldExist = Dialog.selectedPlaylists.has(playlistId);
            
            if (shouldExist && existingIndex === -1) {
                // 需要添加但不存在，添加歌曲
                playlist.list.push(currentSong);
            } else if (!shouldExist && existingIndex !== -1) {
                // 不需要但存在，删除歌曲
                playlist.list.splice(existingIndex, 1);
            }
        });
        
        return playlists;
    },
    
    // 切换播放列表选中状态
    togglePlaylist(playlistId) {
        if (Dialog.selectedPlaylists.has(playlistId)) {
            Dialog.selectedPlaylists.delete(playlistId);
        } else {
            Dialog.selectedPlaylists.add(playlistId);
        }
        m.redraw();
    },
    
    // 确认提交
    confirm() {
        Dialog.submitFlag = 1;
        Dialog.ele.close("confirmed");
    },
    
    // 取消
    cancel() {
        Dialog.submitFlag = 2;
        Dialog.ele.close();
    },
    
    view(vnode) {
        if (!Dialog.mode) return [];
        
        // 关键修改：返回 dialog 元素并包含内容
        return Dialog._renderContent();
    },
    
    _renderContent() {
        if (Dialog.mode === "addToPlaylist") {
            return Dialog._renderAddToPlaylist();
        }
        return m('div', '未知的对话框模式');
    },
    
    _renderAddToPlaylist() {
        const playlists = Dialog.options.playlists || {};
        const playlistIds = Object.keys(playlists);
        
        return m('div.dialog-content', [
            m('h2.dialog-title', '添加到播放列表'),
            
            m('div.dialog-body', [
                playlistIds.length === 0 
                    ? m('p.empty-message', '暂无播放列表')
                    : m('div.playlist-list', 
                        playlistIds.map(playlistId => {
                            const playlist = playlists[playlistId];
                            const isSelected = Dialog.selectedPlaylists.has(playlistId);
                            
                            return m('div.playlist-item', {
                                class: isSelected ? 'selected' : '',
                                onclick: () => Dialog.togglePlaylist(playlistId)
                            }, [
                                m('input[type=checkbox]', { 
                                    checked: isSelected,
                                    onclick: (e) => {
                                        e.stopPropagation(); // 改用 onclick
                                    }
                                }),
                                m('span.playlist-name', playlist.name),
                                m('span.playlist-count', ` (${playlist.list.length}首)`)
                            ]);
                        })
                    )
            ]),
            
            m('div.dialog-footer', [
                m('button.text-btn', {
                    onclick: () => Dialog.cancel()
                }, '取消'),
                m('button.text-btn', {
                    onclick: () => Dialog.confirm()
                }, '确定')
            ])
        ]);
    }
};