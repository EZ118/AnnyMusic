function limitConsecutiveChars(str) {
    // 只允许字符串中连续出现n个相同字符
    const maxConsecutive = 10;
    return str.replace(
        new RegExp(`(.)\\1{${maxConsecutive - 1},}`, "g"),
        (match, p1) => p1.repeat(maxConsecutive),
    );
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

function getStorage(key, callback) {
    // 获取本地存储项
    chrome.storage.local.get([key], (result) => {
        if (result[key]) {
            callback(result[key]);
        } else {
            callback(null);
        }
    });
}

function setStorage(key, value) {
    // 设置本地存储项
    chrome.storage.local.set({ [key]: value });
}

function removeStorage(key, callback) {
    // 移除本地存储项
    chrome.storage.local.remove(key, () => {
        if (callback) {
            callback();
        }
    });
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
    let secondsLeft = seconds % 60;

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

function minimizeWindow() {
    // 最小化窗口
    chrome.windows.getCurrent({ populate: false }, function (currentWindow) {
        chrome.windows.update(currentWindow.id, { state: "minimized" });
    });
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
    var input = $('<input>').attr({
        type: 'file',
        accept: accept || '*/*',
        multiple: false
    }).hide();
      
    input.on('change', function() {
        var files = this.files;
        if (files.length > 0) {
            callback(files[0]);
        } else {
            callback(null);
        }
        input.remove();
    });
    
    $('body').append(input);
    input.click();
}