/**
 * 页面设置（偏好按钮）
 * 1.页面设置是面向页面的，页面中只有一个页面设置按钮。
 * 2.偏好的内容包括全局的语言选择，列表（grid）的页面大小及查询面板中的查询条件。
 * 3.支持页面偏号的保存，清除。
 * 注：
 *     具体的页面外观设计参照：云平台前台界面样式统一化设计-4.0
 */
Ext.define('Rs.ext.button.PrefButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.pref-button',
    iconCls: 'rs-icon-cog',

    initComponent: function() {
        var me = this;
        me.callParent();
        me.on('click', me.statics().showPrefHandler);
    },

    translations: {
        '': { zh: '页面设置', en: 'Page Settings' }
    }
}, function (Cls) {
    var a = function (combox, record) {
        var vf = combox.valueField, 
			lang = record.get(vf), 
			comps = []; //pref, pref.btn
        Ext.iterate(Rs.MULTILANGUAGE, function(id, ctn) {
			var comp = Ext.getCmp(id);
            comp && comps.push(comp);
        });

        Ext.each(comps, function (comp) {
            comp.translate(lang);
        });
		Rs.LANG = lang;
    };
	
    var pref =  Ext.create('Ext.window.Window', {
		closable: false,
        translations: {
            '': 			{ zh: '页面设置', 		en: 'Preference Settings' 	},
            '#lang': 		{ zh: '语言', 			en: 'Language' 				},
            '#pagesize': 	{ zh: '当页数据', 		en: 'Page Size' 			},
            '#test': 		{ zh: '条', 			en: 'Items' 				},
            '#conditions': 	{ zh: '查询条件', 		en: 'Query Conditions' 		},
            '#save': 		{ zh: '保存页面偏好', 	en: 'Save' 					},
            '#ok': 			{ zh: '确定', 			en: 'OK' 					}
        },
		
		listeners: {
			'focusleave': function (win) { win.hide(); }
		},
        
        items: [{
            xtype: 'form',
            border: false,
            bodyPadding: 20,

            layout: {
                type: 'vbox',
                pack: 'center',
                align: 'center'
            },

            defaults: {
                width: 280,
                labelAlign: 'right'
            },
    
            fbar: ['->', {
                type: 'button',
                itemId: 'ok',
				handler: function () { pref.hide(); }
            }, '->'],
            
            items: [{
                xtype: 'combobox',
                itemId: 'lang',
				value: Rs.LANG,
                store: [['zh', '中文'], ['en', 'English']],
                listeners: { 'select': a }
            }/*, {
                xtype: 'fieldcontainer',
                itemId: 'pagesize',
                layout: 'hbox',
                items: [{
                    xtype: 'numberfield',
                    flex: 1
                }, {
                    xtype: 'splitter'
                }, {
                    xtype: 'displayfield',
                    itemId: 'test',
                    labelSeparator: ''
                }]
            }, {
                xtype: 'combobox',
                itemId: 'conditions'
            }, {
                xtype: 'checkboxfield',
                itemId: 'save'
            }*/]
        }]
    });

    Cls.addStatics({
        showPrefHandler: function(btn) {
            pref.btn = btn;
            pref.show();
        }
    });
});