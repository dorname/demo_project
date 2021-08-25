/**
 * @class Rs.ext.grid.column.RsAction
 * @extends Ext.grid.column.Action
 * @author ZanShuangpeng、LiGuangqiao
 * 操作列
 */
Ext.define('Rs.ext.grid.column.RsAction', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.rsactioncolumn',
    configs: {
        /**
         *@cfg {String} addAltText
         *图片元素的代表文字
         */
        addAltText: "",
        /**
         *@cfg {String} addIcon
         *新增操作自定义图标（路径）
         */
        addIcon: "",
        /**
         *@cfg {String} addDisabled
         *新增操作是否可用
         */
        addDisabled: undefined,
        /**
         *@cfg {String} addHidden
         *是否隐藏新增操作
         */
        addHidden: undefined,
        /**
         *@cfg {String} addToolTip
         *新增操作提示
         */
        addToolTip: "",
        /**
         *@cfg {Object} addDefaultValue
         *新增行的默认值设置
         */
        addDefaultValue: {},
        /**
         *@cfg {function} addHandler
         *新增逻辑重定义
         */
        addHandler: function (grid, rowIndex, colIndex, item, e, record, row, defaultValue) {},
        /**
         *@cfg {String} deleteAltText
         *图片元素的代表文字
         */
        deleteAltText: "",
        /**
         *@cfg {String} deleteIcon
         *删除操作自定义图标（路径）
         */
        deleteIcon: "",
        /**
         *@cfg {String} deleteDisabled
         *删除操作是否可用
         */
        deleteDisabled: undefined,
        /**
         *@cfg {String} deleteHidden
         *是否隐藏删除操作
         */
        deleteHidden: undefined,
        /**
         *@cfg {String} addToolTip
         *删除操作提示
         */
        deleteToolTip: "",
        /**
         *@cfg {function} addHandler
         *删除逻辑重定义
         */
        deleteHandler: function (grid, rowIndex, colIndex, item, e, record, row) {}
    },
    text: '操作',
    addDefaultValue: {},
    items: [{}, {}, {}
    ],
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
            if (index >= 4) {
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
            me.initMenu();
            Ext.each(me.items, function (item, index) {
                if (index >= 4) {
                    item.hidden = true;
                }
            });
            me.items[0] = {
                disabled: true
                //hidden: true
            };
            me.items[1] = {
                altText: me.addAltText,
                iconCls: 'addAction-button-item',
                icon: me.addIcon,
                disabled: me.addDisabled,
                hidden: me.addHidden,
                tooltip: me.addToolTip,
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                    me.addHandler(grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue);
                }
            };
            me.items[2] = {
                altText: me.deleteAltText,
                iconCls: 'deleteAction1-button-item',
                icon: me.deleteIcon,
                disabled: me.deleteDisabled,
                hidden: me.deleteHidden,
                tooltip: me.deleteToolTip,
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                    me.deleteHandler(grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue);
                }
            };
            if (me.items.length >= 5) {
                me.items[3] = {
                    iconCls: 'moreAction-button-item',
                    handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                        var itemDom = row.getElementsByClassName("moreAction-button-item")[0];
                        me.Menu.alignTo(itemDom);
						//console.log("itemDom:",itemDom);
                        //避免bind时嵌套死循环
                        Ext.each(me.items, function (selfItem, index) {
                            if (index >= 4) {
                                if (!Ext.isEmpty(selfItem.fn)) {
                                    var handlerFn = Ext.Function.bind(selfItem.fn, this, [grid, rowIndex, colIndex, item, e, record, row], false),
                                    menuItems = me.Menu.items.items;
                                    Ext.each(menuItems, function (menu, index) {
                                        if (selfItem.index === menu.index) {
                                            menu.handler = handlerFn;
                                        }
                                    });
                                }
                                selfItem.hidden = false;                 
                                me.Menu.show();
                            }
                        });
                    }
                };
            }
        })
    },
    /**
     * 新增行逻辑
     * public
     * @method addHandler
     * @params {Ext.view.Table} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     * @params {Object} defaultValue 新增默认值
     */
    addHandler: function (grid, rowIndex, colIndex, item, e, record, row, defaultValue) {
        var store = grid.getStore();
        var temp = {},
        rowNum = rowIndex + 1,
        addDefaultValue = Ext.Object.merge(temp, defaultValue);
        store.insert(rowNum, addDefaultValue);
    },
    /**
     * 删除行逻辑
     * public
     * @method addHandler
     * @params {Ext.view.Table} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     */
    deleteHandler: function (grid, rowIndex, colIndex, item, e, record, row) {
        if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
            record.deleteFlag = '';
            //row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src = '../../../resources/images/del_nor.png'
			Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction2-button-item','deleteAction1-button-item');
        } else {
            if (!Ext.isEmpty(record.crudState) && record.crudState == 'C' && record.phantom) {
                if (grid.store.data.length > 1) {
                    grid.store.remove(record);
                }
            } else {
                record.deleteFlag = 'D';
                //row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src = '../../../resources/images/del_press.png'
				Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction1-button-item','deleteAction2-button-item');
            }

        }
    }
});
