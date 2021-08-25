/**
 * @class Rs.ext.grid.column.RsSplitColumn
 * @extends Ext.grid.column.Action
 * @author ZanShuangpeng
 * 拆分列
 */
Ext.define('Rs.ext.grid.column.RsSplitColumn', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.rssplitcolumn',
    configs: {
		/**
         *@cfg {String} addIcon
         *拆分操作自定义图标（路径）
         */
        splitIcon: "",
        /**
         *@cfg {Array} splictFields
         *拆分字段数组
         */
        splictFields: [],
        /**
         *@cfg {String} assignmentOld
         *原数据行赋值字段
         */
        assignmentOld: {},
        /**
         *@cfg {String} assignmentNew 
         *新数据行赋值字段
         */
        assignmentNew: {}
    },
    //text: Ext.isEmpty(splitText) ? splitText :'addAction-button-item',
    items: [{}, {}],
	width:80,
    initMenu: function () {
        var me = this;
        var Menu = Ext.create('Ext.menu.Menu', Ext.apply({}, {
                    width: 32,
                    minWidth: 0,
                    plain: true,
                    floating: true,
                    hidden: true,
                    renderTo: Ext.getBody()
                }));
        me.Menu = Menu;
        Ext.each(me.items, function (selfItem, index) {
            if (index >= 3) {
                if (!Ext.isEmpty(selfItem)) {
                    selfItem.index = index;
                    me.Menu.add(selfItem);
                    if (Ext.isEmpty(selfItem.fn)) {
                        selfItem.fn = selfItem.handler;
                    }
                }
                me.Menu.on('hide', function () {
                    selfItem.hidden = true;
                });
            }
        });
    },
    initComponent: function () {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.on('afterrender', function () {
            var grid = me.up("grid");
            me.initMenu();
            Ext.each(me.items, function (item, index) {
                if (index >= 3) {
                    item.hidden = true;
                }
            });
            me.items[0] = {
                disabled: true
            };
            me.items[1] = {
                iconCls: Ext.isEmpty(me.splitIcon) ? 'addAction-button-item' :me.splitIcon,
                //tooltip: me.addToolTip,
                handler: function (view, rowIndex, colIndex, item, e, record, row) {
					me.splictHandler(view, rowIndex, colIndex, item, e, record, row);
                }
            };
        })
    },
	splictHandler :function (view, rowIndex, colIndex, item, e, record, row){
		var me = this,
			store = view.grid.getStore(),
			temp = {};
		if(Ext.isEmpty(me.splictFields)){
			for(var name in record.data){
				if(name != store.model.idProperty && name != 'ROWNUM_'){
					temp[name] = record.data[name]
				}
			}
		}else{
			Ext.each(me.splictFields,function(field){
				temp[field] = record.data[field]
			});
		}
		rowNum = rowIndex + 1,
        store.insert(rowNum, temp);
		if(!Ext.isEmpty(me.assignmentOld)){
			for(var name in me.assignmentOld){
				record.set(name,record.data[me.assignmentOld[name]]);
			}
		}
		if(!Ext.isEmpty(me.assignmentNew)){
			for(var name in me.assignmentNew){
				var recordNew = store.getAt(rowNum);
				recordNew.set(name,record.data[me.assignmentNew[name]]);
			}
		}
	}
});
