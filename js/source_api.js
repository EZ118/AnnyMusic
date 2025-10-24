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
                                    "source": source,   // 音乐来源（平台）
                                    "id": card.id,      // 音乐ID
                                    "hash": "",         // 歌曲的Hash值
                                    "name": card.name,  // 音乐名称
                                    "album": card.album.name,   // 专辑名称
                                    "artist": card.artists[0].name ?? "",       // 艺术家
                                    "pic": card.album.artist.img1v1Url ?? "",   // 封面URL
                                    "vip": card.fee == 1    // 标记是否为VIP
                                }
                            } catch { }
                        });
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
                                    "source": source,   // 音乐来源（平台）
                                    "id": card.mid,     // 音乐ID
                                    "hash": "",         // 歌曲的Hash值
                                    "name": card.name,  // 音乐名称
                                    "album": card.album.name,   // 专辑名称
                                    "artist": card.singer[0].name,  // 艺术家
                                    "pic": `https://y.qq.com/music/photo_new/T002R300x300M000${card.album.mid}.jpg?max_age=2592000`,    // 封面URL
                                    "vip": (card.pay.pay_play == 1 || card.action.msgid != 0)     // 标记是否为VIP
                                };
                            } catch { }
                        });
                    });
            case 'kw':
                return httpFetch(`https://kuwo.cn/search/searchMusicBykeyWord?vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=40&all=${encodeURI(keyword)}`)
                    .then((res) => {
                        return res.body.abslist.map((card) => {
                            try {
                                return {
                                    "source": source,
                                    "id": card.MUSICRID.replace("MUSIC_", ""),
                                    "hash": "",
                                    "name": card.NAME,
                                    "album": card.ALBUM,
                                    "artist": card.ARTIST,
                                    "pic": "https://img2.kuwo.cn/star/albumcover/" + (card.web_albumpic_short || card.web_artistpic_short || card.MVPIC),
                                    "vip": card.tpay != 0
                                };
                            } catch { }
                        });
                    });
            case 'kg':
                return httpFetch(`https://songsearch.kugou.com/song_search_v2?platform=WebFilter&format=json&page=1&pagesize=30&keyword=${encodeURI(keyword)}`)
                    .then((res) => {
                        return res.body.data.lists.map((card) => {
                            try {
                                return {
                                    "source": source,
                                    "id": card.Audioid,
                                    "hash": card.FileHash,
                                    "name": card.SongName,
                                    "album": card.AlbumName,
                                    "artist": card.SingerName,
                                    "pic": card.Image.replace("{size}", "64"), // 网址的{size}部分是用数字表示正方形长宽
                                    "vip": card.SQPrivilege > 8
                                };
                            } catch { }
                        });
                    });
            default:
                return Promise.reject('不支持的源');
        }
    }

    const handleLyricResult = async (source, id) => {
        switch (source) {
            case 'wy':
                return httpFetch(`https://music.163.com/api/song/lyric?id=${id}&lv=-1&kv=-1&tv=-1`)
                    .then((res) => {
                        return res.body.lrc.lyric;
                    });
            case 'tx':
                return httpFetch(`https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?format=json&nobase64=1&songmid=${id}`)
                    .then((res) => {
                        return res.body.lyric || Promise.reject("暂无歌词");
                    });
            case 'kw':
                return httpFetch(`https://www.kuwo.cn/newh5/singles/songinfoandlrc?musicId=${id}&httpsStatus=1&plat=web_www&from=`)
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
                        return lrcStr;
                    });
            case 'kg':
                return httpFetch(`http://krcs.kugou.com/search?ver=1&man=yes&client=mobi&hash=${id}`)
                    .then((res) => {
                        const lrcId = res.body.candidates[0].id;
                        const lrcAccesskey = res.body.candidates[0].accesskey;
                        return httpFetch(`https://lyrics.kugou.com/download?ver=1&client=pc&id=${lrcId}&accesskey=${lrcAccesskey}&fmt=lrc&charset=utf8`);
                    })
                    .then((res2) => {
                        return decodeURIComponent(escape(atob(res2.body.content)));
                    })
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
                return handleLyricResult(source, info.musicInfo.songmid);
            default:
                return Promise.reject('不支持的事件名');
        }
    })

    send(EVENT_NAMES.inited, { status: true, openDevTools: false, sources: [] })
    console.log("内置搜索源已加载");
})();

function getLyricSource(key, callback) {
    if (key.source == "kg") {
        key.id = key.hash;
    }
    LxApi.emit(LxApi.EVENT_NAMES.request, {
        source: key.source,
        action: 'lyric',
        info: { musicInfo: { songmid: key.id } }
    }).then((lrc) => {
        callback(lrc);
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
        info: { type: quality, musicInfo: { songmid: key.id } }
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