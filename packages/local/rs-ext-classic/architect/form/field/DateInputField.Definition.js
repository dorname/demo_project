{
    classAlias: "widget.dateinputfield",
    className: "Rs.ext.form.field.DateInputField", 
    inherits: "Ext.form.field.Text",
    autoName: "MyDateInputField", 

    toolbox: {
        name: "DateInputField",
		groups: ["Forms"],
        category: "Form Fields"
    },

    configs: [{
        name: 'format',
        type: 'string',
		defaultValue:"Y/m/d",
        doc: '日期格式默认值为Y/m/d'
    }]
}