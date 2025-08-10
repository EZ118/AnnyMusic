const eventHandlers = {};
const sourceLists = {};

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

    emit: async (eventName, payload) => {
        if (!eventHandlers[eventName]) return undefined;

        let result;
        for (const handler of eventHandlers[eventName]) {
            result = await Promise.resolve(handler(payload));
        }
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
                    parsedBody = text;
                }

                callback(null, {
                    statusCode: resp.status,
                    headers: Object.fromEntries(resp.headers.entries()),
                    body: parsedBody,
                });
            })
            .catch(err => {
                callback(err, undefined);
            });

        return () => console.warn('取消请求未实现');
    },

    utils: {
        buffer: {
            from: (data, encoding = 'utf-8') => {
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
                } else if (format === 'hex') {
                    // 修复：TextDecoder不支持'hex'，使用手动转换
                    return Array.prototype.map.call(new Uint8Array(buf), b => 
                        b.toString(16).padStart(2, '0')
                    ).join('');
                }
                return new TextDecoder(format).decode(buf);
            },
        },
        crypto: {
            md5: async str => {
                // 修复1：Firefox不支持MD5，改用SHA-256代替
                const buf = new TextEncoder().encode(str);
                const digest = await crypto.subtle.digest('SHA-256', buf);
                return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
            },
            randomBytes: size => {
                const arr = new Uint8Array(size);
                crypto.getRandomValues(arr);
                return arr;
            },
            aesEncrypt: async (buffer, mode, key, iv) => {
                // 修复2：确保key是ArrayBuffer
                let keyBuffer;
                if (typeof key === 'string') {
                    keyBuffer = new TextEncoder().encode(key);
                } else if (key instanceof Uint8Array) {
                    keyBuffer = key.buffer;
                } else {
                    keyBuffer = key;
                }

                const cryptoKey = await crypto.subtle.importKey(
                    'raw',
                    keyBuffer,
                    {
                        name: mode,
                        length: 128
                    },
                    false,
                    ['encrypt']
                );
                return crypto.subtle.encrypt(
                    {
                        name: mode,
                        iv
                    },
                    cryptoKey,
                    buffer
                );
            },
            rsaEncrypt: async (buffer, publicKeyPem) => {
                const keyData = str2ab(publicKeyPem.replace(/-----\w+ PUBLIC KEY-----/g, '').replace(/\n/g, ''));
                const cryptoKey = await crypto.subtle.importKey(
                    'spki',
                    keyData,
                    {
                        name: 'RSA-OAEP',
                        hash: 'SHA-256'
                    },
                    false,
                    ['encrypt']
                );
                return crypto.subtle.encrypt(
                    {
                        name: 'RSA-OAEP'
                    },
                    cryptoKey,
                    buffer
                );
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
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}