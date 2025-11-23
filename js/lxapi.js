const eventHandlers = {};
const sourceLists = {};

const utils = {
    crypto: {
        /**
         * AES 加密
         * @param {Uint8Array|Array|string} buffer - 要加密的数据
         * @param {string} mode - 加密模式 ('aes-128-cbc' 或 'aes-128-ecb')
         * @param {Uint8Array|Array|string} key - 密钥
         * @param {Uint8Array|Array|string} iv - 初始化向量 (CBC模式需要)
         * @returns {Uint8Array} 加密后的数据
         */
        aesEncrypt(buffer, mode, key, iv) {
            console.log('[LxApi.crypto.aesEncrypt]', buffer, mode, key, iv);
            try {
                // 转换输入为 WordArray
                const message = utils.crypto._toWordArray(buffer);
                const keyWordArray = utils.crypto._toWordArray(key);

                console.log('🔍 原始消息长度(字节):', typeof buffer === 'string' ? buffer.length : buffer.length);

                let encrypted;
                switch (mode) {
                    case 'aes-128-cbc': {
                        const ivWordArray = utils.crypto._toWordArray(iv);
                        encrypted = CryptoJS.AES.encrypt(message, keyWordArray, {
                            iv: ivWordArray,
                            mode: CryptoJS.mode.CBC,
                            padding: CryptoJS.pad.Pkcs7
                        });
                        break;
                    }
                    case 'aes-128-ecb': {
                        // ECB 模式必须使用 Pkcs7 padding，不能用 NoPadding
                        encrypted = CryptoJS.AES.encrypt(message, keyWordArray, {
                            mode: CryptoJS.mode.ECB,
                            padding: CryptoJS.pad.Pkcs7  // 改为 Pkcs7
                        });
                        break;
                    }
                    default:
                        throw new Error('Unsupported AES mode: ' + mode);
                }

                // 将加密结果转换为 Base64 然后 Uint8Array
                const base64Result = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
                const bytes = utils.crypto._base64ToUint8Array(base64Result);

                return bytes;
            } catch (error) {
                throw new Error('AES encryption failed: ' + error.message);
            }
        },

        /**
         * RSA 加密
         * @param {Uint8Array|Array|string} buffer - 要加密的数据
         * @param {string} key - RSA 公钥
         * @returns {Uint8Array} 加密后的数据
         */
        rsaEncrypt(buffer, key) {
            console.log('[LxApi.crypto.rsaEncrypt]', buffer, key);

            try {
                if (typeof key !== 'string') {
                    throw new Error('Invalid RSA key');
                }

                // 清理密钥格式
                let cleanKey = key
                    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
                    .replace(/-----END PUBLIC KEY-----/g, '')
                    .replace(/\s/g, '');

                // 重新格式化密钥
                const formattedKey = '-----BEGIN PUBLIC KEY-----\n' +
                    cleanKey.match(/.{1,64}/g).join('\n') +
                    '\n-----END PUBLIC KEY-----';

                // 转换 buffer 为字符串
                const data = utils.buffer.bufToString(buffer, 'base64');

                // 使用 JSEncrypt 进行加密
                const encrypt = new JSEncrypt();
                encrypt.setPublicKey(formattedKey);

                // JSEncrypt 默认使用 NoPadding 需要手动处理
                // 这里使用标准加密,如需 NoPadding 需要额外处理
                const encrypted = encrypt.encrypt(data);

                if (!encrypted) {
                    throw new Error('RSA encryption failed');
                }

                // 将 base64 结果转换为 Uint8Array
                return utils.crypto._base64ToUint8Array(encrypted);
            } catch (error) {
                throw new Error('RSA encryption failed: ' + error.message);
            }
        },

        /**
         * 生成随机字节
         * @param {number} size - 字节数
         * @returns {Uint8Array} 随机字节数组
         */
        randomBytes(size) {
            console.log('[LxApi.crypto.randomBytes]', size);

            if (window.crypto && window.crypto.getRandomValues) {
                // 使用浏览器的加密安全随机数生成器
                return window.crypto.getRandomValues(new Uint8Array(size));
            } else {
                // 降级方案(不推荐用于加密)
                const byteArray = new Uint8Array(size);
                for (let i = 0; i < size; i++) {
                    byteArray[i] = Math.floor(Math.random() * 256);
                }
                return byteArray;
            }
        },

        /**
         * MD5 哈希
         * @param {string} str - 要哈希的字符串
         * @returns {string} MD5 哈希值(十六进制)
         */
        md5(str) {
            console.log('[LxApi.crypto.md5]', str);

            if (typeof str !== 'string') {
                throw new Error('param required a string');
            }
            return CryptoJS.MD5(str).toString();
        },

        // 辅助方法: 转换为 CryptoJS WordArray
        _toWordArray(input) {
            console.log('[LxApi.crypto._toWordArray]', input);

            if (typeof input === 'string') {
                return CryptoJS.enc.Utf8.parse(input);
            } else if (input instanceof Uint8Array || Array.isArray(input)) {
                // 将字节数组转换为十六进制字符串,再转为 WordArray
                const hexString = Array.from(input)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
                return CryptoJS.enc.Hex.parse(hexString);
            }
            return input;
        },

        // 辅助方法: Base64 转 Uint8Array
        _base64ToUint8Array(base64) {
            console.log('[LxApi.crypto._base64ToUint8Array]', base64);

            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        }
    },

    buffer: {
        /**
         * 从各种输入创建 Uint8Array
         * @param {string|Array|Uint8Array} input - 输入数据
         * @param {string} encoding - 编码类型 ('base64', 'hex', 'utf8' 等)
         * @returns {Uint8Array} 字节数组
         */
        from(input, encoding) {

            console.log('[LxApi.buffer.from]', input, encoding);

            if (typeof input === 'string') {
                switch (encoding) {
                    case 'binary':
                        throw new Error('Binary encoding is not supported for input strings');

                    case 'base64': {
                        const binaryString = atob(input);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        return bytes;
                    }

                    case 'hex': {
                        const hexString = input.replace(/\s/g, '');
                        const len = hexString.length;
                        const bytes = new Uint8Array(len / 2);
                        for (let i = 0; i < len; i += 2) {
                            bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
                        }
                        return bytes;
                    }

                    case 'utf8':
                    case 'utf-8':
                    default: {
                        // UTF-8 编码
                        const encoder = new TextEncoder();
                        return encoder.encode(input);
                    }
                }
            } else if (Array.isArray(input)) {
                return new Uint8Array(input);
            } else if (input instanceof Uint8Array) {
                return input;
            } else {
                throw new Error('Unsupported input type: ' + typeof input + ' encoding: ' + encoding);
            }
        },

        /**
         * 将 buffer 转换为字符串
         * @param {Uint8Array|Array} buf - 字节数组
         * @param {string} format - 输出格式 ('binary', 'hex', 'base64', 'utf8')
         * @returns {string|Uint8Array} 转换后的结果
         */
        bufToString(buf, format) {
            console.log('[LxApi.buffer.bufToString]', buf, format);

            if (!Array.isArray(buf) && !(buf instanceof Uint8Array)) {
                throw new Error('Input is not a valid buffer');
            }

            const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);

            switch (format) {
                case 'binary':
                    // 返回原始字节数组
                    return bytes;

                case 'hex': {
                    return Array.from(bytes)
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('');
                }

                case 'base64': {
                    let binaryString = '';
                    for (let i = 0; i < bytes.length; i++) {
                        binaryString += String.fromCharCode(bytes[i]);
                    }
                    return btoa(binaryString);
                }

                case 'utf8':
                case 'utf-8':
                default: {
                    const decoder = new TextDecoder('utf-8');
                    return decoder.decode(bytes);
                }
            }
        }
    },

    zlib: {
        inflate: async (buffer) => {
            console.log('[LxApi.zlib.inflate]', buffer);
            return pako.inflate(buffer);
        },
        deflate: async (buffer) => {
            console.log('[LxApi.zlib.deflate]', buffer);
            return pako.deflate(buffer);
        },
    },
};

