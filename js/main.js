import NavView from "./views/navbar.js";
import HomeView from "./views/home.js";
import PlaylistView from "./views/playlist.js";
import SearchView from "./views/search.js";
import SettingsView from "./views/settings.js";

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
		"/playlist/:id": PlaylistView,
        "/search": SearchView,
        "/settings": SettingsView
    });

	/* 创建对话框 */
	m.mount(document.querySelector("dialog"), Dialog);

	/* 执行播放源 */
	const externalMusicSource = getStorageSync("externalMusicSource") || [];
    externalMusicSource.forEach(item => {
		// 初始化沙盒
        const interpreter = new Sval({
            ecmaVer: 'latest',
            sourceType: 'script',
            sandBox: true,
        });

		// 将 lx_music 兼容API引入
		interpreter.import({
			lx: {...LxApi, currentScriptInfo: item},
			setTimeout: window.setTimeout.bind(window),
			setInterval: window.setInterval.bind(window)
		});

		// 执行当前沙盒
		interpreter.run(item.rawScript);
    });

	/* 恢复控制台输出 */
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
		
		console.log('[main.init] Console recovered.');
	}, 500);
});

document.addEventListener('touchstart', (event) => {
    // 禁止通过触摸缩放页面
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });