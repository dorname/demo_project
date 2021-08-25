/**
 * @class Rs.ext.grid.column.ActionRestricted
 * @extends Ext.grid.column.Action
 * @author ZanShuangpeng、LiGuangqiao
 * 操作列
 */
Ext.define('Rs.ext.grid.column.ActionRestricted', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.rs-action-column-restricted',
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
         *@cfg {function} extraAddHandler
         *额外新增逻辑
         */
        extraAddHandler: function (thisColumn, grid, rowIndex, colIndex, item, e, record, row) {},
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
         *@cfg {function} deleteHandler
         *删除逻辑重定义
         */
        deleteHandler: function (grid, rowIndex, colIndex, item, e, record, row, pluginsObj) {},
        /**
         *@cfg {function} extraRemoveHandler
         *额外删除逻辑
         */
        extraRemoveHandler: function (thisColumn, grid, rowIndex, colIndex, item, e, record, row) {}
    },
    text: '操作',
    addFlag: "add",
    removeFlag: "remove",
    pluginsObj: {},
    gridPluginsArray: undefined,
    addDefaultValue: {},
    queryAddValue: {},
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
            var grid = me.up("grid"),
            addButton = {},
            removeButton = {};
            if (Ext.isEmpty(me.gridPluginsArray)) {
                me.gridPluginsArray = grid.getPlugins();
                var obj = {};
                Ext.each(me.gridPluginsArray, function (pluginObj) {
                    if ("relatestatecontrolf" === pluginObj.ptype) {
                        obj.relateStateControlF = pluginObj;
                    }
                    if ("deleteHead" === pluginObj.ptype) {
                        obj.deleteHead = pluginObj;
                    }
                    if ("statecontrolf" === pluginObj.ptype) {
                        obj.stateControlF = pluginObj;
                    }
                    if ("rowediting" === pluginObj.ptype) {
                        obj.editPlugin = pluginObj;
                    }
                    if ("cellediting" === pluginObj.ptype) {
                        obj.editPlugin = pluginObj;
                    }
                });
            }
            me.pluginsObj = obj;
            me.initMenu();
            Ext.each(me.items, function (item, index) {
                if (index >= 4) {
                    item.hidden = true;
                }
            });
            me.items[0] = {
                disabled: true
            };
            me.items[1] = {
                altText: me.addAltText,
                iconCls: 'addAction-button-item',
                icon: me.addIcon,
                disabled: me.addDisabled,
                hidden: me.addHidden,
                tooltip: me.addToolTip,
                handler: function (view, rowIndex, colIndex, item, e, record, row) {
                    me.extraAddHandler(me, view.grid, rowIndex, colIndex, item, e, record, row);
                    var store = view.grid.getStore();
                    //只有当前是缓存store时才做刷新操作目的是要保证一开始就在cachedStore上操作
                    if (!Ext.isEmpty(store.isFrontCachedStore)) {
                        if (store.isDynamicStore && store.isCacheDataToFront) {
                            me.refresh(store);
                        }
                    }
                    if (!Ext.isEmpty(view.grid.relationGridPanelId) && view.grid.clickAutoLoadRelationGridPanel) {
                        view.grid.fireEvent('rowclick', view.grid, record, row, rowIndex, null, {}, {
                            callback: function () {
                                var increasable = true;
                                if (!Ext.isEmpty(me.pluginsObj.editPlugin)) {
                                    Ext.Object.each(me.pluginsObj, function (key, itemObj, objItSelf) {
                                        if (key === "relateStateControlF") {
                                            increasable = increasable && (itemObj.relateStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                        }
                                        /*
                                        if (key === "stateControlF") {
                                        increasable = increasable && (itemObj.gridStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                        }
                                         */
                                    });
                                }
                                return increasable;
                            },
                            add: function (increasable) {
                                if (increasable) {
                                    me.addHandler(view.grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue, me.queryAddValue, me);
                                }
                            }
                        }, me.addFlag);
                    } else {
                        //无关联面板的分支或者有关联面但下帧不通过点击事件去加载数据的分支
                        var increasable = true;
                        if (!Ext.isEmpty(me.pluginsObj.editPlugin)) {
                            Ext.Object.each(me.pluginsObj, function (key, itemObj, objItSelf) {
                                /*
                                if (key === "stateControlF") {
                                increasable = increasable && (itemObj.gridStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                }
                                 */
                                //针对有关联面但下帧不通过点击事件去加载数据的分支
                                if (key === "relateStateControlF") {
                                    increasable = increasable && (itemObj.relateStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                }
                            });
                        }
                        if (increasable) {
                            me.addHandler(view.grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue, me.queryAddValue, me);
                        }
                    }
                }
            };
            me.items[2] = {
                altText: me.deleteAltText,
                iconCls: 'deleteAction1-button-item',
                icon: me.deleteIcon,
                disabled: me.deleteDisabled,
                hidden: me.deleteHidden,
                tooltip: me.deleteToolTip,
                handler: function (view, rowIndex, colIndex, item, e, record, row) {
                    me.extraRemoveHandler(me, view.grid, rowIndex, colIndex, item, e, record, row);
                    var store = view.grid.getStore();
                    if (!Ext.isEmpty(store.isFrontCachedStore)) {
                        if (store.isCacheDataToFront) {
                            store.loadPage(store.currentPage, {
                                isLoadRelationGridPanel: false,
                                callback: function () {
                                    me.deleteHandler(view.grid, rowIndex, colIndex, item, e, record, row, me.pluginsObj, me.removeFlag, me);
                                }
                            });
                        } else {
                            //分支说明：当前面板数据不缓存到前台却使用了前台缓存存储frontCachedStore时
                            me.deleteHandler(view.grid, rowIndex, colIndex, item, e, record, row, me.pluginsObj, me.removeFlag, me);
                        }
                    } else {
                        //分支说明：当前面板没用缓存数据存储时
                        me.notCachedDeleteHandler(view.grid, rowIndex, colIndex, item, e, record, row, me.pluginsObj, me);
                    }
                }
            };
            if (me.items.length >= 5) {
                me.items[3] = {
                    iconCls: 'moreAction-button-item',
                    handler: function (view, rowIndex, colIndex, item, e, record, row) {
                        var itemDom = row.getElementsByClassName("moreAction-button-item")[0];
                        me.Menu.alignTo(itemDom);
                        //避免bind时嵌套死循环
                        Ext.each(me.items, function (selfItem, index) {
                            if (index >= 4) {
                                if (!Ext.isEmpty(selfItem.fn)) {
                                    var handlerFn = Ext.Function.bind(selfItem.fn, this, [view, rowIndex, colIndex, item, e, record, row], false),
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
     * 缓存面板刷新页面函数
     * public
     * @method refresh
     * @params {Ext.data.Store} store
     */
    refresh: function (store) {
        store.loadPage(store.currentPage, {
            isLoadRelationGridPanel: false
        });
    },
    /**
     * 额外的新增行逻辑
     * public
     * @method extraAddHandler
     * @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     * @params {Ext.grid.Panel} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     */
    extraAddHandler: function (thisColumn, grid, rowIndex, colIndex, item, e, record, row) {
        //thisColumn.addDefaultValue = {menuCode: Math.random()};
        //console.log("item",thisColumn);
    },
    /**
     * 新增行逻辑
     * public
     * @method addHandler
     * @params {Ext.grid.Panel} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     * @params {Object} defaultValue 新增默认值
     * @params {Object} queryAddValue 关联查询默认值
     * @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     */
    addHandler: function (grid, rowIndex, colIndex, item, e, record, row, defaultValue, queryAddValue, thisColumn) {
        var temp = {},
        tempAddValue,
        rowNum = rowIndex + 1,
        store = grid.getStore(),
        tempAddValue = Ext.Object.merge(temp, defaultValue),
        addDefaultValue = Ext.Object.merge(tempAddValue, queryAddValue),
        nextRecord;
        store.insert(rowNum, addDefaultValue);
        /*
        if (store.getDynamicStore().isCacheDataToFront) {
        store.loadPage(store.currentPage, {
        isLoadRelationGridPanel: false
        });
        }*/
        nextRecord = grid.getStore().getRange()[rowNum];
        //grid.fireEvent('rowclick', grid, nextRecord, row, rowNum);
        grid.blur();
        grid.getSelectionModel().select(record);
    },
    /**
     * 场景1：当前store并非前台数据缓存store
     * 场景2：当前store为前台数据缓存store但isCacheDataToFront属性置为false(即不将数据缓存到前台时)
     * 在以上场景下的删除逻辑
     * public
     * @method notCachedDeleteHandler
     * @params {Ext.grid.Panel} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     * @params {Object} pluginsObj grid插件对象集
     */
    notCachedDeleteHandler: function (grid, rowIndex, colIndex, item, e, record, row, pluginsObj, thisColumn) {
        if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
            record.deleteFlag = '';
            thisColumn.iconChange(row, "reset");
        } else {
            if (!Ext.isEmpty(record.crudState) && record.crudState == 'C' && record.phantom) {
                if (grid.store.data.length > 1) {
                    grid.store.remove(record);
                    var preRecord = grid.getStore().getRange()[rowIndex - 1],
                    rowNum = rowIndex - 1;
                    if (rowIndex === 0) {
                        preRecord = grid.getStore().getRange()[rowIndex];
                        rowNum = rowIndex;
                    }
                    grid.fireEvent('rowclick', grid, preRecord, row, rowNum);
                    grid.blur();
                    grid.getSelectionModel().select(preRecord);
                }
            } else {
                var deletable = true;
                if (!Ext.isEmpty(pluginsObj.editPlugin)) {
                    Ext.Object.each(pluginsObj, function (key, itemObj, objItSelf) {
                        if (key === "stateControlF") {
                            deletable = deletable && (itemObj.gridStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                        }
                    });
                }
                if (deletable) {
                    record.deleteFlag = 'D';
                    thisColumn.iconChange(row, "red");
                }

            }

        }
    },
    iconChange: function (row, changeFlag) {
        if (changeFlag === "red") {
            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
        }
        if (changeFlag === "reset") {
            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
        }
    },
    /**
     * 额外的删除行逻辑
     * public
     * @method extraRemoveHandler
     * @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     * @params {Ext.grid.Panel} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     */
    extraRemoveHandler: function (thisColumn, grid, rowIndex, colIndex, item, e, record, row) {},
    /**
     * 删除行逻辑
     * public
     * @method deleteHandler
     * @params {Ext.grid.Panel} grid grid列表对象
     * @params {Number} rowIndex 当前记录行号
     * @params {Number} colIndex 当前记录列号
     * @params {Object} item 当前操作按钮对象
     * @params {Event} e 事件
     * @params {Ext.data.Model} record 当前行记录
     * @params {HTMLElement} row 行dom结构
     * @params {Object} pluginsObj grid插件对象集
     * @params {String} removeFlag 传递给关联面板的删除标记
     * @params {Object} pluginsObj grid插件对象集
     * @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     */
    deleteHandler: function (grid, rowIndex, colIndex, item, e, record, row, pluginsObj, removeFlag, thisColumn) {
        var store = grid.getStore();
        if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
            record.deleteFlag = '';
            thisColumn.iconChange(row, "reset");
            if (store.isCacheDataToFront) {
                thisColumn.refresh(store);
            }
        } else {
            if (!Ext.isEmpty(record.crudState) && record.crudState == 'C' && record.phantom) {
                if (grid.getStore().data.length >= 1) {
                    grid.getStore().remove(record);
                    if (store.isCacheDataToFront) {
                        thisColumn.refresh(store);
                    }
                    if (!Ext.isEmpty(grid.relationGridPanelId)) {
                        var preRecord = grid.getStore().getRange()[rowIndex - 1],
                        rowNum = rowIndex - 1;
                        if (rowIndex === 0) {
                            preRecord = grid.getStore().getRange()[rowIndex];
                            rowNum = rowIndex;
                        }
                        grid.fireEvent('rowclick', grid, preRecord, row, rowNum);
                        grid.blur();
                        grid.getSelectionModel().select(preRecord);
                    }
                }
            } else {
                if (!Ext.isEmpty(grid.relationGridPanelId) && grid.clickAutoLoadRelationGridPanel) {
                    grid.fireEvent('rowclick', grid, record, row, rowIndex, null, {}, {
                        callback: function (thisRecordArray, operation, success) {
                            var deletable = true;
                            if (!Ext.isEmpty(pluginsObj.editPlugin)) {
                                Ext.Object.each(pluginsObj, function (key, itemObj, objItSelf) {
                                    if (key === "relateStateControlF") {
                                        deletable = deletable && (itemObj.relateStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                    }
                                    if (key === "stateControlF") {
                                        deletable = deletable && (itemObj.gridStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                    }
                                    if (key === "deleteHead") {
                                        deletable = deletable && (itemObj.deleteHeadControl());
                                    }
                                });
                            }
                            return deletable;
                        },
                        remove: function (deletable) {
                            if (deletable) {
                                record.deleteFlag = 'D';
                                if (store.isCacheDataToFront) {
                                    thisColumn.refresh(store);
                                } else {
                                    thisColumn.iconChange(row, "red");
                                }
                            }
                        }
                    }, removeFlag);
                } else {
                    var deletable = true;
                    if (!Ext.isEmpty(pluginsObj.editPlugin)) {
                        Ext.Object.each(pluginsObj, function (key, itemObj, objItSelf) {
                            if (key === "stateControlF") {
                                deletable = deletable && (itemObj.gridStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                            }
                        });
                    }
                    if (deletable) {
                        record.deleteFlag = 'D';
                        if (store.isCacheDataToFront) {
                            thisColumn.refresh(store);
                        } else {
                            thisColumn.iconChange(row, "red");
                        }
                    }
                }
                grid.blur();
                grid.getSelectionModel().select(record);
            }

        }
    }
});
