{
    classAlias: 'widget.relation-grid',
    className: "Rs.ext.grid.RelationGridPanel",
    inherits: "Ext.grid.Grid",
    autoName: "MyRelationGridPanel",

    toolbox: {
        name: "RelationGridPanel",
        groups: ["Grids"],
        category: "Grid"
    },
    configs: [{
            name: 'relationGridPanelId',
            type: 'string',
            doc: '关联面板的Id（注关联面板指的是与当前面板相关联的面版，例如：当前面板对应的上帧面板或下帧面板）'
        }, {
            name: 'relationGridQueryFieldArray',
            type: 'array',
            doc: '关联面板查询条件对应的字段数组（注关联面板指的是与当前面板相关联的面版，例如：当前面板对应的上帧面板或下帧面板）'
        },{
            name: 'moreRelationGridObj',
            type: 'object',
            doc: '并行帧的列表面板ID以及关联字段组成的对象{"0":{relationGridPanelId: "",relationGridQueryFieldArray:[]}}'
        }, {
            name: 'relationGridPanelAutoLoad',
            type: 'boolean',
            defaultValue: true,
            doc: '关联面板是否自动加载（默认加载第一条数据的查询结果）'
        },{
            name: 'isAddWhileNoRecords',
            type: 'boolean',
            defaultValue: true,
            doc: '空数据自动加载新增行'
        },{
            name: 'clickAutoLoadRelationGridPanel',
            type: 'boolean',
            defaultValue: true,
            doc: '是否点击上帧数据行自动加载下帧'
        }]
}
