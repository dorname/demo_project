/**
 * @class Rs.ext.grid.RelationGridPanel
 * @extends Ext.grid.Grid
 * @author LiGuangqiao
 * 关联列表面板 RelationGridPanel 支持单帧、多帧页面
 */
Ext.define("Rs.ext.grid.RelationGridPanel", {
    extend: "Ext.grid.Grid",
    xtype: "relation-grid",
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
         *@cfg {boolean} relationGridPanelAutoLoad
         *关联面板是否自动加载（默认加载第一条数据的查询结果）
         */
        relationGridPanelAutoLoad: true,
        /**
         *@cfg {object} moreRelationGridObj
         *并行帧的列表面板ID以及关联字段组成的对象{"0":{relationGridPanelId: "",relationGridQueryFieldArray:[]}}
         */
        moreRelationGridObj: {},
        /**
         *@cfg {object} clickAutoLoadRelationGridPanel
         *是否点击上帧数据行自动加载下帧
         */
        clickAutoLoadRelationGridPanel: true,
        /**
         *@cfg {boolean} isAddWhileNoRecords
         *空数据是否加载新增行
         */
        isAddWhileNoRecords: true
    },
    count: 0,
    addible: true,
    deletable: true,
    isRelationGrid: true,
    relationGridPanelId: "",
    relationGridQueryFieldArray: [],
    relationGridStoreSet: {},
    relationGridPanelAutoLoad: true,
    moreRelationGridObj: {},
    clickAutoLoadRelationGridPanel: true,
    isAddWhileNoRecords: true,
    initialize: function () {
        var me = this;
        me.callParent();
        me.on('painted', function (grid, el) {
            //console.log("===>", arguments);
            var thisStore = grid.getStore(),
            thisCachedStore = thisStore.getCachedStore(),
            columnsArray = grid.getColumns(),
            actionColumn;
            Ext.each(columnsArray, function (column, index, myself) {
                if (column.xtype === "rsactioncolumn") {
                    actionColumn = column;
                }
                if (column.xtype === "rs-action-column-restricted") {
                    actionColumn = column;
                    grid.actionColumn = actionColumn;
                }
            });
            grid.on('refresh', function (grid, temp) {
                var thisStore = grid.getStore();
                if (!Ext.isEmpty(thisStore.getRange())) {
                    var removeIndexArr = [];
                    var otherIndexArr = [];
                    var recordTemp = [];
                    Ext.each(thisStore.getRange(), function (record, index, myself) {
                        if (!Ext.isEmpty(record.deleteFlag)) {
                            if (record.deleteFlag === 'D') {
                                removeIndexArr.push(index);
                                recordTemp.push(record);
                            } else {
                                otherIndexArr.push(index);
                            }
                        } else {
                            otherIndexArr.push(index);
                        }
                    });
                    if (removeIndexArr.length !== 0) {
       
                        Ext.each(removeIndexArr, function (removeIndex, index, myself) {
                            if (!Ext.Object.isEmpty(grid.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon delete-action-item'))) {
                                Ext.get(grid.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon delete-action-item')[removeIndex]).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
                            }
                        });
                    }
                    if (otherIndexArr.length !== 0) {
                        Ext.each(otherIndexArr, function (otherIndex, index, myself) {
                            if (!Ext.Object.isEmpty(grid.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon delete-action-item'))) {
                                Ext.get(grid.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon delete-action-item')[otherIndex]).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
                            }
                        });
                    }

                }

            });
            thisStore.on('load', function (store, records, successful, operation, eOpts) {
                //grid.fireEvent()
                grid.synchroAddDefaultValue(grid, actionColumn, store, store, successful, operation, grid.isAddWhileNoRecords);
            });
            thisCachedStore.on('load', function (store, records, successful, operation, eOpts) {
                grid.synchroAddDefaultValue(grid, actionColumn, store.getDynamicStore(), store, successful, operation, grid.isAddWhileNoRecords);
            });
            if (!Ext.isEmpty(grid.relationGridPanelId)) {
                var obj = grid.getRelationObj(grid.relationGridPanelId, grid.relationGridQueryFieldArray);
                grid.relationGridHandler(grid, thisStore, obj);
                if (!Ext.Object.isEmpty(grid.moreRelationGridObj)) {
                    Ext.Object.eachValue(grid.moreRelationGridObj, function (tempObj) {
                        var temp = grid.getRelationObj(tempObj.relationGridPanelId, tempObj.relationGridQueryFieldArray);
                        grid.relationGridHandler(grid, thisStore, temp);
                    });
                }
            }

        });

    },
    /**
     * 缓存面板刷新页面函数
     * public
     * @method refresh
     * @params {Ext.data.Store} store
     */
    refreshPanel: function (store) {
        store.loadPage(store.currentPage, {
            isLoadRelationGridPanel: false
        });
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
    /**
     *同步操作列的默认值
     *@method synchroAddDefaultValue
     */
    synchroAddDefaultValue: function (grid, actionColumn, dynamicStore, currentStore, successful, operation, isAddWhileNoRecords) {
        var addDefaultValue = {},
        flag;
        if (!Ext.isEmpty(actionColumn)) {
            if (!Ext.isEmpty(dynamicStore.queryConditionField)) {
                delete dynamicStore.queryConditionField.id;
                grid.queryConditionHasNull(dynamicStore.queryConditionField);
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
        if (Ext.isEmpty(currentStore.getRange()) || ((!successful) && successful !== undefined) && (operation.canRemoved || currentStore.isDynamicStore)) {
            currentStore.removeAll();
            if (!Ext.isEmpty(dynamicStore.queryConditionField)) {
                grid.queryConditionHasNull(dynamicStore.queryConditionField);
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
     *关联面板处理逻辑
     *@method relationGridHandler
     */
    relationGridHandler: function (grid, thisStore, obj) {
        //点击上帧行记录，加载下帧数据
        grid.clickLoadRelationGrid(grid, obj);
        // 默认下帧展示按第一行记录条件查询结果的第一页
        thisStore.on('load', function (store, recordArray, successful, operation) {
            var record = store.getRange();
            if (grid.relationGridPanelAutoLoad && !Ext.isEmpty(record)) {
                grid.autoLoadRelationPanel(grid, obj, record[0]);
            }
            if (Ext.isEmpty(record)) {
                obj.relationGridPanel.getStore().removeAll();
            }
            //grid.refreshPanel(store);
        });
        thisStore.fireEvent("load", thisStore, thisStore.getRange(), true, {
            success: true
        });
        thisStore.getCachedStore().on('load', function (store, recordArray, successful, operation) {
            var record = store.getRange();
            if (grid.relationGridPanelAutoLoad) {
                if (Ext.isEmpty(operation.isLoadRelationGridPanel) && !Ext.isEmpty(record)) {
                    grid.autoLoadRelationPanel(grid, obj, record[0]);
                }
                if (Ext.isEmpty(record)) {
                    obj.relationGridPanel.getStore().removeAll();
                }
            }
        });
        //上帧关联字段对应的数据发生变化时，同步到下帧
        thisStore.on('update', function (store, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                //console.log(operation,details,eOpts)
                grid.syncWhenDataUpdate(grid, obj, record, operation, modifiedFieldNames);
            }

        });
        thisStore.getCachedStore().on('update', function (store, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                grid.syncWhenDataUpdate(grid, obj, record, operation, modifiedFieldNames);
            }
        });

    },
    syncWhenDataUpdate: function (grid, obj, record, operation, modifiedFieldNames) {
        var field = modifiedFieldNames[0],
        relationModifiedFieldNames = [],
        recordArray,
        relationRecord;
        if (grid.isArrayHaveField(obj.relationGridQueryFieldArray, field) && !Ext.isEmpty(field)) {
            if (!Ext.isEmpty(obj.cachedStore.getRelationStaticDataArry())) {
                Ext.each(obj.cachedStore.getRelationStaticDataArry(), function (recordObj) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === obj.cachedStore.currentPage
                         && recordObj["queryRecord"] === record) {
                        recordArray = tempRecord.data;
                    }
                });
                var tempField;
                if (grid.isArrayItemObj(obj.relationGridQueryFieldArray)) {
                    Ext.each(obj.relationGridQueryFieldArray, function (fieldName, index, array) {
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
            obj.relationGridPanel.getStore().loadPage(obj.relationGridPanel.getStore().currentPage);
            relationRecord = obj.relationGridPanel.getStore().getRange()[0];
            relationModifiedFieldNames.push(tempField);
            obj.relationGridPanel.getStore().fireEvent('update', obj.relationGridPanel.getStore(), relationRecord, operation, relationModifiedFieldNames);
        }
    },
    /**
     *点击上帧行记录，加载下帧数据
     *@method clickLoadRelationGrid
     */
    clickLoadRelationGrid: function (grid, obj) {
        grid.on('childtap', function (thisGrid, gridLocation) {
            if (thisGrid.clickAutoLoadRelationGridPanel) {
                thisGrid.autoLoadRelationPanel(thisGrid, obj, gridLocation.record);
            }
        });
        grid.relationGridStoreSet[obj.relationGridStore.id] = obj.relationGridStore;
    },
    /**
     *加载关联面板的数据
     *@method autoLoadRelationPanel
     */
    autoLoadRelationPanel: function (grid, obj, record, fn, flag) {
        //console.log("record", record);
        Ext.each(obj.relationGridQueryFieldArray, function (fieldName, index, array) {
            if (Ext.isObject(fieldName)) {
                if (!Ext.isEmpty(record.data[fieldName.upField])) {
                    obj.relationGridStore.queryConditionField[fieldName.downField] = record.data[fieldName.upField];
                } else {
                    obj.relationGridStore.queryConditionField[fieldName.downField] = "null";
                }
            } else {
                if (!Ext.isEmpty(record.data[fieldName])) {
                    obj.relationGridStore.queryConditionField[fieldName] = record.data[fieldName];
                } else {
                    obj.relationGridStore.queryConditionField[fieldName] = "null";
                }
            }

        });
        obj.cachedStore.queryStaticDataCondintion["queryRecord"] = record;
        obj.relationGridStore.loadPage(1, {
            newRecord: record.phantom,
            callback: function () {
                if (!Ext.Object.isEmpty(fn)) {
                    if (grid.count === 0) {
                        grid.addible = true;
                        grid.deletable = true;
                    }
                    grid.count += 1;
                    if (flag === "add") {
                        //console.log(grid.addible,fn.callback());
                        grid.addible = grid.addible & fn.callback();
                        if ((Ext.Object.getSize(grid.moreRelationGridObj) + 1) === grid.count) {
                            grid.count = 0;
                            fn.add(grid.addible);
                        }
                    }
                    if (flag === "remove") {
                        grid.deletable = grid.deletable & fn.callback();
                        if ((Ext.Object.getSize(grid.moreRelationGridObj) + 1) === grid.count) {
                            //console.log("removehao", "<--====");
                            grid.count = 0;
                            fn.remove(grid.deletable);
                        }
                    }
                }
            }
        });
    }
});
