var netease = {
    getSearchResult: function (keyword, callback) {
        $.get("https://music.163.com/api/search/get?type=1&limit=40&s=" + encodeURI(keyword), function(res) {
            var reqData = JSON.parse(res);
            var newData = [];

            $.each(reqData.result.songs, function(i, card) {
                try {
                    if (card.fee == 1) { card.fee = true; } else { card.fee = false; } /* 判断VIP歌曲 */

                    newData.push({
                        "id": card.id,
                        "name": card.name,
                        "artist": card.artists[0].name ?? "",
                        "source": "netease",
                        "cover": card.album.artist.img1v1Url ?? "",
                        "mp3": "",
                        "vip": card.fee
                    });
                } catch (e) {
                    console.log("ERR: 列表有一项加载失败")
                }
            });

            callback(newData);
        });
    },
    getMusicSource: function (id, quality, callback) {
        LxApi.emit(LxApi.EVENT_NAMES.request, {
            source: 'wy',
            action: 'musicUrl',
            info: { type: quality, musicInfo: { songmid: id } }
        }).then((url) => {
            callback(url)
        });
    },
    getLyricSource: function (id, callback) {
        $.get("https://music.163.com/api/song/lyric?id=" + id + "&lv=-1&kv=-1&tv=-1", function(res) {
            var reqData = JSON.parse(res);
            callback(reqData.lrc.lyric);
        }, function() {
            callback("暂无");
        });
    }
}

var qq = {
    getSearchResult: function (keyword, callback) {
        const queryData = JSON.stringify({
            "comm":{"ct":"19","cv":"1859","uin":"0"},
            "req":{
                "method":"DoSearchForQQMusicDesktop","module":"music.search.SearchCgiService",
                "param":{"grp":1,"num_per_page":50,"page_num":1,"query":keyword,"search_type":0}
            }
        })
        $.post("https://u.y.qq.com/cgi-bin/musicu.fcg", queryData, function(res) {
            var reqData = res;
            reqData = reqData.req.data.body.song;
            var newData = [];
            
            $.each(reqData.list, function(i, card) {
                try {
                    // 国外服务器无法用card.pay.pay_play判断是否为VIP歌曲 需要借助card.action.msgid判断。如果VIP判断出现问题，请在此修改
                    if (card.pay.pay_play == 1 || card.action.msgid != 0) { card.vip = true; } else { card.vip = false; } /* 判断VIP歌曲 */

                    newData.push({
                        "id": card.mid,
                        "name": card.name,
                        "artist": card.singer[0].name,
                        "source": "qq",
                        "cover": `https://y.qq.com/music/photo_new/T002R300x300M000${card.album.mid}.jpg?max_age=2592000`,
                        "mp3": "",
                        "vip": card.vip
                    });
                } catch (e) {
                    console.log("ERR: 列表有一项加载失败")
                }
            });
            callback(newData);
        }, 'json');
    },
    getMusicSource: function (id, quality, callback) {
        LxApi.emit(LxApi.EVENT_NAMES.request, {
            source: 'tx',
            action: 'musicUrl',
            info: { type: quality, musicInfo: { songmid: id } }
        }).then((url) => {
            callback(url)
        });
    },
    getLyricSource: function (id, callback) {
        /*
        由于功能需要，该api的对接使用了  https://www.toolscat.com/dev/postman  后端请求接口代理实现
        QQ官方接口有Referer判断，而uniapp不能修改关键的header
        */
        $.get('https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?format=json&nobase64=1&songmid=' + id, function(res) {
            callback(JSON.parse(res).lyric);
        }, function() {
            callback("暂无");
        });
    }
}

var kuwo = {
    getSearchResult: function (keyword, callback) {
        $.get("https://kuwo.cn/search/searchMusicBykeyWord?vipver=1&client=kt&ft=music&cluster=0&strategy=2012&encoding=utf8&rformat=json&mobi=1&issubtitle=1&show_copyright_off=1&pn=0&rn=40&all=" + encodeURI(keyword), function(res) {
            let reqData = JSON.parse(res);
            let newData = [];

            $.each(reqData.abslist, function(i, card) {
                if (card.tpay != 0) { card.tpay = true; } else { card.tpay = false; } /* 判断VIP歌曲 */

                newData.push({
                    "id": card.MUSICRID.replace("MUSIC_", ""),
                    "name": card.NAME,
                    "artist": card.ARTIST,
                    "source": "kuwo",
                    "cover": "https://img2.kuwo.cn/star/albumcover/" + (card.web_albumpic_short || card.web_artistpic_short || card.MVPIC),
                    "mp3": "",
                    "vip": card.tpay ? true : false
                });
            });
            callback(newData);
        });
    },
    getMusicSource: function (id, quality, callback) {
        LxApi.emit(LxApi.EVENT_NAMES.request, {
            source: 'kw',
            action: 'musicUrl',
            info: { type: quality, musicInfo: { songmid: id } }
        }).then((url) => {
            callback(url)
        });
    },
    getLyricSource: function (id, callback) {
        $.get(`https://m.kuwo.cn/newh5/singles/songinfoandlrc?musicId=${id}&httpsStatus=1&plat=web_www&from=`, function(res) {
            var reqData = JSON.parse(res);
            var lrc = reqData.data.lrclist;
            var lrcStr = "";

            /* 由于酷我的歌词格式不是lrc，所以需要转换（代码中将时间设置为保留2位小数） */
            $.each(lrc, function(i, item) {
                var min = Math.floor(item.time / 60);
                var sec = (item.time % 60).toFixed(2);

                if (min < 10) { min = "0" + min; }
                if (sec < 10) { sec = "0" + sec; }

                lrcStr += `[${min}:sec] ${item.lineLyric}\n`;
            });
            callback(lrcStr);
        }, function() {
            callback("暂无");
        });
    }
}

