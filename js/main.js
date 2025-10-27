import NavView from "./views/navbar.js";
import HomeView from "./views/home.js";
import PlaylistView from "./views/playlist.js";
import SearchView from "./views/search.js";
import SettingsView from "./views/settings.js";

document.addEventListener('touchstart', function (event) {
    // 禁止缩放
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

document.addEventListener('DOMContentLoaded', () => {
    /* 渲染导航栏 */
    m.mount(document.querySelector("nav"), NavView);

    /* 渲染播放器 */
    m.mount(document.querySelector("footer"), PlayerView);
    m.mount(document.querySelector("#lyric_view"), LyricView);

    /* 创建路由 */
    m.route(document.querySelector("main"), "/home", {
        "/home": HomeView,
        "/playlist": PlaylistView,
        "/search": SearchView,
        "/settings": SettingsView
    })

    // PlayerView.play({
    //     src: "https://music.163.com/song/media/outer/url?id=138412.mp3",
    //     name: "默认歌曲",
    //     artist: "默认艺术家",
    //     cover: "https://picsum.photos/200/300"
    // })

	/* 执行播放源 */
	const externalMusicSource = getStorageSync("externalMusicSource") || [];
    externalMusicSource.forEach(item => {
        const interpreter = new Sval({
            ecmaVer: 'latest',
            sourceType: 'script',
            sandBox: true,
        });

		const boundSetTimeout = window.setTimeout.bind(window);
		const boundSetInterval = window.setInterval.bind(window);
        
        interpreter.import({
			lx: {...LxApi, currentScriptInfo: item},
			setTimeout: boundSetTimeout,
			setInterval: boundSetInterval,
		});
        interpreter.run(item.rawScript);
    });

	/* 恢复console */
	setTimeout(() => {
		const iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		document.body.appendChild(iframe);
		
		// 从 iframe 中获取原始的 console
		const originalConsole = iframe.contentWindow.console;
		
		// 恢复所有 console 方法
		window.console = {
			log: originalConsole.log.bind(originalConsole),
			warn: originalConsole.warn.bind(originalConsole),
			error: originalConsole.error.bind(originalConsole),
			info: originalConsole.info.bind(originalConsole),
			debug: originalConsole.debug.bind(originalConsole),
			trace: originalConsole.trace.bind(originalConsole),
			table: originalConsole.table.bind(originalConsole),
			clear: originalConsole.clear.bind(originalConsole),
			assert: originalConsole.assert.bind(originalConsole),
			count: originalConsole.count.bind(originalConsole),
			countReset: originalConsole.countReset.bind(originalConsole),
			group: originalConsole.group.bind(originalConsole),
			groupCollapsed: originalConsole.groupCollapsed.bind(originalConsole),
			groupEnd: originalConsole.groupEnd.bind(originalConsole),
			time: originalConsole.time.bind(originalConsole),
			timeEnd: originalConsole.timeEnd.bind(originalConsole),
			timeLog: originalConsole.timeLog.bind(originalConsole),
			dir: originalConsole.dir.bind(originalConsole),
			dirxml: originalConsole.dirxml.bind(originalConsole)
		};
		
		console.log('✅ Console 已恢复！');
	}, 500);
});




/*


        */

const uni = {
	showToast: function (str) {
		try {
			if (typeof (window.via) == "object") { window.via.toast(str.title); }
			else if (typeof (window.mbrowser) == "object") { window.mbrowser.showToast(str.title); }
			else { alert(str.title); }
		} catch {
			alert(str.title);
		}
	},
	showModal: function (options) {
		if (options.confirmText) {
			var tt = confirm(`【${options.title}】\n${options.content}`);
			if (tt) {
				options.success({ "cancel": false, "confirm": true });
			} else {
				options.success({ "cancel": true, "confirm": false });
			}
		} else {
            alert(`【${options.title}】\n${options.content}`);
		}
		console.log(options);
	},

	/* STORAGE */
	setStorageSync: function (key, val) {
		localStorage.setItem(key, val);
	},
	getStorageSync: function (key) {
		return localStorage.getItem(key);
	},

	/* CLIPBOARD */
	getClipboardData: async function (options) {
		const clipboardObj = navigator.clipboard;
		try {
			const text = await navigator.clipboard.readText();
			options.success({ "data": text }); // 直接传递text
		} catch (err) {
			options.fail(err); // 直接传递错误
		}
	},
	setClipboardData: async function (options) {
		const clipboardObj = navigator.clipboard;
		try {
			await navigator.clipboard.writeText(options.data);
			options.success({ "data": options.data }); // 直接传递data
		} catch (err) {
			options.fail(err); // 直接传递错误
		}
	}
};


// PetiteVue.createApp({
//     /* 图标 */
//     ICON,

//     /* 加载球 */
//     isLoading: false,

//     /* 侧面栏、路由控制 */
//     navbarItems: [
//         { param: 'player', name: '播放器', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg>' },
//         { param: 'search', name: '搜索页', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"></path></svg>' },
//         { param: 'collection', name: '收藏夹', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"></path></svg>' },
//         { param: 'settings', name: '设置项', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"></path></svg>' }
//     ],
//     currentPageView: 'search',

//     /* 搜索页全局变量 */
//     currentSearchWord: '',
//     currentSearchPlatform: 'netease',
//     currentSearchResult: [],

//     /* 播放器全局变量 */
//     currentPlayInfo: {
//         "id": "default",
//         "name": "未播放歌曲",
//         "artist": "未知艺术家",
//         "source": "未知来源",
//         "cover": "./img/default_cover.svg",
//         "mp3": "./img/default_audio.mp3",
//         "vip": false
//     },
//     showLyricFlag: false,
//     showPlayListFlag: false,
//     currentLyric: '',
//     currentLyric_Original: '',
//     playQuality: "128k",

//     /* 收藏夹全局变量 */
//     collectionList: [],
//     collectionRefresherText: '',
//     playList: [],
    
//     /* 设置项全局变量 */
//     sourceList: [],


//     /* 侧边栏 */
//     switchNav(item) {
//         this.currentPageView = item.param;
//     },

//     /* 搜索页 */
//     doSearch() {
//         if (!this.currentSearchWord) { this.currentSearchResult = []; return; }

//         this.isLoading = true;

//         getSearchResult(this.currentSearchWord, this.currentSearchPlatform, (res) => {
//             this.currentSearchResult = res;
//             this.isLoading = false;
//         });
//     },

//     /* 播放器 */
//     playMusic(item, from) {
//         this.isLoading = true;

//         this.currentPageView = 'player';
        
//         // 深拷贝当前播放的歌曲信息，避免引用污染
//         const playItem = JSON.parse(JSON.stringify(item));
//         this.currentPlayInfo = playItem;

//         if (from == "collection") {
//             // 从收藏夹播放：创建收藏夹的副本，而不是直接引用
//             console.log("从收藏夹播放，使用收藏夹列表副本");
//             this.playList = JSON.parse(JSON.stringify(this.collectionList));
//             this.isLoading = false;
//             return;
//         } else if (from == "playlist" || jsonContains(this.playList, this.currentPlayInfo)) {
//             // 如果当前播放列表中已存在该歌曲，则不重复添加
//             console.log("当前播放列表中已存在该歌曲，跳过添加");
//             this.isLoading = false;
//             return;
//         } else {
//             getMusicSource(playItem, this.playQuality, (res) => {
//                 // 深拷贝结果
//                 const result = JSON.parse(JSON.stringify(res));
//                 this.currentPlayInfo = result;
//                 this.isLoading = false;

//                 // 播放列表添加副本
//                 this.playList.push(result);

//                 console.log("当前播放列表：", this.playList);
//             });
//         }
//     },
//     prevSong() {
//         if (this.playList.length == 0) { return; }

//         let currentIndex = this.playList.findIndex(item => item.id === this.currentPlayInfo.id);
//         if (currentIndex <= 0) {
//             currentIndex = this.playList.length; // 如果当前歌曲不存在于列表中或是第一首，则重置为最后一首
//         }
//         this.playMusic(this.playList[currentIndex - 1], "playlist");
//     },
//     nextSong() {
//         if (this.playList.length == 0) { return; }

//         let currentIndex = this.playList.findIndex(item => item.id === this.currentPlayInfo.id);
//         if (currentIndex < 0 || currentIndex >= this.playList.length - 1) {
//             currentIndex = -1; // 如果当前歌曲不存在于列表中或是最后一首，则重置为-1
//         }
//         this.playMusic(this.playList[currentIndex + 1], "playlist");
//     },
//     showLyric() {
//         if (this.currentPlayInfo.id == "default") { return; }

//         this.isLoading = true;
//         getLyricSource(this.currentPlayInfo, (lrc) => {
//             if (!lrc || lrc == "") {
//                 this.isLoading = false;
//                 return;
//             }

//             this.showLyricFlag = true;
//             this.currentLyric_Original = lrc;
//             this.currentLyric = lrc.replace(/\n/g, '<br/>').replace(/\[[^\]]*\]/g, '');

//             this.isLoading = false;
//         });
//     },
//     copyLyric() {
//         uni.setClipboardData({
//             data: this.currentLyric_Original,
//             success: () => {
//                 uni.showToast({
//                     title: "已复制到剪贴板"
//                 });
//             },
//             fail: (err) => {
//                 uni.showToast({
//                     title: "未能复制到剪贴板"
//                 });
//             }
//         })
//     },
//     saveToCollection() {
//         const storageName = "collection";

//         if (this.currentPlayInfo.id == "default") { return; }

//         // 深拷贝当前播放信息，避免引用污染
//         const songToSave = JSON.parse(JSON.stringify(this.currentPlayInfo));

//         if (jsonContains(this.collectionList, songToSave)) {
//             uni.showToast({ title: "您已收藏。" });
//             return;
//         }

//         this.collectionList.push(songToSave);
//         uni.setStorageSync(storageName, JSON.stringify(this.collectionList));

//         uni.showToast({ title: "收藏成功！" });
//     },
    
//     handleMusicError() {
//         // 处理播放器音源加载错误（部分音源会有SSL证书错误）
//         if(this.currentPlayInfo.source == "kuwo") {
//             this.currentPlayInfo.mp3 = this.currentPlayInfo.mp3.replace(/:\/\/([^.]+)\.sycdn\.kuwo\.cn\//, '://$1-sycdn.kuwo.cn/');
//         } else {
//             this.currentPlayInfo.mp3 = this.currentPlayInfo.mp3.replace('https://','http://');
//         }
//     },

//     /* 收藏夹 */
//     getCollectionList() {
//         const storageName = "collection";
//         var res = uni.getStorageSync(storageName);
        
//         if (!res || res == "") {
//             this.collectionList = [];
//             uni.setStorageSync(storageName, "[]");
//         } else {
//             this.collectionList = JSON.parse(res);
//         }
        
//         // 确保每次获取时都是新的数组引用，避免意外修改
//         this.collectionList = JSON.parse(JSON.stringify(this.collectionList));
//     },
//     delCollectionListItem(idx) {
//         const storageName = "collection";

//         uni.showModal({
//             title: "从收藏夹删除",
//             editable: false,
//             content: "确定要删除该歌曲吗？" + this.collectionList[idx].name,
//             cancelText: "取消",
//             confirmText: "确定",
//             success: (res) => {
//                 if (res.cancel) { return; }
//                 this.collectionList.splice(idx, 1);
//                 uni.setStorageSync(storageName, JSON.stringify(this.collectionList));

//                 uni.showToast({ title: "已删除" });
//             }
//         });
//     },
//     refreshCollectionSource() {
//         const storageName = "collection";
//         (async () => {
//             // 创建副本进行操作
//             const tempList = JSON.parse(JSON.stringify(this.collectionList));
            
//             for (let i = 0; i < tempList.length; i++) {
//                 this.collectionRefresherText = `${(i + 1)} / ${tempList.length}`;
//                 tempList[i] = await getMusicSourcePromise(tempList[i], this.playQuality);
//             }

//             // 更新完成后才保存
//             setTimeout(() => {
//                 this.collectionList = tempList;  // 更新引用
//                 uni.setStorageSync(storageName, JSON.stringify(this.collectionList));

//                 uni.showToast({
//                     title: "更新完成"
//                 });

//                 this.collectionRefresherText = '';
//             }, 500);
//         })();
//     },
    
//     /* 设置项 */
//     getSourceList() {
//         const storageName = "externalMusicSource";
//         var res = uni.getStorageSync(storageName);
        
//         if (!res || res == "") {
//             this.sourceList = [];
//             uni.setStorageSync(storageName, "[]");
//         } else {
//             this.sourceList = JSON.parse(res);
//         }
//     },
//     importSource(remote) {
//         const storageName = "externalMusicSource";
        
//         if(remote) {
//             const url = prompt("【导入音乐源】请输入链接");
//             if(!url) { return; }
//             $.get(url, (res) => {
//                 if(!res) { alert("脚本不存在！"); return; }
                
//                 let metadata = parseMetadata(res);
//                 if(!metadata.name) { alert("脚本元数据错误"); return; }
                
//                 uni.showModal({
//                     title: "添加脚本",
//                     editable: false,
//                     content: `是否添加该脚本？ \n\n- 名称: ${metadata.name} \n- 作者: ${metadata.author}\n- 简介: ${metadata.description}`,
//                     cancelText: "取消",
//                     confirmText: "确定",
//                     success: (res2) => {
//                         if (res2.cancel) { return; }
                        
//                         metadata["rawScript"] = res;
//                         this.sourceList.push(metadata);
//                         uni.setStorageSync(storageName, JSON.stringify(this.sourceList));
//                         uni.showToast({
//                             title: "已添加，下次加载时生效"
//                         });
//                     }
//                 });
//             });
//         } else {
//             pickFile(".js,.ts", (file) => {
//                 const reader = new FileReader();
//                 reader.readAsText(file, "text");
//                 reader.onload = (e) => {
//                     const res = e.target.result;
//                     if(!res) { alert("脚本不存在！"); return; }
                    
//                     let metadata = parseMetadata(res);
//                     if(!metadata.name) { alert("脚本元数据错误"); return; }
                    
//                     uni.showModal({
//                         title: "添加脚本",
//                         editable: false,
//                         content: `是否添加该脚本？ \n\n- 名称: ${metadata.name} \n- 作者: ${metadata.author}\n- 简介: ${metadata.description}`,
//                         cancelText: "取消",
//                         confirmText: "确定",
//                         success: (res2) => {
//                             if (res2.cancel) { return; }
                            
//                             metadata["rawScript"] = res;
//                             this.sourceList.push(metadata);
//                             uni.setStorageSync(storageName, JSON.stringify(this.sourceList));
//                             uni.showToast({
//                                 title: "已添加，下次加载时生效"
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     },
    
//     delSourceListItem(idx) {
//         const storageName = "externalMusicSource";
        
//         uni.showModal({
//             title: "移除音源",
//             editable: false,
//             content: "确定要删除该音源吗？" + this.sourceList[idx].name,
//             cancelText: "取消",
//             confirmText: "确定",
//             success: (res) => {
//                 if (res.cancel) { return; }
//                 this.sourceList.splice(idx, 1);
//                 uni.setStorageSync(storageName, JSON.stringify(this.sourceList));

//                 uni.showToast({ title: "已删除" });
//             }
//         });
//     },
    
//     importCollection() {
//         uni.getClipboardData({
//             success: (res) => {
//                 try {
//                     var cdata = JSON.stringify(JSON.parse(res.data));
//                     uni.setStorageSync('collection', cdata);
//                     uni.showToast({ title: "已从剪贴板恢复" });

//                     this.getCollectionList();
//                 } catch (e) {
//                     console.log(e)
//                     uni.showToast({ title: "不是有效的数据" });
//                 }
//             },
//             fail: (err) => {
//                 uni.showToast({ title: "读取失败" });
//                 let tmpdata = prompt("【无法获取剪贴板】请将数据粘贴到输入框", "");
//                 if (tmpdata) {
//                     try {
//                         var cdata = JSON.stringify(JSON.parse(tmpdata));
//                         uni.setStorageSync('collection', cdata);
//                         uni.showToast({ title: "已从剪贴板恢复" });

//                         this.getCollectionList();
//                     } catch (e) {
//                         uni.showToast({ title: "不是有效的数据" });
//                     }
//                 }
//             }
//         });
//     },
//     exportCollection() {
//         uni.setClipboardData({
//             data: uni.getStorageSync("collection"),
//             success: () => {
//                 uni.showToast({ title: "已复制到剪贴板" });
//             },
//             fail: (err) => {
//                 uni.showToast({ title: "未能复制到剪贴板" });
//             }
//         });
//     },

//     /* 初始化 */
//     mounted() {
//         this.getCollectionList();
//         this.getSourceList();

//         // 隐藏加载球
//         $('#loaderCover').hide();
//     }
// }).mount('#app');