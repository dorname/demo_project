{
    classAlias: "plugin.relatestatecontrolf",
    className: "Rs.ext.grid.plugin.RelateStateControlF", 
    inherits: "Ext.plugin.Abstract",
    autoName: "RelateStateControlF", 
    toolbox: {
        name: "RelateStateControlF",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs:[{
        name: 'itemIds',
        type: 'string',
        doc: '关联控件id'
    },{
        name: 'relatePanelId',
        type: 'string',
        doc: '关联面板ID'
    },{
        name: 'relateFields',
        type: 'string',
        doc: '关联字段'
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
    },{
		name:"allRowEnable",
		type:"boolean",
		defaultValue:false,
		doc:"是否控制该行全部数据列"
	}]
}