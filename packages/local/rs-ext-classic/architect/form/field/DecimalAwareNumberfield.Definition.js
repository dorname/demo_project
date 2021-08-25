{
    classAlias: "widget.decimalawarenumberfield",
    className: "Rs.ext.form.field.DecimalAwareNumberfield", 
    inherits: "Ext.form.field.Number",
    autoName: "MyDecimalAwareNumberfield", 

    toolbox: {
        name: "DecimalAwareNumberfield",
		groups: ["Forms"],
        category: "Form Fields"
    },
	
	configs: [{
        name: 'panelId',
        type: 'string',
        doc: 'panelId不允许为空.'
    }, {
        name: 'compId',
        type: 'string',
        doc: '定位小数位数组件的标识.'
    }]
}