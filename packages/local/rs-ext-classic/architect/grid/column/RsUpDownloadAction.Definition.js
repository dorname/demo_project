{
    classAlias: "widget.rsupdownloadactioncolumn",
    className: "Rs.ext.grid.column.RsUpDownloadAction",
    inherits: "Ext.grid.column.Action",
    autoName: "RsUploadAction Column",

    toolbox: {
        name: "RsUpDownloadAction Column",
        groups: ["Grids"],
        category: "Grid Columns"
    },
    configs: [{
            name: 'uploadAltText',
            type: 'string',
            doc: '图片元素的代表文字'
        }, {
            name: 'uploadIcon',
            type: 'string',
            doc: '上传操作自定义图标(图标路径)'
        }, {
            name: 'uploadDisabled',
            type: 'boolean',
            doc: '上传操作是否可用'
        }, {
            name: 'uploadHidden',
            type: 'boolean',
            doc: '是否隐藏上传操作'
        }, {
            name: 'uploadToolTip',
            type: 'string',
            defaultValue: "上传文件",
            doc: '上传操作提示'
        }, {
            name: 'uploadParams',
            type: 'object',
            doc: '向后台接口传递的参数对象（注：此处不设上传文件对应的参数名及参数值）'
        }, {
            name: 'uploadFileParam',
            type: 'string',
            doc: '上传文件对应的参数名（必须设置且应与后台接收的参数名保持一致）'
        },{
            name: 'limitFileSize',
            type: 'string',
			defaultValue: '100m',
            doc: '上传文件大小的上限（格式例如："100m" m,k,g(不区分大小写)分别代表MB,KB,GB,注：默认单位为byte "100" 代表100 byte）'
        },{
            name: 'fileAccept',
            type: 'string',
			defaultValue: '/*',
            doc: '可上传的文件类型（格式例如：image/png（文件类型）或者 /png或.png 注多个类型之间用逗号隔开如image/*,application/*）'
        },{
            name: 'isMultiple',
            type: 'boolean',
            defaultValue: false,
            doc: '多文件上传开关'
        },{
            name: 'synchronizedToSavePlugin',
            type: 'boolean',
            defaultValue: false,
            doc: '上传逻辑同步到点击保存插件的保存按钮'
        },{
            name: 'panelWithSavePluginId',
            type: 'string',
            defaultValue: "",
            doc: '保存插件所在面板的Id'
        },{
            name: 'savePluginPtype',
            type: 'string',
			defaultValue: "saveplugin",
            doc: '保存插件别名'
        },{
            name: 'submitUrl',
            type: 'string',
            doc: '上传的后台接口地址'
        }, {
            name: 'uploadHandler',
            type: 'function',
            params: [{
                    "name": "me",
                    "type": "object"
                }, {
                    "name": "uploadParams",
                    "type": "object"
                }, {
                    "name": "uploadFileParam",
                    "type": "string"
                }, {
                    "name": "submitUrl",
                    "type": "string"
                }, {
                    "name": "isMultiple",
                    "type": "boolean"
                }, {
                    "name": "obj",
                    "type": "object"
                }
            ],
            doc: '上传逻辑重定义'
        }, {
            name: 'uploadSuccess',
            type: 'function',
            params: [{
                    "name": "responseText",
                    "type": "string"
                },{
                    "name": "rowObj",
                    "type": "object"
                }
            ],
            doc: '上传成功回调函数'
        }, {
            name: 'uploadFailure',
            type: 'function',
            params: [{
                    "name": "responseText",
                    "type": "string"
                },{
                    "name": "rowObj",
                    "type": "object"
                }
            ],
            doc: '上传失败回调函数'
        }
    ]
}
