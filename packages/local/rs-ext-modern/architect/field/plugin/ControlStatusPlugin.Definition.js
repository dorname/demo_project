{
    classAlias: "plugin.controlstatus",
    className: "Rs.ext.field.plugin.ControlStatusPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "ControlStatus", 
    toolbox: {
        name: "ControlStatus",
		groups: ["Fields"],
        category: "Field Plugins"
    },
	configs:[{
        name: 'panelId',
        type: 'string',
        doc: '面板ID'
    },{
        name: 'controlObj',
        type: 'object',
        doc: '控制对象'
    },{	
        name: 'errorCode',
        type: 'string',
        doc: '错误信息码'
    },{
        name: 'tipType',
        type: 'string',
        doc: '提示类型'
    }]
}