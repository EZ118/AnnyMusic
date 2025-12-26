import ICON from "./icons.js";
import NavView from "./views/navbar.js";
import HomeView from "./views/home.js";
import PlaylistView from "./views/playlist.js";
import SearchView from "./views/search.js";
import SettingsView from "./views/settings.js";

import { PlayerView, LyricView } from "./views/player.js";
import { Dialog } from "./views/dialog.js";
import statMgr from "./stat_mgr.js";

export const App = () => {
	/* 渲染 */
	return {
		oncreate: () => {
			// 创建路由
			m.route(document.querySelector("main"), "/home", {
				"/home": HomeView,
				"/playlist": PlaylistView,
				"/playlist/:id": PlaylistView,
				"/search": SearchView,
				"/settings": SettingsView
			});
		},
		view: () => {
			return [
				m("#loader", { style: { display: "none" } }, m.trust(ICON.loader)),
				m("nav", m(NavView)),
				m("main", ""),
				m("footer", m(PlayerView)),
				m("#lyric_view", { style: { display: "none", top: "100vh" }}, m(LyricView)),
				m(Dialog)
			];
		},
	};
};