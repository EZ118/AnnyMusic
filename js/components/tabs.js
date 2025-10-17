// Tabs.js - Mithril v2 组件
const Tabs = {
    // attrs: { selected: Number (可选, 默认0), onselect: (index) => void, tabs: [{label, key?, content}] }
    view({ attrs }) {
        const selected = typeof attrs.selected === "number" ? attrs.selected : 0;
        const onselect = attrs.onselect || (() => { });
        const tabs = attrs.tabs || [];

        return m("div.tabs", [
            m("div.tab-headers", tabs.map((t, i) =>
                m("button.tab-header", {
                    key: t.key ?? i,
                    onclick: () => onselect(i),
                    class: i === selected ? "is-active" : ""
                }, t.label)
            )),
            m("div.tab-panels", tabs.map((t, i) =>
                m("div.tab-panel", {
                    key: t.key ?? i,
                    // 通过 aria-hidden 保持可访问性提示；通过 inline style 或 class 控制 display
                    "aria-hidden": i === selected ? "false" : "true",
                    style: { display: i === selected ? "" : "none" }
                }, typeof t.content === "function" ? t.content() : t.content)
            ))
        ]);
    }
};

export default Tabs;
