/**
 * @class Rs.ext.grid.column.ActionRestricted
 * @extends Ext.grid.column.Column
 * @author ZanShuangpeng、LiGuangqiao
 * 操作列
 */
Ext.define('Rs.ext.grid.column.ActionRestricted', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.rs-action-column-restricted',
    configs: {
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
        addHandler: function (addObj) {},
        /**
         *@cfg {function} extraAddHandler
         *额外新增逻辑
         */
        extraAddHandler: function (addObj) {},
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
        deleteHandler: function (removeObj) {},
        /**
         *@cfg {function} extraRemoveHandler
         *额外删除逻辑
         */
        extraRemoveHandler: function (removeObj) {}
    },
    text: '操作',
    addFlag: "add",
    removeFlag: "remove",
    pluginsObj: {},
    gridPluginsArray: undefined,
    addDefaultValue: {},
    queryAddValue: {},
    cell: {
        tools: {
            approve: {
                disabled: this.addDisabled,
                hidden: this.addHidden,
                tooltip: this.addToolTip,
                iconCls: 'addAction-button-item add-action-item',
                handler: function (grid, obj) {
                    var me = obj.column,
                    store = grid.getStore(),
                    relationObjSet = {},
                    addObj = {
                        thisColumn: me,
                        grid: grid,
                        rowIndex: obj.cell.row._recordIndex,
                        e: obj.event,
                        record: obj.record,
                        row: obj.cell.row,
                        actionFlag: me.addFlag,
                        addDefaultValue: me.addDefaultValue,
                        queryAddValue: me.queryAddValue,
						pluginsObj:me.pluginsObj
                    };
                    me.extraAddHandler(addObj);
                    if (!Ext.isEmpty(grid.relationGridPanelId)) {
                        relationObjSet[grid.relationGridPanelId] = grid.getRelationObj(grid.relationGridPanelId, grid.relationGridQueryFieldArray);
                        if (!Ext.Object.isEmpty(grid.moreRelationGridObj)) {
                            Ext.Object.eachValue(grid.moreRelationGridObj, function (tempObj) {
                                var temp = grid.getRelationObj(tempObj.relationGridPanelId, tempObj.relationGridQueryFieldArray);
                                relationObjSet[tempObj.relationGridPanelId] = temp;
                            });
                        }
                    }
                    if (!Ext.isEmpty(grid.relationGridPanelId) && grid.clickAutoLoadRelationGridPanel) {
                        me.loadRelationGrid(relationObjSet, addObj, me.getAddFn(addObj, store));
                    } else {
                        var increasable = true;
                        if (!Ext.isEmpty(me.pluginsObj.editPlugin)) {
                            Ext.Object.each(me.pluginsObj, function (key, itemObj, objItSelf) {
                                //针对有关联面但下帧不通过点击事件去加载数据的分支
                                if (key === "relateStateControlF") {
                                    increasable = increasable && (itemObj.relateStateControl(store, addObj.record, itemObj.itemIds));
                                }
                            });
                        }
                        if (increasable) {
                            me.addHandler(addObj);
                        }
                    }
                    
                }
            },
            decline: {
                disabled: this.deleteDisabled,
                hidden: this.deleteHidden,
                tooltip: this.deleteToolTip,
                iconCls: 'deleteAction1-button-item delete-action-item',
                handler: function (grid, obj) {
                    //console.log("delete",obj);
                    var me = obj.column,
                    store = grid.getStore(),
                    removeObj = {
                        thisColumn: me,
                        grid: grid,
                        rowIndex: obj.cell.row._recordIndex,
                        e: obj.event,
                        record: obj.record,
                        row: obj.cell.row,
                        actionFlag: me.removeFlag,
                        pluginsObj: me.pluginsObj
                    },
                    relationObjSet = {};
                    me.extraRemoveHandler(removeObj);
                    if (!Ext.isEmpty(grid.relationGridPanelId)) {
                        relationObjSet[grid.relationGridPanelId] = grid.getRelationObj(grid.relationGridPanelId, grid.relationGridQueryFieldArray);
                        if (!Ext.Object.isEmpty(grid.moreRelationGridObj)) {
                            Ext.Object.eachValue(grid.moreRelationGridObj, function (tempObj) {
                                var temp = grid.getRelationObj(tempObj.relationGridPanelId, tempObj.relationGridQueryFieldArray);
                                relationObjSet[tempObj.relationGridPanelId] = temp;
                            });
                        }
                    }
                    if (!Ext.isEmpty(store.isFrontCachedStore)) {
                        if (store.isCacheDataToFront) {
                            //me.loadRelationGrid(relationObjSet,removeObj,me.getDeleteFn(removeObj,store));
                            me.deleteHandler(removeObj, relationObjSet);
                        } else {
                            me.deleteHandler(removeObj, relationObjSet);
                        }
                    } else {
                        me.notCachedDeleteHandler(removeObj, relationObjSet);
                    }
                },
                weight: 1
            }

        }
    },
    initialize: function () {
        var me = this,
        grid = me.up("grid");
        me.callParent();
        if (Ext.isEmpty(me.gridPluginsArray)) {
            me.gridPluginsArray = grid.getPlugins();
            var obj = {};
            Ext.each(me.gridPluginsArray, function (pluginObj) {
                if ("relatestatecontrolf" === pluginObj.type) {
                    obj.relateStateControlF = pluginObj;
                }
                if ("deleteHead" === pluginObj.type) {
                    obj.deleteHead = pluginObj;
                }
                if ("statecontrolf" === pluginObj.type) {
                    obj.stateControlF = pluginObj;
                }
                if ("rowediting" === pluginObj.type) {
                    obj.editPlugin = pluginObj;
                }
                if ("gridcellediting" === pluginObj.type) {
                    obj.editPlugin = pluginObj;
                }
            });
        }
        me.pluginsObj = obj;
        //console.log(me.up("grid").getPlugins(), me.pluginsObj.deleteHead,"<<<<<<<<<<<<");
    },
    iconChange: function (row, changeFlag) {
        //console.log(row);
        if (changeFlag === "red") {
            Ext.get(row.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon delete-action-item')[0]).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
        }
        if (changeFlag === "reset") {
            Ext.get(row.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon delete-action-item')[0]).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
        }
    },
    setAddDefaultValue: function (obj) {
        var me = this;
        me.addDefaultValue = obj;
    },
    getAddDefaultValue: function () {
        var me = this;
        return me.addDefaultValue;
    },
    getAddFn: function (addObj, store) {
        return {
            callback: function () {
                var increasable = true;
                if (!Ext.isEmpty(addObj.thisColumn.pluginsObj.editPlugin)) {
                    Ext.Object.each(addObj.thisColumn.pluginsObj, function (key, itemObj, objItSelf) {
                        if (key === "relateStateControlF") {
                            increasable = increasable && (itemObj.relateStateControl(store, addObj.record, itemObj.itemIds));
                        }
                    });
                }
                return increasable;
            },
            add: function (increasable) {
                if (increasable) {
                    addObj.thisColumn.addHandler(addObj);
                }
            }
        };
    },
    getDeleteFn: function (removeObj, store) {
        return {
            callback: function () {
                var deletable = true;
                if (!Ext.isEmpty(removeObj.pluginsObj.editPlugin)) {
                    Ext.Object.each(removeObj.pluginsObj, function (key, itemObj, objItSelf) {
                        if (key === "relateStateControlF") {
                            deletable = deletable && (itemObj.relateStateControl(store, removeObj.record, itemObj.itemIds));
                        }
                        if (key === "stateControlF") {
                            deletable = deletable && (itemObj.gridStateControl(removeObj.record, itemObj.itemIds));
                        }
                        if (key === "deleteHead") {
                            //console.log("deleteHeadControl");
                            deletable = deletable && (itemObj.deleteHeadControl());
                        }
                    });
                }
                return deletable;
            },
            remove: function (deletable) {
                //console.log("remove", deletable);
                if (deletable) {
                    removeObj.record.deleteFlag = 'D';
                    removeObj.thisColumn.iconChange(removeObj.row, "red");
                    /*
                    if (store.isCacheDataToFront) {
                    removeObj.thisColumn.refresh(store);
                    } else {
                    removeObj.thisColumn.iconChange(removeObj.row, "red");
                    }*/
                }
            }
        };
    },
    loadRelationGrid: function (relationObjSet, obj, fn, record) {
        if (!Ext.Object.isEmpty(relationObjSet)) {
            Ext.Object.eachValue(relationObjSet, function (tempObj) {
                if (!Ext.isEmpty(record)) {
                    obj.grid.autoLoadRelationPanel(obj.grid, tempObj, record, fn, obj.actionFlag);
                } else {
                    obj.grid.autoLoadRelationPanel(obj.grid, tempObj, obj.record, fn, obj.actionFlag);
                }
            });
        }
    },
    /**
     * 缓存面板刷新页面函数
     * public
     * @method refreshGrid
     * @params {Ext.data.Store} store
     */
    refreshGrid: function (store) {
        store.loadPage(store.currentPage, {
            isLoadRelationGridPanel: false
        });
    },
    /**
     * 额外的新增行逻辑
     * public
     * @method extraAddHandler
     * @params{Ext.Object} addObj
     ** @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     ** @params {Ext.grid.Panel} grid grid列表对象
     ** @params {Number} rowIndex 当前记录行号
     ** @params {Number} colIndex 当前记录列号
     ** @params {Object} item 当前操作按钮对象
     ** @params {Event} e 事件
     ** @params {Ext.data.Model} record 当前行记录
     ** @params {HTMLElement} row 行dom结构
     */
    extraAddHandler: function (addObj) {},
    /**
     * 新增行逻辑
     * public
     * @method addHandler
     * @params{Ext.Object} addObj
     ** @params {Ext.grid.Panel} grid grid列表对象
     ** @params {Number} rowIndex 当前记录行号
     ** @params {Number} colIndex 当前记录列号
     ** @params {Object} item 当前操作按钮对象
     ** @params {Event} e 事件
     ** @params {Ext.data.Model} record 当前行记录
     ** @params {HTMLElement} row 行dom结构
     ** @params {Object} defaultValue 新增默认值
     ** @params {Object} queryAddValue 关联查询默认值
     ** @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     */
    addHandler: function (addObj) {
        var temp = {},
        tempAddValue,
        rowNum = addObj.rowIndex + 1,
        store = addObj.grid.getStore(),
        tempAddValue = Ext.Object.merge(temp, addObj.defaultValue),
        addDefaultValue = Ext.Object.merge(tempAddValue, addObj.queryAddValue),
        nextRecord;
        store.insert(rowNum, addDefaultValue);
        nextRecord = addObj.grid.getStore().getRange()[rowNum];
        addObj.grid.blur();
        addObj.grid.getSelectable().select(addObj.record);
    },
    /**
     * 场景1：当前store并非前台数据缓存store
     * 场景2：当前store为前台数据缓存store但isCacheDataToFront属性置为false(即不将数据缓存到前台时)
     * 在以上场景下的删除逻辑
     * public
     * @method notCachedDeleteHandler
     * @params{Ext.Object} removeObj
     ** @params {Ext.grid.Panel} grid grid列表对象
     ** @params {Number} rowIndex 当前记录行号
     ** @params {Number} colIndex 当前记录列号
     ** @params {Object} item 当前操作按钮对象
     ** @params {Event} e 事件
     ** @params {Ext.data.Model} record 当前行记录
     ** @params {HTMLElement} row 行dom结构
     ** @params {Object} pluginsObj grid插件对象集
     */
    notCachedDeleteHandler: function (removeObj, relationObjSet) {
        if (!Ext.isEmpty(removeObj.record.deleteFlag) && removeObj.record.deleteFlag == 'D') {
            removeObj.record.deleteFlag = '';
            removeObj.thisColumn.iconChange(removeObj.row, "reset");
        } else {
            if (!Ext.isEmpty(removeObj.record.crudState) && removeObj.record.crudState == 'C' && removeObj.record.phantom) {
                if (removeObj.grid.store.data.length > 1) {
                    removeObj.grid.store.remove(removeObj.record);
                    var preRecord = removeObj.grid.getStore().getRange()[removeObj.rowIndex - 1],
                    rowNum = removeObj.rowIndex - 1;
                    if (removeObj.rowIndex === 0) {
                        preRecord = removeObj.grid.getStore().getRange()[removeObj.rowIndex];
                        rowNum = removeObj.rowIndex;
                    }
                    removeObj.thisColumn.loadRelationGrid(relationObjSet, removeObj, {}, preRecord);
                    removeObj.grid.blur();
                    removeObj.grid.getSelectable().select(preRecord);
                }
            } else {
                var deletable = true;
                if (!Ext.isEmpty(removeObj.pluginsObj.editPlugin)) {
                    Ext.Object.each(removeObj.pluginsObj, function (key, itemObj, objItSelf) {
                        if (key === "stateControlF") {
                            deletable = deletable && (itemObj.gridStateControl(removeObj.record, itemObj.itemIds));
                        }
                    });
                }
                if (deletable) {
                    removeObj.record.deleteFlag = 'D';
                    removeObj.thisColumn.iconChange(removeObj.row, "red");
                }

            }

        }
    },
    /**
     * 额外的删除行逻辑
     * public
     * @method extraRemoveHandler
     * @params{Ext.Object} removeObj
     ** @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     ** @params {Ext.grid.Panel} grid grid列表对象
     ** @params {Number} rowIndex 当前记录行号
     ** @params {Number} colIndex 当前记录列号
     ** @params {Object} item 当前操作按钮对象
     ** @params {Event} e 事件
     ** @params {Ext.data.Model} record 当前行记录
     ** @params {HTMLElement} row 行dom结构
     */
    extraRemoveHandler: function (removeObj) {},
    /**
     * 删除行逻辑
     * public
     * @method deleteHandler
     * @params{Ext.Object} removeObj
     ** @params {Ext.grid.Panel} grid grid列表对象
     ** @params {Number} rowIndex 当前记录行号
     ** @params {Number} colIndex 当前记录列号
     ** @params {Object} item 当前操作按钮对象
     ** @params {Event} e 事件
     ** @params {Ext.data.Model} record 当前行记录
     ** @params {HTMLElement} row 行dom结构
     ** @params {Object} pluginsObj grid插件对象集
     ** @params {String} removeFlag 传递给关联面板的删除标记
     ** @params {Object} pluginsObj grid插件对象集
     ** @params {Rs.ext.grid.column.ActionRestricted} thisColumn 受插件限制的新增删除操作列自身
     */
    deleteHandler: function (removeObj, relationObjSet) {
        //console.log("haoshou");
        var store = removeObj.grid.getStore();
        if (!Ext.isEmpty(removeObj.record.deleteFlag) && removeObj.record.deleteFlag == 'D') {
            removeObj.record.deleteFlag = '';
            removeObj.thisColumn.iconChange(removeObj.row, "reset");
            /*
            if (store.isCacheDataToFront) {
            removeObj.thisColumn.refresh(store);
            }*/
        } else {
            if (!Ext.isEmpty(removeObj.record.crudState) && removeObj.record.crudState == 'C' && removeObj.record.phantom) {
                if (removeObj.grid.getStore().data.length >= 1) {
                    removeObj.grid.getStore().remove(removeObj.record);
                    if (!Ext.isEmpty(removeObj.grid.relationGridPanelId)) {
                        var preRecord = removeObj.grid.getStore().getRange()[removeObj.rowIndex - 1],
                        rowNum = removeObj.rowIndex - 1;
                        if (removeObj.rowIndex === 0) {
                            preRecord = removeObj.grid.getStore().getRange()[removeObj.rowIndex];
                            rowNum = removeObj.rowIndex;
                        }
                        removeObj.thisColumn.loadRelationGrid(relationObjSet, removeObj, {}, preRecord);
                        removeObj.grid.blur();
                        removeObj.grid.getSelectable().select(preRecord);
                    }
                }
            } else {
                if (!Ext.isEmpty(removeObj.grid.relationGridPanelId) && removeObj.grid.clickAutoLoadRelationGridPanel) {
                    //console.log("1");
                    removeObj.thisColumn.loadRelationGrid(relationObjSet, removeObj, removeObj.thisColumn.getDeleteFn(removeObj, store));
                } else {
                    //console.log("2");
                    var deletable = true;
                    if (!Ext.isEmpty(removeObj.pluginsObj.editPlugin)) {
                        Ext.Object.each(removeObj.pluginsObj, function (key, itemObj, objItSelf) {
                            if (key === "stateControlF") {
                                deletable = deletable && (itemObj.gridStateControl(removeObj.record, itemObj.itemIds));
                            }
                        });
                    }
                    if (deletable) {
                        removeObj.record.deleteFlag = 'D';
                        removeObj.thisColumn.iconChange(removeObj.row, "red");
                        /*
                        if (store.isCacheDataToFront) {
                        removeObj.thisColumn.refresh(store);
                        } else {
                        removeObj.thisColumn.iconChange(removeObj.row, "red");
                        }*/
                    }
                }
                removeObj.grid.blur();
                removeObj.grid.getSelectable().select(removeObj.record);
            }

        }
    }
});
