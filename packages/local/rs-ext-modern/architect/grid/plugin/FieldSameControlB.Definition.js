{
    classAlias: "plugin.fieldsamecontrolb",
    className: "Rs.ext.grid.plugin.FieldSameControlB", 
    inherits: "Ext.plugin.Abstract",
    autoName: "FieldSameControlB", 
    toolbox: {
        name: "FieldSameControlB",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs:[{
        name: 'itemIds',
        type: 'string',
        doc: '控件ID'
    },{
        name: 'panelId',
        type: 'string',
        doc: '面板ID'
    },{
        name: 'dataPanelId',
        type: 'string',
        doc: '数据面板ID'
    },{
        name: 'tableCode',
        type: 'string',
        doc: '数据表'
    },{
        name: 'fields',
        type: 'string',
        doc: '数据表字段'
    },{
        name: 'condition',
        type: 'string',
        doc: '约束条件'
    },{
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    },{
        name: 'tipType',
        type: 'string',
        doc: '提示类型(语音提示/文字提示)'
    }]
}