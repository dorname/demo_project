{
    classAlias: "plugin.statecontrolf",
    className: "Rs.ext.grid.plugin.StateControlF", 
    inherits: "Ext.plugin.Abstract",
    autoName: "StateControlF", 
    toolbox: {
        name: "StateControlF",
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
        name: 'checkFields',
        type: 'string',
        doc: '业务字段'
    },{
        name: 'targetValues',
        type: 'string',
        doc: '目标值'
    },{
        name: 'controlRule',
        type: 'string',
        doc: '控制规则'
    },{
        name: 'erroCode',
        type: 'string',
        doc: '错误信息码'
    }]
}