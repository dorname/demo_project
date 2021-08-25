/**
 * @class Rs.ext.grid.column.ThumbUpDownloadAction
 * @extends Ext.grid.column.Action
 * @author LiGuangqiao
 * 缩略图上传操作列
 */
Ext.define('Rs.ext.grid.column.ThumbUpDownloadAction', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.thumb-updownload-action-column',
    configs: {
        /**
         *@cfg {String} uploadAltText
         *图片元素的代表文字
         */
        uploadAltText: "",
        /**
         *@cfg {String} uploadIcon
         *上传操作自定义图标（路径）
         */
        uploadIcon: "",
        /**
         *@cfg {String} uploadDisabled
         *上传操作是否可用
         */
        uploadDisabled: undefined,
        /**
         *@cfg {String} uploadHidden
         *是否隐藏上传操作
         */
        uploadHidden: undefined,
        /**
         *@cfg {String} uploadToolTip
         *上传操作提示
         */
        uploadToolTip: "上传缩略图",
        /**
         *@cfg {String} limitFileSize
         *上传文件大小的上限
         */
        limitFileSize: "",
        /**
         *@cfg {String} gridStoreId
         *所在grid面板的storeId
         */
        gridStoreId: "",
        /**
         *@cfg {String} thumbField
         *缩略图存放的字段名称
         */
        thumbField: "",
        /**
         *@cfg {String} fileAccept
         *可上传的文件类型
         */
        fileAccept: "",
        /**
         *@cfg {function} thumbUploadSuccess
         *缩略图上传成功回调函数
         * @params {string} rowIndex 行号
         * @params {string} thumbData 缩略图base64数据
         */
        thumbUploadSuccess: function (rowIndex, thumbData) {},
        /**
         *@cfg {function} thumbUploadFailure
         *缩略图上传失败回调函数
         */
        thumbUploadFailure: function () {}
    },
    text: '操作',
    fileAccept: "/*",
    limitFileSize: "100m",
    uploadToolTip: "上传缩略图",
    initComponent: function (thumbUploadAction) {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.on('afterrender', function () {
            if (!Ext.isEmpty(me.gridStoreId) && !Ext.isEmpty(me.thumbField)) {
                var store = Ext.getStore(me.gridStoreId);
                me.storeHandler(store, me.thumbField, me);
                if (store.isDynamicStore) {
                    me.storeHandler(store.getCachedStore(), me.thumbField, me);
                }
            }
            me.items[0] = {
                disabled: true
                //hidden: true
            };
            me.items[1] = {
                altText: me.uploadAltText,
                iconCls: 'submit-thumbbutton-icon',
                icon: me.uploadIcon,
                disabled: me.uploadDisabled,
                hidden: me.uploadHidden,
                tooltip: me.uploadToolTip,
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                    var obj = {
                        view: grid,
                        rowIndex: rowIndex,
                        colIndex: colIndex,
                        item: item,
                        e: e,
                        record: record,
                        row: row
                    };
                    me.uploadThumb(me, obj);
                }
            };
        });
    },
    uploadThumb: function (me, obj) {
        //小图标（logo）上传场景特殊
        var img = Ext.DomHelper.createDom('<img>'),
        submitButton = obj.row.getElementsByClassName("submit-thumbbutton-icon"),
        thumbUpload = Ext.DomHelper.createDom('<input>'),
        acceptTempType,
        acceptType;
        if (me.fileAccept.lastIndexOf(".") != -1) {
            acceptTempType = me.fileAccept.split(".")[1];
            acceptType = new RegExp("^image\/" + acceptTempType);
        }
        if (me.fileAccept.lastIndexOf("/") != -1) {
            acceptTempType = me.fileAccept.split("/")[1];
            acceptType = new RegExp("^image\/" + acceptTempType);
        }
        console.log(acceptType);
        thumbUpload.setAttribute('type', 'file');
        if (!Ext.isEmpty(me.fileAccept)) {
            thumbUpload.setAttribute('accept', me.fileAccept);
        }
        thumbUpload.setAttribute('id', 'thumb');
        thumbUpload.style.opacity = 0;
        img.classList.add("obj");
        img.height = 12;
        img.width = 12;
        thumbUpload.click();
        thumbUpload.addEventListener('change', function (e) {
            var submitButtonRow,
            grid = obj.view.grid,
            file = e.srcElement.files,
            gridPluginsArray = grid.getPlugins();
            Ext.each(gridPluginsArray, function (pluginObj) {
                if ("cellediting" === pluginObj.ptype) {
                    pluginObj.on('edit', function (editPlugin, field) {
                        submitButtonRow = field.row.getElementsByClassName("submit-thumbbutton-icon");
                        if (!Ext.isEmpty(field.record.get(me.thumbField))) {
                            var buttonImg = field.record.get(me.thumbField);
                            if (me.isBase64String(buttonImg)) {
                                submitButtonRow[0].style = "background-image:url(" + buttonImg + ");background-size: cover;";
                            }
                        }
                    });
                }
            }, this);
            for (i in file) {
                if (Ext.isNumeric(i)) {
                    if (!acceptType.test(file[i].type)) {
                        me.thumbUploadFailure();
                        continue;
                    }
                    if (me.overLimitSize(me.limitFileSize, file[i].size)) {
                        img.file = file[i];
                        var reader = new FileReader();
                        reader.onload = (function (aImg) {
                            return function (e) {
                                obj.record.thumbData = e.target.result;
                                if (!Ext.isEmpty(me.thumbField)) {
                                    me.setFieldValue(e.target.result, obj.record, me.thumbField);
                                }
                                me.thumbUploadSuccess(obj.rowIndex, e.target.result);
                                aImg.src = e.target.result;
                                submitButton[0].style = "background-image:url(" + e.target.result + ");background-size: cover;";
                            };
                        })(img);
                        reader.readAsDataURL(file[i]);
                    } else {
                        me.thumbUploadFailure();
                    }
                }
            }
        });
    },
	 /**
     * 判断当前字符串是不是base64字符串
     * public
     * @method storeHandler
     * @params {Ext.data.Store} store 数据存储
     * @params {string} thumbField 缩略图存放的字段名称
     * @params {Rs.ext.grid.column.ThumbUpDownloadAction} thumbColumn 缩略图上传操作列
     */
    storeHandler: function (store, thumbField, thumbColumn) {
        store.on("load", function (thisStore, records, successful, operation, eOpts) {
            var recordArray = thisStore.getRange();
            Ext.each(recordArray, function (record, index, itSelf) {
                if (!Ext.isEmpty(record.get(thumbField))) {
                    var thumbbutton = document.getElementsByClassName("submit-thumbbutton-icon")[index],
                    img = record.get(thumbField);
                    if (thumbColumn.isBase64String(img)) {
                        thumbbutton.style = "background-image:url(" + img + ");background-size: cover;";
                    }
                }
            });
        });
    },
    /**
     * 判断当前字符串是不是base64字符串
     * public
     * @method isBase64String
     * @params {string} str 字符串
     */
    isBase64String: function (str) {
        var flag = true,
        tempStr = str.split(',')[1];
        flag = flag && str.indexOf("base64") != -1;
        if (str === '' || str.trim() === '') {
            flag = false;
        }
        try {
            flag = flag && btoa(atob(tempStr)) == tempStr;
        } catch (err) {
            flag = false;
        }

        return flag;
    },
    /**
     * 反填缩略图存储字段逻辑
     * public
     * @method setFieldValue
     * @params {string} thumbData 缩略图base64数据
     * @params {string} record 记录
     * @params {string} thumbField 缩略图数据存储字段名
     */
    setFieldValue: function (thumbData, record, thumbField) {
        console.log("thumbData", thumbData);
        record.set(thumbField, thumbData);
    },
    /**
     * 缩略图上传成功回调函数
     * public
     * @method thumbUploadSuccess
     * @params {string} rowIndex 行号
     * @params {string} thumbData 缩略图base64数据
     */
    thumbUploadSuccess: function (rowIndex, thumbData) {
        //console.log(rowIndex,thumbData);

    },
    /**
     * 缩略图上传失败回调函数
     * public
     * @method thumbUploadFailure
     */
    thumbUploadFailure: function () {
        // console.log("no!!!");
    },
    overLimitSize: function (limitSize, realSize) {
        var sizeOne = Ext.util.Format.uppercase(limitSize),
        sizeTwo,
        fileLimitSize,
        fileSize;
        if (sizeOne.lastIndexOf("G") != -1) {
            fileLimitSize = sizeOne.split("G")[0];
            fileSize = (realSize / Math.pow(1024, 3)).toFixed(2);
            if (parseFloat(fileSize) > parseFloat(fileLimitSize)) {
                return false;
            } else {
                return true;
            }
        }
        if (sizeOne.lastIndexOf("M") != -1) {
            fileLimitSize = sizeOne.split("M")[0];
            fileSize = (realSize / Math.pow(1024, 2)).toFixed(2);
            if (parseFloat(fileSize) > parseFloat(fileLimitSize)) {
                return false;
            } else {
                return true;
            }
        }
        if (sizeOne.lastIndexOf("K") != -1) {
            fileLimitSize = sizeOne.split("K")[0];
            fileSize = (realSize / Math.pow(1024, 1)).toFixed(2);
            if (parseFloat(fileSize) > parseFloat(fileLimitSize)) {
                return false;
            } else {
                return true;
            }
        }
        return (parseFloat(realSize) < parseFloat(limitSize));
    }
});
