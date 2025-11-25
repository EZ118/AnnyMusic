function toggleLoader(show) {
    // 显示或隐藏加载动画
    if (show) {
        document.getElementById("loader").style.display = "block";
    } else {
        document.getElementById("loader").style.display = "none";
    }
}

function toast(content, delay){
    delay = delay || 3000;
    let div = document.createElement('div');
    div.className = 'toast';
    div.innerText = content;
    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, delay);
}

function hash(str) {
    // 计算字符串的哈希值（返回字符串）
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString();
}

function downloadFile(fileName, text) {
    // 下载文件
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([text]);
    const saveLink = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "a",
    );
    saveLink.href = url.createObjectURL(blob);
    // 设置 download 属性
    saveLink.download = fileName;
    saveLink.click();
}

// function getStorage(key, callback) {
//     // 获取本地存储项
//     chrome.storage.local.get([key], (result) => {
//         if (result[key]) {
//             callback(result[key]);
//         } else {
//             callback(null);
//         }
//     });
// }

// function setStorage(key, value) {
//     // 设置本地存储项
//     chrome.storage.local.set({ [key]: value });
// }

// function removeStorage(key, callback) {
//     // 移除本地存储项
//     chrome.storage.local.remove(key, () => {
//         if (callback) {
//             callback();
//         }
//     });
// }

function getStorageSync(key) {
    // 获取本地存储项（同步）
    var ls = localStorage.getItem(key);
    try {
        return JSON.parse(ls);
    } catch (e) {
        return ls; // 如果解析失败，返回原始字符串
    }
}

function setStorageSync(key, value) {
    // 设置本地存储项（同步）
    try {
        // 尝试将值转换为 JSON 字符串
        value = JSON.stringify(value);
    } catch (e) { }
    localStorage.setItem(key, value);
}

function removeStorageSync(key) {
    // 移除本地存储项（同步）
    localStorage.removeItem(key);
}

function areKeysEqual(dict1, dict2) {
    // 比较两个对象的键是否相同
    const keys1 = Object.keys(dict1);
    const keys2 = Object.keys(dict2);

    if (keys1.length !== keys2.length) {
        return false;
    }
    const keySet1 = new Set(keys1);
    for (const key of keys2) {
        if (!keySet1.has(key)) {
            return false;
        }
    }
    return true;
}

function formatDuration(seconds) {
    // 秒数转时间
    let hours = parseInt(seconds / 3600);
    let minutes = parseInt((seconds % 3600) / 60);
    let secondsLeft = Math.floor(seconds % 60);

    // 补零操作
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    secondsLeft = secondsLeft < 10 ? "0" + secondsLeft : secondsLeft;

    if (hours == "00") {
        return `${minutes}:${secondsLeft}`;
    } else {
        return `${hours}:${minutes}:${secondsLeft}`;
    }
}

function parseMetadata(str) {
    // 找到第一个 /* 开头的注释内容
    const commentRegex = /\/\*[^]*?\*\//;
    const match = str.match(commentRegex);

    if (!match || !match[0]) {
        return {}; // 没有找到注释
    }

    const commentContent = match[0];

    // 提取注释内部的内容（去掉 /* 和 */）
    const content = commentContent.substring(2, commentContent.length - 2);

    const lines = content.split('\n');
    const metadata = {};

    // 匹配 @key value 格式
    const keyRegex = /^@(\w+)\s+(.+)$/;

    lines.forEach(line => {
        // 去掉行首的 * 和空格
        const cleanedLine = line.trim().replace(/^\*\s*/, '');
        const lineMatch = cleanedLine.match(keyRegex);
        if (lineMatch) {
            const key = lineMatch[1];
            const value = lineMatch[2].trim();
            metadata[key] = value;
        }
    });
    return metadata;
}



function jsonContains(jsonArray, jsonObject) {
    // 检查JSON是否包含
    for (var i = 0; i < jsonArray.length; i++) {
        var element = jsonArray[i];
        if (element.id === jsonObject.id) {
            return true;
        }
    }
    return false;
}

function pickFile(accept, callback) {
    // 创建 input 元素
    var input = document.createElement('input');

    // 设置属性
    input.type = 'file';
    input.accept = accept || '*/*';
    input.multiple = false;

    // 隐藏元素
    input.style.display = 'none';

    // 添加事件监听器
    input.addEventListener('change', function () {
        var files = this.files;
        if (files.length > 0) {
            callback(files[0]);
        } else {
            callback(null);
        }
        // 移除元素
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
    });

    // 添加到页面
    document.body.appendChild(input);

    // 触发点击
    input.click();
}

function parseLrc(lrcText) {
    // 解析 LRC 歌词
    const lines = lrcText.split('\n');
    const result = [];

    // 匹配时间标签的正则表达式 [mm:ss.xx] 或 [mm:ss]
    const timeRegex = /^\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/;

    for (const line of lines) {
        // 跳过空行
        if (!line.trim()) continue;

        // 跳过元数据行（以 [字母: 开头）
        if (/^\[[a-zA-Z]+:.*\]/.test(line)) continue;

        const match = timeRegex.exec(line);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;

            // 计算总秒数（带小数）
            const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;

            // 获取歌词文本（去掉时间标签后的内容）
            const text = line.slice(match[0].length).trim();

            // 只有当有歌词文本时才添加到结果中
            if (text) {
                result.push({
                    time: totalSeconds,
                    text: text
                });
            }
        }
    }

    // 按时间排序
    result.sort((a, b) => a.time - b.time);

    return result;
}