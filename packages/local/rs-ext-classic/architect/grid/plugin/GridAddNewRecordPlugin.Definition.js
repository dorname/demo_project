{
    classAlias: "plugin.addnewrecord",
    className: "Rs.ext.grid.plugin.GridAddNewRecordPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "AddNewRecord", 

    toolbox: {
        name: "AddNewRecord",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
        name: 'addButtonShow',
        type: 'boolean',
		defaultValue: false,
        doc: 'True表示启用按钮新增行形式,false表示启用校验必输字段完成后自动新增行，默认为false'
    },{
        name: 'defaultValue',
        type: 'object',
        doc: '新增行的默认值设置'
    },{
        name: 'buttonIcon',
        type: 'string',
        doc: '按钮图标例如删除图标:x-fa fa-trash'
    },{
        name: 'buttonStyle',
        type: 'string',
        doc: '按钮样式'
    },{
        name: 'buttonText',
        type: 'string',
        doc: '按钮文本'
    },{
        name: 'addNewRecord',
        type: 'function',
		params: [{
			name: 'store'
		},{
			name: 'defaultValue'
		}],
        doc: '新增行逻辑重写'
    },{
        name: 'doCheckMustInputField',
        type: 'function',
		params: [{
			name: 'store'
		},{
			name: 'mustInputFields'
		},{
			name: 'newRecords'
		},{
			name: 'me'
		}],
        doc: '必输字段校验方法重写要求返回Boolean值,false表示存在尚未输入的必输字段'
    },{
        name: 'mustInputFields',
        type: 'array',
        doc: '必输字段（以数组的形式）'
    }]
}