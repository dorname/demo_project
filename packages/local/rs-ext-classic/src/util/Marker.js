Ext.define('Rs.ext.util.Marker', {
    singleton: true,
    alternateClassName: ['Rs.Marker'],
	
	getErrorMsg :function(err_code){
		var params = {}, errowMsg = {};
		
		params.sql = "select err_code,err_des_c as ZH,err_des_e as EN from sys_err_info where err_code = '" + err_code + "'";

		Ext.Ajax.request({
			url: '/base/sql/excute',
			jsonData: params,
			async:false,
			method:'POST',
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success){
					errowMsg = obj.data[0];
				} else {
					Ext.Msg.alert("系统提示",obj.mesg);
				}
			},
			failure: function(response, opts) {
				Ext.Msg.alert("系统提示","服务器未连接");
			}
		});
		return errowMsg;
	},

    /**
     * 显示错误弹窗信息
     */
    showMsg: function (errorCodes) {
        var me = this, errMsg, errors = [], win = me.getWin();
        win.show();
        Ext.each(errorCodes, function (errCode) {
			errMsg = me.getErrorMsg(errCode);
            errors.push({
                code: errCode,
                msg: errMsg[Rs.LANG.toUpperCase()]
            });
        });
        win.store.setData(errors);
    },

    getWin: function () {
        var me = this, win = me.msgWindow;
        if (win) return win;
        var store = Ext.create('Ext.data.JsonStore', {
            fields: ['code', 'msg']
        });
        win = Ext.create('Ext.window.Window', {
            width: 420,
            height: 280,
            layout: 'fit',
            closable: false,
            closeAction: 'hide',
			listeners: {
				'focusleave': function (win) { win.hide(); },
                'hide': function () { 
					//me.focusFirst(); 
					Ext.defer(me.focusFirst, 10, me);
				}
			},

            items: [{
                xtype: 'grid',
                border: false,
                header: false,
                store: store,
                columns: [{
                    width: 50,
                    dataIndex: 'code'
                }, {
					flex: 1,
                    dataIndex: 'msg'
                }]
            }]
        });
        win.store = store;
        me.msgWindow = win;
        return win;
    },

    /**
     * 不符合要求的单元格填色
     */
     mark: function (parameters) {
        var me = this, errorCodes = {};
        me.records = {}, me.panelIds = [], me.markerEls = {};

        if (!Ext.isArray(parameters)) parameters = [parameters];
        
        Ext.each(parameters, function (params, idx) {
            var els,
                id = params.panelId,
                panel = Ext.getCmp(id),
                errArr = params.errArr,
                errorMsg = params.errorMsg;

            Ext.each(errorMsg, function (errorCode) {
                errorCodes[errorCode] = errorCode;
            });

            if (!panel) return;
            me.panelIds.push(panel);

            me.unmark(panel);

            if (panel.isXType('grid')) {
                els = me.getMarkElsOfGrid(panel, errArr);
                //me.focusOfGrid(panel, els.first(), errArr);
            } else {
                els = me.getMarkElsOfCard(panel, errArr);
                //me.focusOfCard(panel, els.first());
            }
            
            me.markerEls[id] = els;
            panel.invalidEls = els;
            me.records[id] = errArr;
            me.markStyle(els);
        });

        var codes = Ext.Object.getKeys(errorCodes);
        if (Ext.isEmpty(codes)) {
            //me.focusFirst();
			Ext.defer(me.focusFirst, 10, me);
        } else {
            me.showMsg(codes);
        }
    },

    focusFirst: function () {
        var me = this, id, els;
        Ext.each(me.panelIds, function (panel) {
            id = panel.getId();
            els = me.markerEls[id];
            if (els.getCount()) {
                me.focusOnEl(panel, els.first());
                return false;
            }
        });
    },

    focusOnEl: function (panel, el) {
        var me = this;
        if (!Ext.isEmpty(el)) {
            if (panel.isXType('grid')) {
                me.focusOfGrid(panel, el);
            } else {
                me.focusOfCard(panel, el);
            }
        }
    },

    focusOfGrid: function (grid, el) {
        var me = this, position,
            view = grid.getView(),
            store = grid.getStore(),
            records = me.records[grid.id],
			id = store.getModel().idProperty,
            header = view.getHeaderByCell(el),
            record = store.getById(records[0][id]),
            editing = grid.getPlugin('cellediting');
		if (record) {
			position = view.getPosition(record, header);
			editing.startEditByPosition(position);
		}
    },

    focusOfCard: function (card, el) {
        el.focus();
    },

    getMarkElsOfGrid: function (grid, errArr) {
        var record, rowEl, selectors,
            view = grid.getView(),
            store = grid.getStore(),
			id = store.getModel().idProperty,
            els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function (item) {
            selectors = [];
            record = store.getById(item[id]);
			if (record) {
				rowEl = Ext.fly(view.getRow(record));
				if (rowEl) {
					Ext.each(item.checkField, function (field) {
						selectors.push('td[data-columnid='+field +']');
					});
					els.add(rowEl.select(selectors.join(',')));
				}
			}
        });
        return els;
    },

    getMarkElsOfCard: function (card, errArr) {
        var els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function (item) {
            Ext.each(item.checkField, function (field) {
                els.add(card.down('#' + field).inputEl);
            });
        });
        return els;
    },

    markStyle: function (els) {
        els.applyStyles({ background: '#ffdfd7' });
    },

    /**
     * 取消填色标记
     */
    unmark: function (panel) {
        var els = panel.invalidEls;
        if (!Ext.isEmpty(els)) {
            els.applyStyles({ background: 'none' });
        }
        panel.invalidEls = null;
    }
});