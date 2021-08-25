Ext.define('Rs.ext.grid.plugin.RowDenormaliserPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.row-denormaliser-plugin',
    init: function (grid) {
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
                    if (!Ext.isEmpty(column.TransferFlag)) {
                        if (column.TransferFlag) {
                            console.log(key);
                            if (key !== "itemId" && key !== "dataIndex" && key !== "text" && key !== "TransferFlag") {
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
                    //  newColumn[key] = value;
                    if (key === "dataIndex") {
                        fieldsArray.push({
                            name: value
                        });
                    }
                });

                //console.log(newColumn,"<-------------");
                tempColumnArray.push(newColumn);
            });
			newColumnArray = Ext.Array.merge(tempColumnArray,oldColumnArray);
            Ext.define(grid.getStore().id + "model", {
                extend: 'Ext.data.Model',

                requires: [
                    'Ext.data.field.Field'
                ],
                fields: fieldsArray
            });
            thisGrid.getStore().setModel(grid.getStore().id + "model");
            thisGrid.reconfigure(thisGrid.getStore(), tempColumnArray);
        });
    }
});
