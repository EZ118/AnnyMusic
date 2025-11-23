// 将默认搜索源 利用类似音源的API实现
(() => {
    const { EVENT_NAMES, request, on, send } = LxApi;

    const httpFetch = (url, options = { method: 'GET' }) => {
        return new Promise((resolve, reject) => {
            request(url, options, (err, resp) => {
                if (err) return reject(err)
                resolve(resp)
            })
        })
    }

    const handleSearchResult = async (source, keyword, pageNum) => {
        switch (source) {
            case 'wy':
                return httpFetch(`https://music.163.com/api/search/get?type=1&limit=40&s=${encodeURI(keyword)}`)
                    .then((res) => {
                        return res.body.result.songs.map((card) => {
                            try {
                                return {
                                    "albumId": card.album.id,
                                    "albumName": card.album.name,
                                    "img": card.album.artist.img1v1Url.includes("UleORITEDbvrOLV0Q8A==/5639395138885805") ? "" : card.album.artist.img1v1Url,
                                    "name": card.name,
                                    "singer": card.artists[0].name ?? "",
                                    "songmid": card.id,
                                    "source": source
                                }
                            } catch { }
                        });
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            case 'tx':
                return httpFetch("https://u.y.qq.com/cgi-bin/musicu.fcg", {
                    method: 'POST',
                    formData: JSON.stringify({
                        "comm": { "ct": "19", "cv": "1859", "uin": "0" },
                        "req": {
                            "method": "DoSearchForQQMusicDesktop", "module": "music.search.SearchCgiService",
                            "param": { "grp": 1, "num_per_page": 50, "page_num": 1, "query": keyword, "search_type": 0 }
                        }
                    })
                })
                    .then((res) => {
                        return res.body.req.data.body.song.list.map((card) => {
                            try {
                                return {
                                    "albumId": card.album.id,
                                    "albumMid": card.album.mid,
                                    "albumName": card.album.name,
                                    "name": card.name,
                                    "img": `https://y.qq.com/music/photo_new/T002R300x300M000${card.album.mid}.jpg?max_age=2592000`,
                                    "singer": card.singer[0].name,
                                    "songId": card.id,
                                    "songmid": card.mid,
                                    "source": source,
                                    "strMediaMid": card.mid
                                };
                            } catch { }
                        });
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            case 'kw':
                return httpFetch(`https://kuwo.cn/search/searchMusicBykeyWord?vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=40&all=${encodeURI(keyword)}`)
                    .then((res) => {
                        return res.body.abslist.map((card) => {
                            try {
                                return {
                                    "albumId": card.ALBUMID,
                                    "albumName": card.ALBUM,
                                    "img": "https://img2.kuwo.cn/star/albumcover/" + (card.web_albumpic_short || card.web_artistpic_short || card.MVPIC),
                                    "name": card.NAME,
                                    "singer": card.ARTIST,
                                    "songmid": card.MUSICRID.replace("MUSIC_", ""),
                                    "source": source
                                };
                            } catch { }
                        });
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            case 'kg':
                return httpFetch(`https://songsearch.kugou.com/song_search_v2?platform=WebFilter&format=json&page=1&pagesize=30&keyword=${encodeURI(keyword)}`)
                    .then((res) => {
                        return res.body.data.lists.map((card) => {
                            try {
                                return {
                                    "albumId": card.AlbumID,
                                    "albumName": card.AlbumName,
                                    "hash": card.FileHash,
                                    "img": card.Image.replace("{size}", "256"), // 网址的{size}部分是用数字表示正方形长宽
                                    "name": card.SongName,
                                    "singer": card.SingerName,
                                    "songmid": card.Audioid,
                                    "source": source
                                };
                            } catch { }
                        });
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            default:
                return Promise.reject('不支持的源');
        }
    }

    const handleLyricResult = async (source, info) => {
        switch (source) {
            case 'wy':
                return httpFetch(`https://music.163.com/api/song/lyric?id=${info.songmid}&os=pc&lv=-1&kv=-1&tv=-1&csrf_token=`)
                    .then((res) => {
                        if (!res.body.lrc.lyric) throw new Error("无歌词");
                        return {
                            lyric: res.body.lrc.lyric,
                            tlyric: null,
                            rlyric: null,
                            lxlyric: null
                        };
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            case 'tx':
                return httpFetch(`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?format=json&nobase64=1&songmid=${info.songmid}`)
                    .then((res) => {
                        if (!res.body.lyric) throw new Error("无歌词");
                        return {
                            lyric: res.body.lyric,
                            tlyric: null,
                            rlyric: null,
                            lxlyric: null
                        };
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            case 'kw':
                return httpFetch(`https://www.kuwo.cn/newh5/singles/songinfoandlrc?musicId=${info.songmid}&httpsStatus=1&plat=web_www&from=`)
                    .then((res) => {
                        var lrc = res.body.data.lrclist;
                        var lrcStr = "";

                        lrc.forEach((item) => {
                            var min = Math.floor(item.time / 60);
                            var sec = (item.time % 60).toFixed(2);

                            if (min < 10) { min = "0" + min; }
                            if (sec < 10) { sec = "0" + sec; }

                            lrcStr += `[${min}:${sec}] ${item.lineLyric}\n`;
                        });

                        if (!lrcStr) throw new Error("无歌词");
                        return {
                            lyric: lrcStr,
                            tlyric: null,
                            rlyric: null,
                            lxlyric: null
                        };
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            case 'kg':
                return httpFetch(`http://krcs.kugou.com/search?ver=1&man=yes&client=mobi&hash=${info.hash}`)
                    .then((res) => {
                        const lrcId = res.body.candidates[0].id;
                        const lrcAccesskey = res.body.candidates[0].accesskey;
                        return httpFetch(`https://lyrics.kugou.com/download?ver=1&client=pc&id=${lrcId}&accesskey=${lrcAccesskey}&fmt=lrc&charset=utf8`);
                    })
                    .then((res2) => {
                        const lrc = decodeURIComponent(escape(atob(res2.body.content)));
                        if (!lrc) throw new Error("无歌词");
                        return {
                            lyric: lrc,
                            tlyric: null,
                            rlyric: null,
                            lxlyric: null
                        };
                    }).catch(error => {
                        return Promise.reject(error);
                    });
            default:
                return Promise.reject('不支持的源');
        }
    }

    on(EVENT_NAMES.request, ({ action, source, info }) => {
        switch (action) {
            case 'search':
                // source: 平台名称（如wy、kg）
                // info: { page: 1, keyword: '关键字' }
                if (!info.page || !info.page < 1 || info.page % 1 != 0) {
                    // 如果不存在页码、页码小于1或者不是整数，则将页码设置为1
                    info.page = 1;
                }
                return handleSearchResult(source, info.keyword, info.page);
            case 'lyric':
                return handleLyricResult(source, info.musicInfo);
            default:
                return Promise.reject('不支持的事件名（内置搜索源，请忽略该消息）');
        }
    })

    send(EVENT_NAMES.inited, { status: true, openDevTools: false, sources: [] })
    console.log("内置搜索源已加载");
})();

function getLyricSource(key, callback) {
    LxApi.emit(LxApi.EVENT_NAMES.request, {
        source: key.source,
        action: 'lyric',
        info: { musicInfo: key }
    }).then((lrc) => {
        callback(lrc.lyric);
    }).catch((error) => {
        console.error('[getMusicSource] 音乐歌词获取失败:', error);
        callback(null);
    });
}

function getSearchResult(q, platform, callback) {
    LxApi.emit(LxApi.EVENT_NAMES.request, {
        source: platform,
        action: "search",
        info: { page: 1, keyword: q }
    }).then((data) => {
        callback(data)
    }).catch((error) => {
        console.error('[getSearchResult] 搜索结果获取失败:', error);
        callback([]);
    });
}

function getMusicSource(key, quality, callback) {
    LxApi.emit(LxApi.EVENT_NAMES.request, {
        source: key.source,
        action: 'musicUrl',
        info: { type: quality, musicInfo: {...key, type: quality} }
    }).then((url) => {
        key.mp3 = url;
        callback(key);
    }).catch((error) => {
        console.error('[getMusicSource] 音乐链接获取失败:', error);
        callback(null);
    });
}

function getMusicSourcePromise(url, playQuality) {
    return new Promise((resolve) => {
        getMusicSource(url, playQuality, (key) => {
            resolve(key);
        });
    });
}