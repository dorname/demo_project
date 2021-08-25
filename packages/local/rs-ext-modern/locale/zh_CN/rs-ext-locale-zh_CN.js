/**
 * Simplified Chinese translation
 */
Ext.onReady(function() {
    var parseCodes;

    if (Ext.Date) {
        Ext.Date.monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月",
                               "九月", "十月", "十一月", "十二月"];

        Ext.Date.dayNames = ["日", "一", "二", "三", "四", "五", "六"];

        Ext.Date.formatCodes.a = "(this.getHours() < 12 ? '上午' : '下午')";
        Ext.Date.formatCodes.A = "(this.getHours() < 12 ? '上午' : '下午')";

        parseCodes = {
            g: 1,
            c: "if (/(上午)/i.test(results[{0}])) {\n" +
                "if (!h || h == 12) { h = 0; }\n" +
                "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
            s: "(上午|下午)",
            calcAtEnd: true
        };

        Ext.Date.parseCodes.a = Ext.Date.parseCodes.A = parseCodes;
    }

    if (Ext.util && Ext.util.Format) {
        Ext.apply(Ext.util.Format, {
            thousandSeparator: ',',
            decimalSeparator: '.',
            currencySign: '\u00a5',
            // Chinese Yuan
            dateFormat: 'y年m月d日'
        });
    }
});

Ext.define('Rs.ext.locale.zh_CN.Panel', {
    override: 'Ext.Panel',

    config: {
        standardButtons: {
            ok: {
                text: '确定'
            },
            abort: {
                text: '退出'
            },
            retry: {
                text: '重试'
            },
            ignore: {
                text: '忽视'
            },
            yes: {
                text: '是'
            },
            no: {
                text: '没有'
            },
            cancel: {
                text: '取消'
            },
            apply: {
                text: '应用'
            },
            save: {
                text: '保存'
            },
            submit: {
                text: '提交'
            },
            help: {
                text: '救命'
            },
            close: {
                text: '关闭'
            }
        },
        closeToolText: '关闭面板'
    }
});

Ext.define('Rs.ext.locale.zh_CN.grid.plugin.Editable', {
	override: 'Ext.grid.plugin.Editable',
	
	config: {
		toolbarConfig: {
            xtype: 'titlebar',
            docked: 'top',
            items: [{
                xtype: 'button',
                ui: 'alt',
                text: '取消',
                align: 'left',
                action: 'cancel'
            }, {
                xtype: 'button',
                ui: 'alt',
                text: '提交',
                align: 'right',
                action: 'submit'
            }]
        },
	},
	
	onTrigger: function(grid, location) {
		var me = this;
		me.callParent(arguments);
		if (me.getEnableDeleteButton()) {
			var del = me.form.query('button[text=Delete]');
			if (!Ext.isEmpty(del[0])) {
				del[0].setText('删除');
			}
		}
	}
});