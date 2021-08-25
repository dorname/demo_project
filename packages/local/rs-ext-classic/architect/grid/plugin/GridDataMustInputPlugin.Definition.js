{
    classAlias: "plugin.griddatamustinput",
    className: "Rs.ext.grid.plugin.GridDataMustInputPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "GridDataMustInput", 

    toolbox: {
        name: "GridDataMustInput",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
		name: 'fields',
		type: 'array',
		doc: '必输字段'
	},{
        name: 'panelID',
        type: 'string',
        doc: '面板id'
    },{
        name: 'otherCdt',
        type: 'string',
        doc: '其它附加的验证条件'
    },{
        name: 'errCode',
        type: 'array',
        doc: '异常编码'
    }]
}