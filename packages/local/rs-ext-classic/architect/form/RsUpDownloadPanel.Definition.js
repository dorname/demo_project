{
    classAlias: "widget.rs-upload-download-panel",
    className: "Rs.ext.form.UpDownloadPanel", 
	inherits: "Ext.window.Window",
    autoName: "RsUpDownloadPanel", 

    toolbox: {
        name: "RsUpDownloadPanel",
		groups: ["Forms"],
        category: "Windows"
    },
	configs:[{
		name:'fileId',
		type:'string',
		doc:'唯一索引'
	},{
		name: 'submitUrl',
        type: 'string',
        doc: '后台接口地址(url)'
	},{
		name: 'submitParams',
        type: 'object',
        doc: '参数对象（除上传文件外）'
	},{
		name: 'fileUploadName',
        type: 'string',
        doc: '上传文件对应的参数名'
	},{
		name:'isMultiple',
		type:'boolean',
		doc:'多文件上传开关（默认false：只能单文件上传）'
	},{
		name:'uploadSuccess',
		type:'function',
		doc:'上传成功的响应操作'
	},{
		name:'uploadFailure',
		type:'function',
		doc:'上传成功的响应操作'
	}]
}