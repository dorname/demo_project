{
    classAlias: "plugin.headDetailCalculate",
    className: "Rs.ext.field.plugin.FieldsHeadDetailCalculatePlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "HeadDetailCalculate", 
    toolbox: {
        name: "HeadDetailCalculate",
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
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    }]
}