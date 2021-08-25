/**
 * @class Rs.ext.grid.RelationGridPanel
 * @extends Ext.grid.Panel
 * @author LiGuangqiao
 * 关联列表面板 RelationGridPanel 支持单帧、多帧页面
 */
Ext.define('Rs.ext.grid.RelationGridPanel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.relationgridpanel',
    configs: {
        /**
         *@cfg {string} relationGridPanelId
         *所关联的列表面板ID
         */
        relationGridPanelId: "",
        /**
         *@cfg {array} relationGridQueryFieldArray
         *关联查询条件的字段数组
         */
        relationGridQueryFieldArray: [],
        /**
         *@cfg {object} moreRelationGridObj
         *并行帧的列表面板ID以及关联字段组成的对象{"0":{relationGridPanelId: "",relationGridQueryFieldArray:[]}}
         */
        moreRelationGridObj: {},
        /**
         *@cfg {boolean} relationGridPanelAutoLoad
         *关联面板是否自动加载（默认加载第一条数据的查询结果）
         */
        relationGridPanelAutoLoad: true,
        /**
         *@cfg {boolean} clickAutoLoadRelationGridPanel
         *是否点击上帧数据行自动加载下帧
         */
        clickAutoLoadRelationGridPanel: true,
        /**
         *@cfg {boolean} isAddWhileNoRecords
         *空数据是否加载新增行
         */
        isAddWhileNoRecords: true
    },
    relationGridPanelId: "",
    relationGridQueryFieldArray: [],
    //所关联的面板帧数
    count: 0,
	isRelationPanel:true,
    addible: true,
    deletable: true,
    isAddWhileNoRecords: true,
    moreRelationGridObj: {},
    relationGridStoreSet: {},
    //上帧行点击事件是否触发所关联面板的数据加载
    clickAutoLoadRelationGridPanel: true,
    relationGridPanelAutoLoad: true,
    initComponent: function () {
        var me = this;
        me.callParent();
        me.on('afterrender', function (gridPanel) {
            // console.log("gridPanel", gridPanel);
            var myGridStore = gridPanel.getStore(),
            columnsArray = gridPanel.getColumns(),
            pluginsArray = gridPanel.getPlugins(),
            actionColumn,
            cellPlugin,
            deleteHead;

            Ext.each(pluginsArray, function (plugins, index, myself) {
                if (plugins.ptype === "cellediting") {
                    cellPlugin = plugins;
                    gridPanel.cellPlugin = cellPlugin;
                }
                if ("deleteHead" === plugins.ptype) {
                    deleteHead = plugins;
                }
            });
            Ext.each(columnsArray, function (column, index, myself) {
                if (column.xtype === "rsactioncolumn") {
                    actionColumn = column;
                }
                if (column.xtype === "rs-action-column-restricted") {
                    actionColumn = column;
                    gridPanel.actionColumn = actionColumn;
                }
            });
            if (!Ext.isEmpty(cellPlugin)) {
                cellPlugin.onAfter('edit', function (myself, cellData) {
                    if (!Ext.isEmpty(cellData.record.deleteFlag) && cellData.record.deleteFlag === 'D') {
                        Ext.get(cellData.row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
                    }
                });
            }
            myGridStore.on('load', function (thisStore, records, successful) {
                //默认新增行
                gridPanel.synchroAddDefaultValue(gridPanel, actionColumn, thisStore, thisStore, successful, gridPanel.isAddWhileNoRecords);
            });
            myGridStore.getCachedStore().on('load', function (thisCachedStore, records, successful) {
                //默认新增行
                gridPanel.synchroAddDefaultValue(gridPanel, actionColumn, thisCachedStore.getDynamicStore(), thisCachedStore, true, gridPanel.isAddWhileNoRecords);
            });
            //删除按钮变色逻辑
            gridPanel.getView().on('refresh', function (view, temp) {
                //console.log("ceshi",gridPanel.id);
                var thisStore = view.grid.getStore();
                if (!Ext.isEmpty(thisStore.getRange())) {
                    var removeIndexArr = [];
                    Ext.each(thisStore.getRange(), function (record, index, myself) {
                        if (!Ext.isEmpty(record.deleteFlag)) {
                            if (record.deleteFlag === 'D') {
                                removeIndexArr.push(index);
                            }
                        }
                    });
                    if (removeIndexArr.length !== 0) {
                        //console.log(gridPanel.id, "--->", gridPanel.getEl().dom.getElementsByClassName('x-action-col-icon x-action-col-2').length);
                        Ext.each(removeIndexArr, function (removeIndex, index, myself) {
                            if (!Ext.Object.isEmpty(view.grid.getEl().dom.getElementsByClassName('x-action-col-icon x-action-col-2'))) {
                                Ext.get(view.grid.getEl().dom.getElementsByClassName('x-action-col-icon x-action-col-2')[removeIndex]).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
                            }
                        });
                    } else {
                        return;
                    }
                }

            });
            //当前面板关联了其他面板时的处理逻辑
            if (!Ext.isEmpty(gridPanel.relationGridPanelId)) {
                var relatedObj = gridPanel.getRelationObj(gridPanel.relationGridPanelId, gridPanel.relationGridQueryFieldArray);
                gridPanel.relationGridPanelHandler(gridPanel, relatedObj, myGridStore);
                if (!Ext.Object.isEmpty(gridPanel.moreRelationGridObj)) {
                    Ext.Object.eachValue(gridPanel.moreRelationGridObj, function (obj) {
                        var tempObj = gridPanel.getRelationObj(obj.relationGridPanelId, obj.relationGridQueryFieldArray);
                        gridPanel.relationGridPanelHandler(gridPanel, tempObj, myGridStore);
                    });
                }
            }
        });
    },
    queryConditionHasNull: function (obj) {
        var flag = false;
        Ext.Object.each(obj, function (key, value, myself) {
            if (value === "null") {
                myself[key] = "";
                flag = true;
            }
        });
        return flag;
    },
    isArrayItemObj: function (array) {
        if (array.length !== 0) {
            if (Ext.isObject(array[0])) {
                return true;
            }
        } else {
            return false
        }
    },
    isArrayHaveField: function (array, field) {
        var flag = false;
        if (array.length !== 0) {
            if (Ext.isObject(array[0])) {
                Ext.each(array, function (fieldName, index, arrayItself) {
                    if (fieldName["upField"] === field) {
                        flag = true;
                    }
                });
            } else {
                if (Ext.Array.contains(array, field)) {
                    flag = true;
                }
            }
        }
        return flag;
    },
    getRelationObj: function (relationGridPanelId, relationGridQueryFieldArray) {
        var relationGridPanel = Ext.getCmp(relationGridPanelId),
        relationGridStore = relationGridPanel.getStore().getDynamicStore(),
        cachedStore = relationGridStore.getCachedStore(),
        obj = {
            relationGridPanel: relationGridPanel,
            relationGridPanelId: relationGridPanelId,
            relationGridQueryFieldArray: relationGridQueryFieldArray,
            cachedStore: cachedStore,
            relationGridStore: relationGridStore
        };
        relationGridStore.queryConditionField = {};
        return obj;
    },
    /**
     *关联面板处理逻辑
     *@method relationGridPanelHandler
     */
    relationGridPanelHandler: function (gridPanel, relatedObj, myGridStore) {
        //默认下帧展示按第一行记录条件查询结果的第一页
        myGridStore.on('load', function (thisStore, recordArray, successful, operation) {
            var record = thisStore.getRange();
            if (gridPanel.relationGridPanelAutoLoad && !Ext.isEmpty(record)) {
                gridPanel.autoLoadRelationPanel(gridPanel, relatedObj, record[0]);
            }
            if (Ext.isEmpty(record)) {
                relationGridPanel.getStore().removeAll();
            }
        });
        myGridStore.cachedStore.on('load', function (thisStore, recordArray, successful, operation) {
            //console.log("load arguments", arguments);
            var record = thisStore.getRange();
            if (gridPanel.relationGridPanelAutoLoad) {
                if (Ext.isEmpty(operation.isLoadRelationGridPanel) && !Ext.isEmpty(record)) {
                    gridPanel.autoLoadRelationPanel(gridPanel, relatedObj, record[0]);
                }
                if (Ext.isEmpty(record)) {
                    relationGridPanel.getStore().removeAll();
                }
            }

        });
        //update 同步数据
        myGridStore.on('update', function (thisStore, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                gridPanel.syncDataWhenUpdate(gridPanel, relatedObj, record, operation, modifiedFieldNames);
            }
        });
        myGridStore.cachedStore.on('update', function (thisStore, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                gridPanel.syncDataWhenUpdate(gridPanel, relatedObj, record, operation, modifiedFieldNames);
            }
        });
        //上帧点击数据行，下帧根据该数据行的条件查询并展示，默认查询结果的第一页
        gridPanel.on("rowclick", function (view, record, row, rowIndex, e, eOpts, fn, flag) {
            if (!Ext.isEmpty(e)) {
                if (Ext.get(e.getTarget()).hasCls('addAction-button-item')
                     || Ext.get(e.getTarget()).hasCls('deleteAction1-button-item')
                     || Ext.get(e.getTarget()).hasCls('deleteAction2-button-item')) {
                    return;
                }
            }
            //console.log("rowclick=====>");
            if (gridPanel.clickAutoLoadRelationGridPanel) {
                //console.log(me.clickAutoLoadRelationGridPanel);
                gridPanel.autoLoadRelationPanel(gridPanel, relatedObj, record, fn, flag);
            }
        });
        gridPanel.relationGridStoreSet[relatedObj.relationGridStore.id] = relatedObj.relationGridStore;

    },
    /**
     *当关联字段对应的数据有更新时同步前台关联数据集合
     *@method syncDataWhenUpdate
     */
    syncDataWhenUpdate: function (gridPanel, relatedObj, record, operation, modifiedFieldNames) {
        var field = modifiedFieldNames[0],
        relationModifiedFieldNames = [],
        recordArray,
        relationRecord;
        if (gridPanel.isArrayHaveField(relatedObj.relationGridQueryFieldArray, field) && !Ext.isEmpty(field)) {
            if (!Ext.isEmpty(relatedObj.cachedStore.getRelationStaticDataArry())) {
                Ext.each(relatedObj.cachedStore.getRelationStaticDataArry(), function (recordObj) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === relatedObj.cachedStore.currentPage
                         && recordObj["queryRecord"] === record) {
                        recordArray = tempRecord.data;
                    }
                });
                var tempField;
                if (gridPanel.isArrayItemObj(relatedObj.relationGridQueryFieldArray)) {
                    Ext.each(relatedObj.relationGridQueryFieldArray, function (fieldName, index, array) {
                        if (field === fieldName["upField"]) {
                            tempField = fieldName["downField"];
                        }
                    });
                } else {
                    tempField = field;
                }
                Ext.each(recordArray, function (eachRecord) {
                    eachRecord.data[tempField] = record.data[field];
                });
            }
            relatedObj.relationGridPanel.getStore().loadPage(relatedObj.relationGridPanel.getStore().currentPage);
            //gridPanel.fireEvent('rowclick', gridPanel, record);
            relationRecord = relatedObj.relationGridPanel.getStore().getRange()[0];
            relationModifiedFieldNames.push(tempField);
            relatedObj.relationGridPanel.getStore().fireEvent('update', relatedObj.relationGridPanel.getStore(), relationRecord, operation, relationModifiedFieldNames);
        }
    },
    /**
     *同步操作列的默认值
     *@method synchroAddDefaultValue
     */
    synchroAddDefaultValue: function (gridPanel, actionColumn, dynamicStore, currentStore, successful, isAddWhileNoRecords) {
        var addDefaultValue = {};
        if (!Ext.isEmpty(actionColumn)) {
            if (!Ext.isEmpty(dynamicStore.queryConditionField)) {
                delete dynamicStore.queryConditionField.id;
                gridPanel.queryConditionHasNull(dynamicStore.queryConditionField);
                var addObj = {},
                tempAddObj,
                tempAddObj = Ext.Object.merge(addObj, dynamicStore.queryConditionField);
                actionColumn.queryAddValue = tempAddObj;
                addDefaultValue = actionColumn.addDefaultValue;
            } else {
                var addObj = {};
                actionColumn.queryAddValue = addObj;
                addDefaultValue = actionColumn.addDefaultValue;
            }
        }
        if (Ext.isEmpty(currentStore.getRange()) || (!successful)) {
            currentStore.removeAll();
            if (!Ext.isEmpty(dynamicStore.queryConditionField)) {
                gridPanel.queryConditionHasNull(dynamicStore.queryConditionField);
                var obj = {},
                tempObj,
                tempObj1;
                tempObj = Ext.Object.merge(obj, dynamicStore.queryConditionField);
                tempObj1 = Ext.Object.merge(tempObj, addDefaultValue);
                if (isAddWhileNoRecords) {
                    currentStore.add(tempObj1);
                }
            } else {
                var Obj2 = {},
                tempObj2;
                tempObj2 = Ext.Object.merge(Obj2, addDefaultValue);
                if (isAddWhileNoRecords) {
                    currentStore.add(tempObj2);
                }
            }
        }
    },

    /**
     *加载关联面板的数据
     *@method autoLoadRelationPanel
     */
    autoLoadRelationPanel: function (gridPanel, relatedObj, record, fn, flag) {
        Ext.each(relatedObj.relationGridQueryFieldArray, function (fieldName, index, array) {
            if (Ext.isObject(fieldName)) {
                if (!Ext.isEmpty(record.data[fieldName.upField])) {
                    relatedObj.relationGridStore.queryConditionField[fieldName.downField] = record.data[fieldName.upField];
                } else {
                    relatedObj.relationGridStore.queryConditionField[fieldName.downField] = "null";
                }
            } else {
                if (!Ext.isEmpty(record.data[fieldName])) {
                    relatedObj.relationGridStore.queryConditionField[fieldName] = record.data[fieldName];
                } else {
                    relatedObj.relationGridStore.queryConditionField[fieldName] = "null";
                }
            }

        });
        relatedObj.cachedStore.queryStaticDataCondintion["queryRecord"] = record;
        relatedObj.relationGridStore.loadPage(1, {
            newRecord: record.phantom,
            callback: function () {
                if (!Ext.isEmpty(fn)) {
                    if (gridPanel.count === 0) {
                        gridPanel.addible = true;
                        gridPanel.deletable = true;
                    }
                    gridPanel.count += 1;
                    if (flag === "add") {
                        //console.log(gridPanel.addible,fn.callback());
                        gridPanel.addible = gridPanel.addible & fn.callback();
                        if ((Ext.Object.getSize(gridPanel.moreRelationGridObj) + 1) === gridPanel.count) {
                            gridPanel.count = 0;
                            fn.add(gridPanel.addible);
                        }
                    }
                    if (flag === "remove") {
                        gridPanel.deletable = gridPanel.deletable & fn.callback();
                        if ((Ext.Object.getSize(gridPanel.moreRelationGridObj) + 1) === gridPanel.count) {
                            gridPanel.count = 0;
                            fn.remove(gridPanel.deletable);
                        }
                    }
                }
            }
        });
    }

});
