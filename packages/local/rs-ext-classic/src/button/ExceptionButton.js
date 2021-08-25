/**
 * @class Rs.ext.button.ExceptionButton
 * @extends Ext.button.Button
 * @author LiGuangqiao
 * ExceptionButton
 */
Ext.define('Rs.ext.button.ExceptionButton', {
    alias: 'widget.exception-button',
    extend: 'Ext.button.Button',
    configs: {
        /**
         *@cfg {function} exceptionHandler
         *例外信息按钮的处理拓展逻辑自定义
         */
        exceptionHandler: function () {},
        /**
         *@cfg {string} pageCode
         *例外信息所属的页面编码
         */
        pageCode: '',
        /**
         *@cfg {string} queryUrl
         *例外信息查询的后台接口
         */
        queryUrl: '',
		/**
         *@cfg {string} queryProxyType
         *代理类型
         */
		queryProxyType:'',
        /**
         *@cfg {string} displayFields
         *显示字段
         */
        displayFields: '',
        /**
         *@cfg {string} buttonText
         *按钮文本
         */
        buttonText: ''
    },
    buttonIconCls: 'exception-button',
    queryUrl: '',
	queryProxyType:'rest',
    //queryUrl:'/business/sys/test8888/sys-menu-tree/crud/',
    pageCode: '',
    displayFields: 'excInfo',
    //displayFields:'sysCode',
    isButton: true,
    buttonText: '例外信息',
    initComponent: function () {
        var me = this;
        me.callParent();
        me.initExceptionPanel();
        me.on('afterrender', function (myself) {
            myself.setText(myself.buttonText);
            myself.setIconCls(myself.buttonIconCls);
            myself.setHandler(function () {
                myself.exceptionHandler();
                myself.exceptionWindow.show();
            });
        });
    },
    initExceptionPanel: function () {
        var me = this,
        model = Ext.create('Ext.data.Model', {
            requires: [
                'Ext.data.field.Field'
            ],
            fields: [{
                    name: me.displayFields
                }
            ]
        }),
        store = Ext.create('Ext.data.Store', {
            storeId: 'exceptionStore',
            autoLoad: true,
            model: model,
            proxy: {
                type: me.queryProxyType,
                url: me.queryUrl,
                extraParams: {
                    pagCode: me.pageCode,
                    companyCode: '00'
                },
                reader: {
                    type: 'json',
                    rootProperty: 'data.records'
                }
            }
        }),
        exceptionWindow = Ext.create('Ext.window.Window', {
            title: '例外信息',
            closable: false,
            width: 750,
			height:208,
            layout: 'fit', //至少得给定一个宽度
			alignTarget:me,
			defaultAlign:'tl-bl',
            listeners: {
                'focusleave': function (myself) {
                    myself.hide();
                }
            }
        }),
        exceptionPanel = Ext.create('Ext.grid.Panel', {
            scrollable: true,
            store: store,
			height:'100%',
			width:'100%',
            columns: [{
                    xtype: 'gridcolumn',
                    dataIndex: me.displayFields,
					width:'100%'
                }
            ]
            //floating:true
        });
        exceptionWindow.add(exceptionPanel);
        me.exceptionWindow = exceptionWindow;
        me.store = store;
        me.exceptionPanel = exceptionPanel;
    },
    exceptionHandler: function () {
        //  console.log("exceptionHandler");
    }

});
