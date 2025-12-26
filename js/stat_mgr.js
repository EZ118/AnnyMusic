/*
 * This script is for counting songs listened and generate 'popular songs', 'recently played', 'popular playlists' etc..
 */

import { PlayerView } from "./views/player.js";

class StatisticsManager {
    constructor() {
        // init
        this.data = getStorageSync("statisticData") || { songs: [], playlists: [] };
        this.defaultInterval = 5 * 60 * 1000;   // 记录间隔
        this.defaultPageSize = 9;               // 返回页大小

        // 每隔五分钟（约一首歌的时间）记录一次最近播放
        setInterval(() => this.updateStat(), this.defaultInterval);

        // 退出时保存
        window.addEventListener("beforeunload", (event) => {
            // 最后一次统计，并将最终统计结果保存到本地
            this.updateStat();
            this.saveStat();

            // 阻止关闭（显示阻止对话框）
            //event.preventDefault();
            //event.returnValue = "确认退出吗？您的播放队列、播放进度和缓存将失效。";
            //return event.returnValue;
        });
    }

    updateStat() {
        // 获取和刷新数据，并简单地处理

        // 处理最近音乐
        const key = song => `${song.source}-${song.songmid}`;

        const origKeys = new Set(this.data.songs.map(key));
        const newKeys = new Set(PlayerView.songQueue.map(key));

        // 交集
        const intersection = PlayerView.songQueue.filter(s => origKeys.has(key(s)));

        // 补集（并集 - 交集）
        const complement = [
            ...PlayerView.songQueue.filter(s => !origKeys.has(key(s))),
            ...this.data.songs.filter(s => !newKeys.has(key(s)))
        ];

        this.data.songs = [...intersection, ...complement].slice(0, this.defaultPageSize);

        this.data.songs = this.data.songs.map((item) => {
            const { noMp3, ...newItem } = item;
            return newItem;
        })

        console.log("[StatisticsManager.updateStat] Result:", this.data);
    }

    saveStat() {
        // 将数据保存
        setStorageSync("statisticData", this.data);
        console.log("[StatisticsManager.saveStat] Data saved.");
    }
}

const statMgr = new StatisticsManager();

export default statMgr;