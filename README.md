![图标](./img/icon_128x128.png)
# AnnyMusic
支持洛雪音乐源的音乐播放浏览器扩展   
![License](https://img.shields.io/badge/license-GPLv3-yellow)
![GitHub Repo stars](https://img.shields.io/github/stars/EZ118/AnnyMusic)
![GitHub repo size](https://img.shields.io/github/repo-size/EZ118/AnnyMusic)
![GitHub all releases](https://img.shields.io/github/downloads/EZ118/AnnyMusic/total)

## 简介
该项目是一款浏览器扩展，兼容可用于 lx_music 的 JS 音乐源，并提供简洁高效的使用体验。   
洛雪音乐桌面端软件基于Electron开发，虽功能丰富，但资源占用较大。
该项目结构简单，使用轻量的响应式框架，方便定制。

## 功能与详情
### 首页
聚合显示用户的音乐收藏列表、历史等数据。   
用户可从首页快速点播最近音乐。   
### 播放器
播放器包含音乐播放、专辑封面、播放列表、歌词浏览、收藏功能。   
底部播放栏可切歌、播放暂停、查看播放列表、收藏，点击歌曲封面图片或名称可查看歌词。   
### 搜索页
搜索栏搜索歌曲，上方提供4个预设按钮切换搜索平台（搜索功能内置，不能获取音乐音频）。   
是否能正常收听取决于用户的自定义音乐源。   
对于列表内的歌曲，可以选择现在播放、添加到队列、收藏和查看相关信息。
### 播放列表页
列表展示收藏音乐；点击列表项目，可收听音乐；右键/长按列表项目，可选择删除条目。   
每次收听之前建议“更新音乐源”，用于通过音乐源重新获取最新可收听的音频链接。   
（注：音频链接会暂时缓存，页面刷新则清除）
### 音乐源
使用前务必在“设置页”导入至少一个可用的音乐源，否则无法使用。   
项目使用`sval.js`实现在`CSP`下能动态执行音乐源JS脚本，可能会受到恶意脚本的攻击，导入前需要确保音源来源可靠。
**【须知】音乐源兼容性：** 支持 lx_music 文档中提供的所有函数，相较于洛雪原版，该项目支持在 on 中支持返回自定义搜索结果，覆盖默认搜索功能，对接方法参见`/js/source_api.js`。   

## 参考与引用
+ [listen1/listen1_chrome_extension](https://github.com/listen1/listen1_chrome_extension)
+ [lyswhut/lx-music-desktop](https://github.com/lyswhut/lx-music-desktop)
+ [MithrilJS/mithril.js](https://github.com/MithrilJS/mithril.js)
+ [travist/jsencrypt](https://github.com/travist/jsencrypt)
+ [bingaha/kugou-lrc](https://github.com/bingaha/kugou-lrc)
+ [brix/crypto-js](https://github.com/brix/crypto-js)
+ [Siubaak/sval](https://github.com/Siubaak/sval)
+ [nodeca/pako](https://github.com/nodeca/pako)

## 声明与须知
+ 该扩展的正式发行版中不内置任何可用的音乐源
+ 项目中内置的搜索、歌词的API来自网络参考文章，非由本项目作者亲自破解相应平台而得
+ 用户使用本项目获取音频、收听音乐的行为应在版权方许可下进行
+ 该项目仅用于学习，若用户将本项目用于违法行为，请立刻停止使用并删除程序
*注： 本文提及的“音乐源”是指由第三方提供的用于获取音乐音频脚本，其脚本以及取得的音频、歌词、封面与本项目无关。*

## 项目规划
+ 支持打乱播放队列乱序收听
+ 完成设置页，并且可以生效
+ 移除内置获取网络歌词功能
+ 支持通过网络链接添加音源
+ 支持一键测试音源是否可用
+ 编写项目的构建和打包脚本