{
    classAlias: "plugin.fieldsCompare",
    className: "Rs.ext.grid.plugin.FieldsCompareControlF", 
    inherits: "Ext.plugin.Abstract",
    autoName: "FieldsCompare", 
    toolbox: {
        name: "FieldsCompare",
		groups: ["Fields"],
        category: "Field Plugins"
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
        name: 'checkField',
        type: 'string',
        doc: '业务字段'
    },{
        name: 'controlRule',
        type: 'string',
        doc: '控制规则'
    },{
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    }]
}