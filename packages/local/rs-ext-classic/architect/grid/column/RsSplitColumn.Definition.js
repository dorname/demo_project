{
    classAlias: "widget.rssplitcolumn",
    className: "Rs.ext.grid.column.RsSplitColumn", 
    inherits: "Ext.grid.column.Action",
    autoName: "MyRsSplitColumn Column", 

    toolbox: {
        name: "RsSplit Column",
		groups: ["Grids"],
        category: "Grid Columns"
    },
	configs:[{
		name: 'splitIcon',
        type: 'string',
		doc:'拆分操作自定义图标（路径'
	},{
		name: 'splictFields',
        type: 'array',
		doc:'拆分字段数组'
	},{
		name: 'assignmentOld',
        type: 'object',
		doc:'原数据行赋值字段'
	},{
		name: 'assignmentNew',
        type: 'object',
		doc:'新数据行赋值字段'
	}]
}