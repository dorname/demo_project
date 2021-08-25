{
    classAlias: "widget.exception-button",
    className: "Rs.ext.button.ExceptionButton",
    inherits: "Ext.button.Button",
    autoName: "MyExceptionButton",

    toolbox: {
        name: "ExceptionButton", 
        groups: ["Buttons"],
        category: "Buttons Standard"
    },
    configs: [{
            name: 'exceptionHandler',
            type: 'function',
            doc: "例外信息处理逻辑"
        }, {
            name: 'pageCode',
            type: 'string',
            doc: '页面编码，面板根据页面编码显示所属页面的例外信息'
        }, {
            name: 'queryUrl',
            type: 'string',
            doc: '接口地址'
        }, {
            name: 'queryProxyType',
            type: 'string',
            defaultValue: 'rest',
            editor: 'options',
            options: ["rest",
			"ajax"],
            doc: '代理类型'
        }, {
            name: 'displayFields',
            type: 'string',
            defaultValue: 'excInfo',
            doc: '显示字段'
        }, {
            name: 'buttonText',
            type: 'string',
            defaultValue: '例外信息',
            doc: '按钮文本'
        }
    ]
}
