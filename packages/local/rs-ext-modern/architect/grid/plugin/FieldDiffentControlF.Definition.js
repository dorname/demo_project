{
    classAlias: "plugin.fielddiffentcontrolf",
    className: "Rs.ext.grid.plugin.FieldDiffentControlF",  
    inherits: "Ext.plugin.Abstract",
    autoName: "MyfieldDiffentControlF", 

    toolbox: {
        name: "FieldDiffentControlF",
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