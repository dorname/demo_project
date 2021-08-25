{
    classAlias: "store.frontcachedstore",
    className: "Rs.ext.data.FrontCachedStore", 
    inherits: "Ext.data.Store",
    autoName: "MyFrontCachedStore", 

    toolbox: {
        name: "FrontCachedStore",
		groups: ["Data"],
        category: "Data Stores"
    },
	configs:[{
		name:"gridPanelId",
		type:"string",
		doc:"所属gridPanel的ID"
	},{
		name:"isCacheDataToFront",
		type:"boolean",
		defaultValue:false,
		doc:"是否缓存数据到前台并使用，true则缓存，默认为false"
	},{
		name:"paramsFormStrict",
		type:"boolean",
		defaultValue:true,
		doc:"请求的参数是否按照规范严格要求例如：params: {参数1:参数1的值,参数2:参数2的值}"
	}]
}