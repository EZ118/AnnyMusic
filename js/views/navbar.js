import ICON from "../icons.js";

class NavView {
    constructor() {
        this.navItem = [
            { name: "首页", icon: "home", route: "/home" },
            { name: "搜索", icon: "search", route: "/search" },
            { name: "歌单", icon: "playList", route: "/playlist" },
            { name: "设置", icon: "settings", route: "/settings" },
        ];
        this.selected = "/home";
    }

    oninit() {
        // 获取当前选中项
        setTimeout(() => {
            this.selected = m.route.get() || "/home";
            // console.log(this.selected)
            m.redraw();
        }, 100);
    }

    view(vnode) {
        return [
            m("img", { src: "./img/icon_64x64.png", alt: "LOGO", class: "logo" }),
            this.navItem.map(item => {
                return m(
                    m.route.Link,
                    {
                        href: item.route,
                        title: item.name,
                        options: {replace: true},
                        onclick: () => {
                            // 设置当前选中项
                            this.selected = item.route
                        }
                    },
                    m("div", { class: `item${(this.selected == item.route ? " selected" : "")}` }, m.trust(ICON[item.icon]))
                )
            })
        ]
    }
}

export default NavView;