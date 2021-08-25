{
    classAlias: "plugin.saverecord",
    className: "Rs.ext.grid.plugin.GridSaveRecordPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "SaveRecord", 

    toolbox: {
        name: "SaveRecord",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
		name: 'style',
		type: 'object',
		doc: '保存按钮样式'
	},{
        name: 'mustInputFields',
        type: 'object',
        doc: '必输字段'
    },{
        name: 'checkRepeatFields',
        type: 'array',
        doc: '验重字段'
    },{
        name: 'url',
        type: 'string',
        doc: 'url路径'
    },{
        name: 'cunstomCheckRule',
        type: 'function',
		params: [{
			name: 'grid'
		}],
        doc: '自定义验证'
    },{
        name: 'saveFailure',
        type: 'function',
		params: [{
			name: 'grid'
		},{
			name: 'response'
		}],
        doc: '保存失败函数'
    },{
        name: 'insertFailure',
        type: 'function',
		params: [{
			name: 'grid'
		},{
			name: 'response'
		}],
        doc: '新增失败函数'
    },{
        name: 'deleteFailure',
        type: 'function',
		params: [{
			name: 'grid'
		},{
			name: 'response'
		}],
        doc: '删除失败函数'
    },{
        name: 'saveSuccess',
        type: 'function',
		params: [{
			name: 'grid'
		},{
			name: 'response'
		}],
        doc: '保存成功函数'
    }]
}