const LxApi = {
    version: '2.11.0',
    env: 'desktop',
    currentScriptInfo: {
        name: '默认音源',
        description: '这是一个默认空白音源，任何音源获取的desc都会返回该文本',
        version: '0.0.1',
        author: 'EZ118',
        homepage: 'https://github.com/EZ118/',
        rawScript: 'console.log("ERROR!!!!!!");'
    },
    EVENT_NAMES: {
        inited: 'inited',
        request: 'request',
        updateAlert: 'updateAlert'
    },

    on: (eventName, handler) => {
        // 注册事件
        if (!eventHandlers[eventName]) eventHandlers[eventName] = [];
        eventHandlers[eventName].push(handler);
    },

    emit: async (eventName, payload) => {
        // 执行音源内部函数
        if (!eventHandlers[eventName]) return undefined;

        let failure = null;
        for (const handler of eventHandlers[eventName]) {
            try {
                // 尝试执行每个处理函数，只要有一个成功就立即返回结果
                return await Promise.resolve(handler(payload));
            } catch (err) {
                // 保存第一个错误，如果所有都失败则最终抛出这个错误
                failure = Promise.reject(err);
            }
        }

        if (failure) {
            // 所有处理函数都失败，则抛出第一个错误
            throw failure;
        } else {
            // 所有处理函数都成功，返回 undefined
            return Promise.reject("未知错误");
        }
    },

    send: (eventName, datas) => {
        // 初始化时执行
        console.log('[LxApi.send]', eventName, datas);

        // 如果有消息提示
        if (eventName == LxApi.EVENT_NAMES.updateAlert) {
            alert(JSON.stringify(datas));
        }

        // 记录该音源支持的源
        console.log("[LxApi.send] supported sources: ", datas.sources)
    },

    request: (url, options, callback) => {
        console.log('[LxApi.request]', url, options);
        toggleLoader(true);

        // 构建 fetch options
        const fetchOptions = {
            method: options.method || 'GET',
            headers: {},
        };

        // 处理 headers
        if (options.headers) {
            Object.assign(fetchOptions.headers, options.headers);
        }

        // 处理 form 数据
        if (options.form) {
            // 将 form 对象转换为 URL 编码的字符串
            const formData = new URLSearchParams();
            for (const [key, value] of Object.entries(options.form)) {
                formData.append(key, value);
            }
            fetchOptions.body = formData.toString();

            // 设置 Content-Type
            if (!fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
                fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        if (options.formData) {
            if (typeof options.formData === 'object') {
                fetchOptions.body = JSON.stringify(options.formData);
                if (!fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
                    fetchOptions.headers['Content-Type'] = 'application/json';
                }
            } else {
                fetchOptions.body = options.formData;
            }
        }

        fetch(url, fetchOptions)
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
                toggleLoader(false);
            })
            .catch(err => {
                callback(err, undefined);
                toggleLoader(false);
            });

        return () => console.warn('取消请求未实现');
    },
    utils
};