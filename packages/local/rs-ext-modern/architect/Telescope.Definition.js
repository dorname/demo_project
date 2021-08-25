{
    classAlias: "widget.telescope",
    className: "Rs.ext.telescope.Telescope", 
    inherits: "Ext.field.Text",
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
		doc: '多选望远镜 (默认为false, 即单选望远镜)'
	}, {
		name: 'gridConfig',
		type: 'object',
		doc: '定制望远镜弹出面板的显示列'
	}, {
		name: 'separator',
		type: 'string',
		defaultValue: ',',
		doc: '多选望远镜的分割字符串'
	}]
}