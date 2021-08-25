{
    classAlias: "widget.thumb-updownload-action-column",
    className: "Rs.ext.grid.column.ThumbUpDownloadAction",
    inherits: "Ext.grid.column.Action",
    autoName: "ThumbUpDownloadAction Column",

    toolbox: {
        name: "ThumbUpDownloadAction Column",
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
            name: 'gridStoreId',
            type: 'string',
            doc: '所在grid面板的storeId'
        }, {
            name: 'thumbField',
            type: 'string',
            doc: '缩略图存放的字段名称'
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
            name: 'thumbUploadSuccess',
            type: 'function',
            params: [{
                    "name": "rowIndex",
                    "type": "string"
                },{
                    "name": "thumbData",
                    "type": "string"
                }
            ],
            doc: '缩略图上传成功回调函数'
        },{
            name: 'thumbUploadFailure',
            type: 'function',
            doc: '缩略图失败成功回调函数'
        }
    ]
}
