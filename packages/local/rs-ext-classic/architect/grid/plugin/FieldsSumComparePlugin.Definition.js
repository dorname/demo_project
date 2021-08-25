{
    classAlias: "plugin.sumCompare",
    className: "Rs.ext.field.plugin.FieldsSumComparePlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "SumCompare", 
    toolbox: {
        name: "SumCompare",
		groups: ["Fields"],
        category: "Field Plugins"
    },
	configs:[{
        name: 'hPanelID',
        type: 'string',
        doc: '头面板ID'
    },{
        name: 'dPanelID',
        type: 'string',
        doc: '明细面板ID'
    },{
        name: 'hFields',
        type: 'string',
        doc: '头业务字段'
    },{
        name: 'dFields',
        type: 'string',
        doc: '明细业务字段'
    },{
        name: 'formula',
        type: 'string',
        doc: '公式'
    },{
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    }]
}