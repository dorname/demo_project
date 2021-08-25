{
    classAlias: "plugin.saveplugin",
    className: "Rs.ext.panel.plugin.SavePlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "SavePlugin", 

    toolbox: {
        name: "SavePlugin",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
		name: 'panelIds',
		type: 'array',
		doc: '面板id数组'
	},{
		name: 'buttonText',
		type: 'string',
		doc: '按钮文字'
	},{
		name: 'buttonIcon',
		type: 'string',
		defaultValue: 'saveAction-button-item',
		doc: '按钮图标样式'
	},{
        name: 'buttonStyle',
        type: 'object',
        doc: '按钮样式'
    },{
        name: 'url',
        type: 'string',
        doc: 'url路径'
    },{
        name: 'personCodeField',
		
        type: 'string',
        doc: '人员编码字段'
    },{
        name: 'personNameField',
        type: 'string',
        doc: '人员姓名字段'
    },{
        name: 'autoLoad',
        type: 'boolean',
        doc: '自动重新查询（存在新增或删除数据最好是重新查询）',
		defaultValue: true,
    },{
		name: 'needLoadPanels',
		type: 'array',
		doc: '需要重新load的面板的store(不填为默认所有面板的store)'
	},{
		name: 'needReplaceFields',
		type: 'object',
		doc: '保存后不刷新时，需要替换的每个面板的字段'
	},{
        name: 'beforeExecute',
        type: 'function',
		params: [{
			name: 'thisButton'
		}],
        doc: '执行前函数'
    },{
        name: 'executeSuccess',
        type: 'function',
		params: [{
			name: 'thisButton'
		},{
			name: 'response'
		}],
        doc: '执行函数'
    },{
        name: 'executeFailures',
        type: 'function',
		params: [{
			name: 'thisButton'
		},{
			name: 'response'
		}],
        doc: '执行失败函数'
    }]
}