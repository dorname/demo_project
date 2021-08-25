{
    classAlias: "plugin.calculateassign",
    className: "Rs.ext.field.plugin.CalculateAssign", 
    inherits: "Ext.plugin.Abstract",
    autoName: "MyCalculateAssign", 

    toolbox: {
        name: "CalculateAssign",
		groups: ["Fields"],
        category: "Field Plugins"
    },

	configs:[{
        name: 'relyOn',
        type: 'array',
        doc: '依赖字段'
    },{
        name: 'assignValue',
        type: 'string',
        doc: '赋值字段'
    },{
        name: 'rule',
        type: 'string',
        doc: '规则'
    }]
}