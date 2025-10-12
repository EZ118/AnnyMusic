class SettingsView {
    constructor() {
        this.sourceList = getStorageSync("externalMusicSource") || [];
    }

    importMusicSource() {
        pickFile(".js,.ts", (file) => {
            const reader = new FileReader();
            reader.readAsText(file, "text");
            reader.onload = (e) => {
                const res = e.target.result;
                if (!res) { alert("脚本不存在！"); return; }

                let metadata = parseMetadata(res);
                if (!metadata.name) { alert("脚本元数据错误"); return; }

                const userComfirm = confirm(`是否添加该脚本？ \n\n- 名称: ${metadata.name} \n- 作者: ${metadata.author}\n- 简介: ${metadata.description}`);
                if (!userComfirm) { return; }

                metadata["rawScript"] = res;
                this.sourceList.push(metadata);
                setStorageSync("externalMusicSource", this.sourceList);
                alert("已添加，下次加载时生效");
            }
        });
    }

    view(vnode) {
        return m("div", [
            m("h1", "Settings"),
            m("button", {
                onclick: () => {
                    this.importMusicSource()
                }
            }, "导入音源")
        ])
    }
}

export default SettingsView;