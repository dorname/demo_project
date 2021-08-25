{
    classAlias: "widget.telescope",
    className: "Rs.ext.telescope.Telescope", 
    inherits: "Ext.form.field.Picker",
    autoName: "MyTelescope", 

    toolbox: {
        name: "Telescope",
		groups: ["Forms"],
        category: "Form Fields"
    },

    configs: [{
        name: 'progCode',
        type: 'string',
        doc: '望远镜编码'
    }, {
        name: 'buildProgCondtion',
        type: 'function',
		params: [{
			name: 'condition'
		}],
        doc: '望远镜查询动态附加条件'
    }, {
		name: 'displayField',
		type: 'string',
		doc: '望远镜的显示字段'
	}, {
		name: 'valueField',
		type: 'string',
		doc: '望远镜的反填值字段'
	}, {
		name: 'multiSelect',
		type: 'boolean',
		defaultValue: false,
		doc: '是否允许多选 (默认为false, 即单选望远镜)'
	}, {
		name: 'forceSelection',
		type: 'boolean',
		defaultValue: true,
		doc: 'true: 限制望远镜的值来源于列表 (默认值), false: 允许用户手动输入望远镜的值'
	},{
		name: 'gridConfig',
		type: 'object',
		doc: '定制望远镜弹出面板的显示列'
	}, {
		name: 'panelConfig',
		type: 'object',
		doc: '定制望远镜弹出面板'
	}, {
		name: 'separator',
		type: 'string',
		defaultValue: ',',
		doc: '多选望远镜的分割字符串'
	}, {
		name: 'autoBackfill',
		type: 'boolean',
		defaultValue: false,
		doc: 'true: 当查询结果只有一条时, 自动将该值反填到单选望远镜, false: 取消自动反填(默认值)'
	}]
}