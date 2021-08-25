{
    classAlias: "plugin.decrement-plugin",
    className: "Rs.ext.grid.plugin.DecrementPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "MyDecrementPlugin", 

    toolbox: {
        name: "DecrementPlugin",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
		name: 'panelId',
		type: 'string',
		doc: '面板id'
	}]
}