{
    classAlias: "plugin.deleteHead",
    className: "Rs.ext.grid.plugin.deleteHeadControlF", 
    inherits: "Ext.plugin.Abstract",
    autoName: "DeleteHead", 
    toolbox: {
        name: "DeleteHead",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs:[{
        name: 'itemIds',
        type: 'string',
        doc: '控件ID'
    },{
        name: 'relatePanelId',
        type: 'string',
        doc: '面板ID'
    },{
        name: 'checkFields',
        type: 'string',
        doc: '业务字段'
    },{
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    }]
}