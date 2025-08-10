const eventHandlers = {};

const LxApi = {
    version: '2.11.0',
    env: 'desktop',
    currentScriptInfo: {
        name: '默认音源',
        description: '这是一个默认空白音源，任何音源获取的desc都会返回该文本',
        version: '0.0.1',
        author: 'EZ118',
        homepage: 'https://github.com/EZ118/',
        rawScript: 'console.log("该音源执行了rawScript");'
    },
    EVENT_NAMES: {
        inited: 'inited',
        request: 'request',
        updateAlert: 'updateAlert'
    },

    on: (eventName, handler) => {
        if (!eventHandlers[eventName]) eventHandlers[eventName] = [];
        eventHandlers[eventName].push(handler);
    },

    _emit: async (eventName, payload) => {
        if (!eventHandlers[eventName]) return undefined; // 明确返回 undefined

        let result; // 用于存储最后一个处理器的返回结果
        for (const handler of eventHandlers[eventName]) {
            // 等待当前处理器执行完毕，并存储其返回值
            result = await Promise.resolve(handler(payload));
        }
        // 返回最后一个处理器的返回结果
        // 如果所有处理器都返回 undefined 或没有处理器，则 result 会是 undefined
        return result;
    },

    send: (eventName, datas) => {
        console.log('[LxApi.send]', eventName, datas);
    },

    request: (url, options, callback) => {
        console.log('[LxApi.request]', url, options);
        fetch(url, options)
            .then(async resp => {
                let text;
                try {
                    text = await resp.text();
                } catch (e) {
                    callback(e, undefined);
                    return;
                }

                let parsedBody;
                try {
                    parsedBody = JSON.parse(text);
                } catch {
                    parsedBody = text; // 不是 JSON 就保留原文
                }

                // Ensure the callback receives a response object with the expected structure
                callback(null, {
                    statusCode: resp.status,
                    headers: Object.fromEntries(resp.headers.entries()),
                    body: parsedBody, // 永远有 body
                });
            })
            .catch(err => {
                callback(err, undefined); // err 时 resp 必须 undefined
            });

        return () => console.warn('取消请求未实现');
    },

    utils: {
        buffer: {
            from: (data, encoding) => {
                if (typeof data === 'string') {
                    return new TextEncoder().encode(data);
                }
                return new Uint8Array(data);
            },
            bufToString: (buf, format = 'utf-8') => {
                if (format === 'base64') {
                    let binary = '';
                    const bytes = new Uint8Array(buf);
                    const chunkSize = 0x8000;
                    for (let i = 0; i < bytes.length; i += chunkSize) {
                        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                    }
                    return btoa(binary);
                }
                return new TextDecoder(format).decode(buf);
            },
        },
        crypto: {
            md5: async str => {
                const buf = new TextEncoder().encode(str);
                const digest = await crypto.subtle.digest('MD5', buf);
                return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
            },
            randomBytes: size => {
                const arr = new Uint8Array(size);
                crypto.getRandomValues(arr);
                return arr;
            },
            aesEncrypt: async (buffer, mode, key, iv) => {
                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    key, {
                        name: 'AES-CBC',
                        length: 128
                    },
                    false,
                    ['encrypt']
                );
                return crypto.subtle.encrypt({
                    name: 'AES-CBC',
                    iv
                }, cryptoKey, buffer);
            },
            rsaEncrypt: async (buffer, publicKeyPem) => {
                const keyData = str2ab(publicKeyPem.replace(/-----\w+ PUBLIC KEY-----/g, '').replace(/\n/g, ''));
                const cryptoKey = await crypto.subtle.importKey(
                    'spki',
                    keyData, {
                        name: 'RSA-OAEP',
                        hash: 'SHA-256'
                    },
                    false,
                    ['encrypt']
                );
                return crypto.subtle.encrypt({
                    name: 'RSA-OAEP'
                }, cryptoKey, buffer);
            },
        },
        zlib: {
            inflate: async buffer => pako.inflate(buffer),
            deflate: async buffer => pako.deflate(buffer),
        },
    },
};

function str2ab(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}