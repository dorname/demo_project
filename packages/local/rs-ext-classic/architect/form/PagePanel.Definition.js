{
    classAlias: "widget.Pageform",
    className: "Rs.ext.form.PagePanel", 
    inherits: "Ext.form.Panel",
    autoName: "PageFormPanel", 

    toolbox: {
        name: "PageFormPanel",
		groups: ["Forms"],
        category: "Containers"
    },
	configs:[{
		name: 'store',
        type: 'string',
		doc:'数据源'
	},{
		name: 'insertFlag',
        type: 'boolean',
		defaultValue: false,
		doc:'无数据时是否新增'
	},{
		name: 'relationGridPanelId',
        type: 'string',
		doc:'关联的面板id'
	},{
		name: 'relationGridQueryFieldArray',
        type: 'array',
		doc:'关联字段'
	}]
}