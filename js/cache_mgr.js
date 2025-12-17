/*
 * This script is for storing url & response cache.
 */
class CacheManager {
    constructor() {
        this.defaultDuration = 20 * 60 * 1000; // 每20分钟清理一次缓存
        this.cache = [
            {
                "hash": "114514191",
                "content": {
                    "statusCode": 200,
                    "headers": {},
                    "body": {}
                },
                "expires": 1145141919810
            } /* 这是一个示例 */
        ];
    }

    getRequestCache(url) {
        // 获取网络请求缓存
        const currentTime = new Date().getTime();
        if (this.cache.length > 0) { this.clearExpiredRequestCache(currentTime); }
        url = hash(url);

        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].hash == url) {
                console.log("[CacheManager] Cache loaded:", url, this.cache[i].content);
                return this.cache[i].content;
            }
        }
        return null;
    }

    addToRequestCache(url, resp) {
        // 将网络请求结果存储到缓存
        if (!resp || !url) { return false; }
        const currentTime = new Date().getTime();
        url = hash(url);    //将URL链接转为哈希值

        // 如果已经存在且未过期，则不重复添加
        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].hash == url && this.cache[i].expires > currentTime) {
                return false;
            }
        }

        // 存储响应结果
        this.cache.push({
            hash: url,
            content: resp,
            expires: currentTime + this.defaultDuration
        });

        console.log("[CacheManager] Cache added:", url, resp);

        return true;
    }

    clearExpiredRequestCache(timestamp) {
        // 自动清理缓存
        const newCache = this.cache.filter(item => item.expires > timestamp);
        if (newCache.length != this.cache.length) {
            this.cache = newCache;
            console.log("[CacheManager] Cache cleaned.");
        } else {
            // 没有任何缓存被清理
        }
    }
}

const cacheMgr = new CacheManager();

// export default CacheManager;