{
    classAlias: "plugin.deleterecord",
    className: "Rs.ext.grid.plugin.GridDeleteRecordPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "DeleteRecord", 

    toolbox: {
        name: "DeleteRecord",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
			name: 'style',
			type: 'object',
			doc: '删除按钮样式'
		},{
			name: 'beforeDeleteRecord',
			type: 'function',
			params: [{
				name: 'grid'
			}],
			doc: '删除前自定义验证'
		},
		{
			name: 'deleteSuccess',
			type: 'function',
			params: [{
				name: 'grid'
			},{
				name: 'response'
			}],
			doc: '删除成功方法'
		},
		{
			name: 'deleteFailure',
			type: 'function',
			params: [{
				name: 'grid'
			},{
				name: 'response'
			}],
			doc: '删除失败方法'
		}
	]
}