var kugou = {
    getSearchResult: function (keyword, callback) {
        $.get("https://mobilecdn.kugou.com/api/v3/search/song?format=json&page=1&pagesize=30&showtype=1&keyword=" + encodeURI(keyword), function(res) {
            var reqData = JSON.parse(res);
            var newData = [];

            $.each(reqData.data.info, function(i, card) {
                try {
                    if (card.privilege > 8) { card.privilege = true; } else { card.privilege = false; } /* 判断VIP歌曲 */

                    newData.push({
                        "id": card.hash,
                        "name": card.songname,
                        "artist": card.singername,
                        "source": "kugou",
                        "cover": "",
                        "mp3": "",
                        "vip": card.privilege
                    });
                } catch (e) {
                    console.log("ERR: 列表有一项加载失败")
                }
            });

            callback(newData);
        });
    },
    getMusicSource: function (id, quality, callback) {
        LxApi.emit(LxApi.EVENT_NAMES.request, {
            source: 'kg',
            action: 'musicUrl',
            info: { type: quality, musicInfo: { songmid: id } }
        }).then((url) => {
            callback(url)
        });
    },
    getLyricSource: function (id, callback) {
        /* 先请求获取音乐albumid和hash */
        $.get(`http://krcs.kugou.com/search?ver=1&man=yes&client=mobi&hash=${id}`, function(res) {
            var reqData = res;
            const lrcId = reqData.candidates[0].id;
            const lrcAccesskey = reqData.candidates[0].accesskey;

            /* 通过请求结果，获取歌词 */
            $.get(`https://lyrics.kugou.com/download?ver=1&client=pc&id=${lrcId}&accesskey=${lrcAccesskey}&fmt=lrc&charset=utf8`, function(res2) {
                const lrc = decodeURIComponent(escape(atob(res2.content)))
                callback(lrc);
            });
        });
    }
}




/* ===== 聚合调用 ===== */
function getLyricSource(key, func) {
    switch (key.source) {
        case "kuwo":
            kuwo.getLyricSource(key.id, (lrc) => {
                func(lrc);
            });
            break;
        case "qq":
            qq.getLyricSource(key.id, (lrc) => {
                func(lrc);
            });
            break;
        case "kugou":
            kugou.getLyricSource(key.id, (lrc) => {
                func(lrc);
            });
            break;
        case "netease":
            netease.getLyricSource(key.id, (lrc) => {
                func(lrc);
            });
            break;
        default:
            console.log("ERR: 未知的播放源");
    }
}

function getSearchResult(q, platform, func) {
    switch (platform) {
        case "kuwo":
            kuwo.getSearchResult(q, (res) => {
                func(res)
            });
            break;
        case "qq":
            qq.getSearchResult(q, (res) => {
                func(res)
            });
            break;
        case "kugou":
            kugou.getSearchResult(q, (res) => {
                func(res)
            });
            break;
        case "netease":
            netease.getSearchResult(q, (res) => {
                func(res)
            });
            break;
        default:
            console.log("ERR: 未知的播放源");
    }
}

function getMusicSource(key, quality, func) {
    switch (key.source) {
        case "kuwo":
            kuwo.getMusicSource(key.id, quality, (result) => {
                key.mp3 = result;
                func(key);
            });
            break;
        case "qq":
            qq.getMusicSource(key.id, quality, (result) => {
                key.mp3 = result;
                func(key);
            });
            break;
        case "kugou":
            kugou.getMusicSource(key.id, quality, (result) => {
                key.mp3 = result;
                func(key);
            });
            break;
        case "netease":
            netease.getMusicSource(key.id, quality, (result) => {
                key.mp3 = result;
                func(key);
            });
            break;
        default:
            console.log("ERR: 未知的播放源");
    }
}

function getMusicSourcePromise(url, playQuality) {
    return new Promise((resolve) => {
        getMusicSource(url, playQuality, (key) => {
            resolve(key);
        });
    });
}