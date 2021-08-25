{
    classAlias: "plugin.formulaplu",
    className: "Rs.ext.grid.plugin.FormulaPlu", 
    inherits: "Ext.plugin.Abstract",
    autoName: "FormulaPlu", 
    toolbox: {
        name: "FormulaPlu",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs:[{
        name: 'panelID',
        type: 'string',
        doc: '来源面板ID'
    },{
        name: 'formula',
        type: 'string',
        doc: '运算公式'
    },{
        name: 'erroCode',
        type: 'string',
        doc: '错误信息码'
    },{
        name: 'otherCdt',
        type: 'string',
        doc: '附加触发验证条件'
    }]
}