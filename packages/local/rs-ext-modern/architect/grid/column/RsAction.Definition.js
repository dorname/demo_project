{
    classAlias: "widget.rsactioncolumn",
    className: "Rs.ext.grid.column.RsAction", 
    inherits: "Ext.grid.column.Column",
    autoName: "MyRsAction Column", 

    toolbox: {
        name: "RsAction Column",
		groups: ["Grids"],
        category: "Grid Columns"
    },
	configs:[
	/*{
		name: 'addAltText',
        type: 'string',
		doc:'图片元素的代表文字'
	},{
		name: 'addIcon',
        type: 'string',
		doc:'新增操作自定义图标(图标路径)'
	},{
		name: 'addDisabled',
        type: 'boolean',
		doc:'新增操作是否可用'
	},{
		name: 'addHidden',
        type: 'boolean',
		doc:'是否隐藏新增操作'
	},{
		name: 'addToolTip',
        type: 'string',
		doc:'新增操作提示'
	},*/{
        name: 'addDefaultValue',
        type: 'object',
        doc: '新增行的默认值设置'
    },{
		name: 'addHandler',
        type: 'function',
				params: [
                {
                    "name": "grid",
                    "type": "Ext.view.Table"
                },
                {
                    "name": "rowIndex",
                    "type": "Number"
                },
                {
                    "name": "colIndex",
                    "type": "Number"
                },
                {
                    "name": "item",
                    "type": "Object"
                },
                {
                    "name": "e",
                    "type": "Event"
                },
                {
                    "name": "record",
                    "type": "Ext.data.Model"
                },
                {
                    "name": "row",
                    "type": "HTMLElement"
                },{
                    "name": "defaultValue",
                    "type": "Object"
                }
            ],
        alternates: [
                {
                    "type": "string"
                }
            ],
		doc:'新增逻辑重定义'
	},/*{
		name: 'deleteAltText',
        type: 'string',
		doc:'图片元素的代表文字'
	},{
		name: 'deleteIcon',
        type: 'string',
		doc:'删除操作自定义图标(图标路径)'
	},{
		name: 'deleteDisabled',
        type: 'boolean',
		doc:'删除操作是否可用'
	},{
		name: 'deleteHidden',
        type: 'boolean',
		doc:'是否隐藏删除操作'
	},{
		name: 'deleteToolTip',
        type: 'string',
		doc:'删除操作提示'
	},*/{
		name: 'deleteHandler',
        type: 'function',
		params: [
                {
                    "name": "grid",
                    "type": "Ext.view.Table"
                },
                {
                    "name": "rowIndex",
                    "type": "Number"
                },
                {
                    "name": "colIndex",
                    "type": "Number"
                },
                {
                    "name": "item",
                    "type": "Object"
                },
                {
                    "name": "e",
                    "type": "Event"
                },
                {
                    "name": "record",
                    "type": "Ext.data.Model"
                },
                {
                    "name": "row",
                    "type": "HTMLElement"
                }
            ],
        alternates: [
                {
                    "type": "string"
                }
            ],
		doc:'删除逻辑重定义'
	}]
}