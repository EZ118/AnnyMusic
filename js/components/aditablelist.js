// EditableList 组件
const EditableList = {
    view: ({ attrs }) => {
        const items = attrs.items || [];
        const onDelete = attrs.onDelete || (() => { });
        const onChange = attrs.onChange || (() => { });
        const renderItem = attrs.renderItem;
        const onAdd = attrs.onAdd;
        const keyFn = attrs.keyFn || ((item, idx) => idx);

        return m('div.editable-list',
            items.map((item, idx) =>
                m('div.list-row', { key: keyFn(item, idx), style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' } },
                    // 渲染项：优先使用自定义渲染器
                    renderItem
                        ? renderItem(item, idx)
                        : m('input[type=text].item-input', {
                            value: item,
                            oninput: (e) => onChange(idx, e.target.value)
                        }),
                    m('button.delete-btn', {
                        onclick: () => onDelete(idx)
                    }, '删除')
                )
            ),
            // 添加按钮（如果提供 onAdd 则显示）
            onAdd ? m('div', { style: { marginTop: '8px' } },
                m('button.add-btn', { onclick: onAdd }, '添加')
            ) : null
        );
    }
};
