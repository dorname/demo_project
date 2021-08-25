/**
 * @class Rs.ext.grid.column.RsUpDownloadAction
 * @extends Ext.grid.column.Action
 * @author LiGuangqiao
 * 上传操作列
 */
Ext.define('Rs.ext.grid.column.RsUpDownloadAction', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.rsupdownloadactioncolumn',
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
        uploadToolTip: "上传文件",
        /**
         *@cfg {Object} uploadParams
         *向后台接口传递的参数对象（注：此处不设上传文件对应的参数名及参数值）
         */
        uploadParams: {},
        /**
         *@cfg {String} uploadFileParam
         *上传文件对应的参数名（必须设置且应与后台接收的参数名保持一致）
         */
        uploadFileParam: "",
        /**
         *@cfg {String} limitFileSize
         *上传文件大小的上限
         */
        limitFileSize: "",
        /**
         *@cfg {String} fileAccept
         *可上传的文件类型
         */
        fileAccept: "",
        /**
         *@cfg {boolean} isMultiple
         *多文件上传开关
         */
        isMultiple: false,
        /**
         *@cfg {boolean} SynchronizedToSavePlugin
         *上传逻辑同步到点击保存插件的保存按钮
         */
        synchronizedToSavePlugin: false,
        /**
         *@cfg {string} panelWithSavePluginId
         *保存插件所在面板的Id
         */
        panelWithSavePluginId: "",
        /**
         *@cfg {string} savePluginPtype
         *保存插件别名
         *默认值：saveplugin
         */
        savePluginPtype: '',
        /**
         *@cfg {string} submitUrl
         *上传的后台接口地址
         */
        submitUrl: "",
        /**
         *@cfg {function} uploadHandler
         *上传逻辑重定义
         */
        uploadHandler: function (uploadParams, uploadFileParam, submitUrl, isMultiple, obj) {},
        /**
         *@cfg {function} uploadSuccess
         *上传成功回调函数
         * @method uploadSuccess
         * @params {Object} responseText 响应内容
         */
        uploadSuccess: function (responseText) {},
        /**
         *@cfg {function} uploadFailure
         *上传失败回调函数
         * @method uploadFailure
         * @params {Object} responseText 响应内容
         */
        uploadFailure: function (responseText) {}
    },
    text: '操作',
    rowObj: {},
    fileAccept: "/*",
    limitFileSize: "100m",
    isMultiple: false,
    panelWithSavePluginId: "",
    savePluginPtype: 'saveplugin',
    synchronizedToSavePlugin: false,
    submitUrl: "",
    uploadToolTip: "上传文件",
    initComponent: function () {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.initIframe();
        me.on('afterrender', function () {
            me.items[0] = {
                disabled: true
                //hidden: true
            };
            me.items[1] = {
                altText: me.uploadAltText,
                iconCls: 'submit-button-icon',
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
                    me.rowObj = obj;
                    me.uploadHandler(me, me.uploadParams, me.uploadFileParam, me.submitUrl, me.isMultiple, obj);
                }
            };
        });
    },
    /**
     * 初始化iframe函数
     * private
     * @method initIframe
     */
    initIframe: function () {
        var me = this,
        iframe = Ext.DomHelper.createDom('<iframe>');
        iframe.setAttribute('name', 'formIframe' + me.id);
        iframe.style.display = "none";
        iframe.addEventListener('load', function () {
            //console.log("iframe_load", Math.random());
            //console.dir(me.iframe);
            if (!Ext.isEmpty(iframe.contentDocument.body.innerText)) {
                var responseText = JSON.parse(iframe.contentDocument.body.innerText);
                if (!Ext.isEmpty(responseText)) {
                    if (responseText.info.success) {
                        me.uploadSuccess(responseText, me.rowObj);
                    } else {
                        me.uploadFailure(responseText, me.rowObj);
                    }
                }
            }
        });
        me.iframe = iframe;
        Ext.getBody().appendChild(me.iframe);
    },
    /**
     * 上传逻辑
     * public
     * @method uploadHandler
     * @params {Object} me 当前操作列
     * @params {Object} uploadParams 向后台接口传递的参数对象（注：此处不设上传文件对应的参数名及参数值）
     * @params {string} uploadFileParam 上传文件对应的参数名（必须设置且应与后台接收的参数名保持一致）
     * @params {string} submitUrl 上传的后台接口地址
     * @params {boolean} isMultiple  多文件上传开关
     * @params {Object} obj 对象参数参考如下
     ** @params {Ext.view.Table} view
     ** @params {Number} rowIndex 当前记录行号
     ** @params {Number} colIndex 当前记录列号
     ** @params {Object} item 当前操作按钮对象
     ** @params {Event} e 事件
     ** @params {Ext.data.Model} record 当前行记录
     ** @params {HTMLElement} row 行dom结构
     */
    uploadHandler: function (me, uploadParams, uploadFileParam, submitUrl, isMultiple, obj) {
        if (!Ext.isEmpty(uploadFileParam)) {
            var input = Ext.DomHelper.createDom('<input>'),
            form = Ext.DomHelper.createDom('<form>'),
            uploadParamsNum = 0,
            uploadParamsArray = [],
            uploadAvailable = true,
            fileAcceptReg = "",
            fileAcceptRegArray = [],
            fileRegType,
            regAtrr;
            input.setAttribute('name', uploadFileParam);
            if (isMultiple) {
                input.setAttribute('multiple', 'multiple');
            }
            input.setAttribute('type', 'file');
            if (!Ext.isEmpty(me.fileAccept)) {
                input.setAttribute('accept', me.fileAccept);
                if (me.fileAccept.indexOf(",") != -1) {
                    fileAcceptRegArray = me.fileAccept.split(",");
                    Ext.each(fileAcceptRegArray, function (atrr, index, thisArray) {
                        //console.log(atrr);
                        if (atrr.lastIndexOf(".") != -1) {
                            regAtrr = atrr.split(".")[1];
                            if (regAtrr === "*") {
                                regAtrr = "/*";
                            }
                            fileAcceptReg += "(" + regAtrr + ")";
                            if (index !== (thisArray.length - 1)) {
                                fileAcceptReg += "|";
                            }
                        }
                        if (atrr.lastIndexOf("/") != -1) {
                            regAtrr = atrr.split("/")[1];
                            if (regAtrr === "*") {
                                regAtrr = "/*";
                            }
                            fileAcceptReg += "(" + regAtrr + ")";
                            if (index !== (thisArray.length - 1)) {
                                fileAcceptReg += "|";
                            }
                        }
                    });
                } else {
                    fileAcceptReg = me.fileAccept;
                }
                fileRegType = new RegExp(fileAcceptReg);
                //console.log(fileAcceptReg,"fileAcceptReg:<--------");
                //console.log(fileRegType, fileRegType.test("zip"), "fileRegType:<--------");
            }
            input.style.opacity = 0;
            if (!Ext.isEmpty(uploadParams)) {
                Ext.Object.each(uploadParams, function (key, value, uploadParams) {
                    uploadParamsArray[uploadParamsNum] = Ext.DomHelper.createDom('<input>');
                    uploadParamsArray[uploadParamsNum].setAttribute('name', key);
                    uploadParamsArray[uploadParamsNum].setAttribute('value', value);
                    uploadParamsArray[uploadParamsNum].setAttribute('type', 'text');
                    uploadParamsArray[uploadParamsNum].style.opacity = 0;
                    //form.appendChild(uploadParamsArray[uploadParamsNum++]);
                    Ext.get(form).appendChild(uploadParamsArray[uploadParamsNum++]);
                });
            }
			//console.log(form,Ext.get(form));
            Ext.get(form).appendChild(input);
            form.setAttribute("enctype", "multipart/form-data");
            if (!Ext.isEmpty(submitUrl)) {
                form.setAttribute('action', submitUrl);
            } else {
                Rs.Msg.messageAlert({
                    title: '操作提示',
                    message: '缺少上传文件的接口地址Url，参考submitUrl属性'
                });
            }
            form.setAttribute('method', 'post');
            form.setAttribute('target', 'formIframe' + me.id);
            if (Ext.isEmpty(me.iframe.children.item(0))) {
				//me.iframe.appendChild(form);
                Ext.get(me.iframe).appendChild(form);
            } else {
             
                //me.iframe.replaceChild(form, me.iframe.children.item(0));
               Ext.get(me.iframe.children.item(0)).replaceWith(form);
            }
            input.addEventListener('change', function (e) {
                var file = e.srcElement.files;
                //控制上传的文件类型
                for (i in file) {
                    if (Ext.isNumeric(i)) {
                        if (!fileRegType.test(file[i].type)) {
                            uploadAvailable = false;
                            //console.log("类型限制");
                            me.uploadFailure("该类型受到限制不支持上传", obj);
                            break;
                        }
                        if (!me.overLimitSize(me.limitFileSize, file[i].size)) {
                            uploadAvailable = false;
                            // console.log("大小限制");
                            // console.log(me.overLimitSize(me.limitFileSize, file[i].size), file[i].size, me.limitFileSize);
                            me.uploadFailure("文件大小超过限制", obj);
                            break;
                        }
                    }
                }
                if (me.synchronizedToSavePlugin) {
                    var grid = Ext.getCmp(me.panelWithSavePluginId),
                    gridPluginsArray = grid.getPlugins();
                    Ext.each(gridPluginsArray, function (pluginObj) {
                        if (me.savePluginPtype === pluginObj.ptype) {
                            // console.log("pluginObj", pluginObj);
                            pluginObj.addButton.on('click', function () {
                                if (uploadAvailable) {
                                    form.submit();
                                }
                            });
                        }
                    }, this);
                } else {
                    if (uploadAvailable) {
                        form.submit();
                    }
                }
            });

            input.click();
        } else {
            Rs.Msg.messageAlert({
                title: '操作提示',
                message: '缺少上传文件的参数名，参考uploadFileParam属性'
            });
        }
    },
    /**
     * 上传成功回调函数
     * public
     * @method uploadSuccess
     * @params {Object} responseText 响应内容
     */
    uploadSuccess: function (responseText, rowObj) {
        // console.log("success:", responseText);
    },
    /**
     * 上传失败回调函数
     * public
     * @method uploadFailure
     * @params {Object} responseText 响应内容
     */
    uploadFailure: function (responseText, rowObj) {
        //console.log("failure:", responseText);
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
