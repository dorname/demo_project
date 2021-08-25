{
    classAlias: "widget.rsstore",
    className: "Rs.ext.data.RsStore", 
    inherits: "Ext.data.Store",
    autoName: "RsStore", 

    toolbox: {
        name: "RsStore",
		groups: ["Data"],
        category: "Data Stores"
    },
	configs:[{
		name: 'checkBeforeLoad',
        type: 'boolean',
		defaultValue: true,
		doc:'是否触发load前验证(默认为true)'
	},{
		name: 'defaultFieldValue',
        type: 'object',
		doc:'默认值字段'
	}]
}