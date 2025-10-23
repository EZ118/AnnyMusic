![图标](https://youke1.picui.cn/s1/2025/08/13/689c322f2996c.png)
# AnnyMusic
支持洛雪音乐源的音乐播放浏览器扩展   
![License](https://img.shields.io/badge/license-GPLv3-yellow)
![GitHub repo size](https://img.shields.io/github/repo-size/EZ118/AnnyMusic)
![GitHub Repo stars](https://img.shields.io/github/stars/EZ118/AnnyMusic)
![GitHub all releases](https://img.shields.io/github/downloads/EZ118/AnnyMusic/total)

## 简介
该项目是一款浏览器扩展，兼容可用于洛雪音乐的JS音乐源，并提供简洁高效的使用体验。   
洛雪音乐桌面端软件是基于Electron开发的，其功能丰富，但资源占用较大。
该项目结构简单，使用轻量的响应式框架，方便定制。

## 功能与详情
### 首页
聚合显示用户的音乐收藏列表、历史、收听次数和时长排行、收听时段等数据。   
用户可快速通过首页开始播放喜欢的音乐。   
### 播放器
播放器包含音乐播放、专辑封面、播放列表、歌词浏览、收藏功能。   
底部音乐播放栏使用浏览器自带控件。   
歌词浏览仅作预览，计划加入滚动歌词。   
### 搜索页
搜索栏搜索歌曲，下方提供按钮切换搜索平台（搜索功能内置，不能获取音乐音频）。   
标注VIP的列表项表明在该音乐平台是付费歌曲，是否能继续收听取决于用户的自定义音乐源。   
### 播放列表页
列表展示收藏音乐；点击列表项目，可收听音乐；右键/长按列表项目，可选择删除条目。   
每次收听之前建议“更新音乐源”，用于通过音乐源重新获取最新可收听的音频链接。   
（注：目前只有一个默认收藏夹；音频不会缓存在本地，需要“更新音乐源”刷新）
### 音乐源
使用前务必在“设置页”导入至少一个可用的音乐源，否则无法使用。   
项目使用`sval.js`实现在`CSP`下能动态执行音乐源JS脚本，可能会受到恶意脚本的攻击，导入前需要确保音源来源可靠。

## 参考与引用
+ [Siubaak/sval](https://github.com/Siubaak/sval)
+ [MithrilJS/mithril.js](https://github.com/MithrilJS/mithril.js)
+ [nodeca/pako](https://github.com/nodeca/pako)
+ [brix/crypto-js](https://github.com/brix/crypto-js)
+ [travist/jsencrypt](https://github.com/travist/jsencrypt)
+ [listen1/listen1_chrome_extension](https://github.com/listen1/listen1_chrome_extension)
+ [lyswhut/lx-music-mobile](https://github.com/lyswhut/lx-music-mobile)
+ [bingaha/kugou-lrc](https://github.com/bingaha/kugou-lrc)

## 声明与须知
+ 当前项目能对洛雪音乐源部分兼容
+ 该扩展的正式发行版中不内置任何可用的音乐源
+ 项目中内置的搜索、歌词的API来自网络参考文章，非由本项目作者亲自破解相应平台而得
+ 用户使用本项目获取音频、收听音乐的行为应在音频作者或代理单位的许可下进行
+ 该项目仅用于学习，若用户将本项目用于违法行为，请立刻停止使用并删除程序
*注： 本文提及的“音乐源”是指由第三方提供的用于获取音乐音频脚本，其脚本以及取得的音频与本项目无关。*