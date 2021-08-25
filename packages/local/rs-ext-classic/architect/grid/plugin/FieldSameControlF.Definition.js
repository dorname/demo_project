{
    classAlias: "plugin.fieldsamecontrolf",
    className: "Rs.ext.grid.plugin.FieldSameControlF", 
    inherits: "Ext.plugin.Abstract",
    autoName: "MyfieldSameControlF", 

    toolbox: {
        name: "FieldSameControlF",
		groups: ["Grid"],
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
        name: 'checkField',
        type: 'string',
        doc: '业务字段'
    },{
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    }]
}