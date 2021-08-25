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
		//var temp = 0;
        Ext.each(errorCodes, function (errCode) {
			errMsg = me.getErrorMsg(errCode);
			console.log(errMsg);
            errors.push({
                code: errCode,
                msg: errMsg["ZH"]//Rs.LANG.toUpperCase()]
            });
        });
        win.store.setData(errors);
        win.show();
    },

    getWin: function () {
        var me = this, win = me.msgWindow;
        if (win) return win;
        var store = Ext.create('Ext.data.JsonStore', {
            fields: ['code', 'msg']
        });
        win = Ext.create('Ext.Dialog', {
            //width: 200,
            height: 200,
            layout: 'fit',
            closable: false,
            //closeAction: 'hide',
			defaultFocus: '#itemId',
            //bodyPadding: 30,
            maxWidth: 300,
			//padding:1,
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
				id: 'itemId',
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
		console.log(win.store);
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
		var me = this,
		store = grid.getStore(),
		records = me.records[grid.id],
		record = store.getById(records[0].uuid),
		column = grid.getColumnForField(records[0].checkField[0]),
		editing = grid.findPlugin("gridcellediting");
		editing.startEdit(record,column);
    },

    focusOfCard: function (card, el) {
        el.focus();
    },

    getMarkElsOfGrid: function (grid, errArr) {
        //var record, rowEl,// selectors,
        //    view = grid.getView(),
        //    store = grid.getStore(),
        //    els = new Ext.CompositeElementLite(null, true);
			
        var els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function (item) {
            //selectors = [];
            //record = store.getById(item.uuid);
            //rowEl = Ext.fly(view.getRow(record));
			//Ext.getCmp('myPanelId').getItemAt(1).cells[3].setStyle({background:'yellow'})
			//var rowEl = grid.getItemAt(record.data.ROWNUM_).el;
			//console.log(rowEl);
            Ext.each(item.checkField, function (field) {
                //selectors.push('div[data-componentid='+field +']');
				//var rowNum = Number(record.data.ROWNUM_);
				var rowNum = item.index;
				//var cell = Ext.ComponentQuery.query('#'+field)[rowNum].element;
				var cell = grid.getColumnForField(field).getCells()[rowNum].element;
				els.add(cell);
            });
        });
        return els;
    },

    getMarkElsOfCard: function (card, errArr) {
        var els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function (item) {
            Ext.each(item.checkField, function (field) {
                els.add(card.down('#' + field).inputElement);
            });
        });
        return els;
    },

    markStyle: function (els) {
		Ext.each(els.elements, function(item){
			item.style.background = "#ffdfd7";
		});
        //els.applyStyles({ background: '#ffdfd7', zIndex:"1"});
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