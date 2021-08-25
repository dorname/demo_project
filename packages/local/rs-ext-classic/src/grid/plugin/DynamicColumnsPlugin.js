Ext.define('Rs.ext.grid.plugin.DynamicColumnsPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.row-dynamic-columns-plugin',
    configs: {
        //特殊的属性配置
        extraColumnConfig: {}
    },
    standard: "standard",
	/*
    extraColumnConfig: {
        "nodeType": {
            "tooltip": "testing",
            "width": 120,
            "text": "好家伙!!"
        }
    },*/
    init: function (grid) {
        var me = this;
        grid.on('afterrender', function (thisGrid) {
            var fieldsArray = [],
            oldColumnArray = [],
            newColumnArray = [],
            tempColumnArray = [],
            columnModelConfig = {},
            t = {};
            var data = [{
                    dataIndex: "nodeType",
                    text: "wff",
                    itemId: "wtf"
                }, {
                    dataIndex: "seqNo",
                    text: "qqq",
                    itemId: "qqq"
                }
            ];
            //获取原有的列和模型字段
            Ext.each(thisGrid.getStore().getModel().getFields(), function (obj, index, itself) {
                var tempField = {};
                if (obj.name !== "id") {
                    Ext.Object.each(obj, function (key, value, myself) {
                        tempField[key] = value;
                    });
                    fieldsArray.push(tempField);
                }
            });
            Ext.each(thisGrid.getColumns(), function (column) {
                var tempColumn = {};
                Ext.Object.each(column.getInitialConfig(), function (key, value, myself) {
                    tempColumn[key] = value;
                    if (column.isXType("actioncolumn")) {
                        tempColumn["items"] = column.items;
                    }
                    if (column.isXType("rs-action-column-restricted")) {
                        tempColumn["items"] = column.items;
                    }
                    if (column.isXType("thumb-updownload-action-column")) {
                        tempColumn["items"] = column.items;
                    }
                    if (column.isXType("rsupdownloadactioncolumn")) {
                        tempColumn["items"] = column.items;
                    }
                    if (column.isXType("rsactioncolumn")) {
                        tempColumn["items"] = column.items;
                    }
                    if (!Ext.isEmpty(column.text)) {
                        if (column.text === "standard") {
                            //console.log(key);
                            tempColumn.hidden = true;
                            //column.setHidden(true);
                            if (key !== "itemId" && key !== "dataIndex" && key !== "text" && key !== "TransferFlag" && key !== "id") {
                                columnModelConfig[key] = value;
                            }
                        }
                    }
                });
                oldColumnArray.push(tempColumn);
            });
            //console.log("====>", columnModelConfig);
            //添加动态列以及动态模型字段
            Ext.each(data, function (dataObj, index, itself) {
                var newColumn = {};
                Ext.Object.merge(newColumn, columnModelConfig);
                Ext.Object.merge(newColumn, dataObj);
                Ext.Object.each(dataObj, function (key, value, myself) {
                    //newColumn[key] = value;
                    if (key === "dataIndex") {
                        fieldsArray.push({
                            name: value
                        });
                    }
                    if (!Ext.isEmpty(me.extraColumnConfig)) {
                        Ext.Object.each(me.extraColumnConfig, function (dataIndex, configObj, objself) {
                            if (value === dataIndex) {
                                Ext.Object.merge(newColumn, configObj);
                            }
                        });
                    }

                });
                tempColumnArray.push(newColumn);
            });
            newColumnArray = Ext.Array.merge(tempColumnArray, oldColumnArray);
            Ext.define(grid.getStore().id + "model", {
                extend: 'Ext.data.Model',

                requires: [
                    'Ext.data.field.Field'
                ],
                fields: fieldsArray
            });
            thisGrid.getStore().setModel(grid.getStore().id + "model");
            thisGrid.reconfigure(thisGrid.getStore(), newColumnArray);
        });
    }
});
