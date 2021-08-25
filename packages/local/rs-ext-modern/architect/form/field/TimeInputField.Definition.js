{
    classAlias: "widget.timeinputfield",
    className: "Rs.ext.form.field.TimeInputField", 
    inherits: "Ext.field.Text",
    autoName: "MyTimeInputField", 

    toolbox: {
        name: "TimeInputField",
		groups: ["Forms"],
        category: "Form Fields"
    },

    configs: [{
        name: 'format',
        type: 'string',
		defaultValue:"H:i",
        doc: '时间格式默认值为H:i'
    },{
        name: 'strictFormat',
        type: 'boolean',
		defaultValue:true,
        doc: '使用标准时间格式例如：true 8点=08:00,false 8点=8:00'
    }]
}