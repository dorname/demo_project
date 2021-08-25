{
    classAlias: "plugin.griddatacheckrepeat",
    className: "Rs.ext.grid.plugin.GridDataCheckRepeatPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "GridDataCheckRepeat", 

    toolbox: {
        name: "GridDataCheckRepeat",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
		name: 'fields',
		type: 'array',
		doc: '验重字段'
	},{
        name: 'panelID',
        type: 'string',
        doc: '面板id'
    },{
        name: 'errCode',
        type: 'array',
        doc: '异常编码'
    }]
}