{
    classAlias: "plugin.datatooltip",
    className: "Rs.ext.grid.plugin.GridDataToolTipPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "DataToolTip", 
    toolbox: {
        name: "DataToolTip",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs:[{
        name: 'fontSize',
        type: 'number',
        doc: '字体大小设置'
    },{
        name: 'color',
        type: 'string',
        doc: '字体颜色'
    },{
        name: 'fontWeight',
        type: 'string',
        doc: '字体粗细'
    }]
}