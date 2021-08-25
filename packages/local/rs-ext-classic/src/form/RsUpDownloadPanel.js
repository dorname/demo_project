Ext.define('Rs.ext.form.UpDownloadPanel', {
    extend: 'Ext.window.Window',
    alias: 'widget.rs-upload-download-panel',
    requires: ['Ext.form.Panel',
        'Rs.ext.form.store.RsDownloadStore',
        'Rs.ext.form.model.RsDownloadModel',
        'Rs.ext.form.store.RsUploadStore',
        'Rs.ext.form.model.RsUploadModel'
    ],
    title: "上传文件",
    layout: {
        type: 'vbox'
    },
    minWidth: 622,
    minHeight: 200,
    gridFileNameWidth: 190,
    fileId: '8344',
    uploadRecordRemovedArray: [],
    downloadRecordRemovedArray: [],
    closable: false,
    isMultiple: false,
    downloadUrl: '/base/downloadfile',
    downloadParams: {},
    downloadRequestMethod: 'post',
    recordRemovedUrl: '/sys/testFileUtils/sys-attachment',
    recordRemovedRequestMethod: 'post',
    configs: {
        submitUrl: undefined,
        fileId: undefined,
        submitParams: {},
        fileUploadName: undefined,
        isMultiple: false,
        downloadParams: {},
        uploadSuccess: function (fp, o) {},
        uploadFailure: function (fp, o) {}
    },
    initComponent: function () {
        var me = this,
        win = window.top;
        me.callParent();
        me.initFormPanel();
        me.initGridPanel();
        me.initUploadGridPanel();
        me.add([me.DownloadGridPanel, me.UploadGridPanel, me.formPanel]);
        me.on('beforeshow', function () {
            var upload = me.UploadGridPanel,
            download = me.DownloadGridPanel,
            uploadButton = me.uploadButton,
            uploadStore = upload.getStore(),
            downloadStore = download.getStore();
            downloadStore.proxy.setExtraParams({
                attachmentId: me.fileId
            });
            uploadStore.removeAll();
            downloadStore.load();
            uploadButton.reset();
            win.onclick = function () {}
        });
        me.DownloadGridPanel.on('columnresize', function (headerContainer, resizeColumn, width) {
            console.log(arguments, "columnresize arguments");
            var columnIndex = resizeColumn.fullColumnIndex,
            upload = me.UploadGridPanel,
            column = upload.getColumns();
            column[columnIndex].setWidth(width);
            console.log(column);

            console.log(me.UploadGridPanel, "<=========");
        });
        me.on('focusleave', function () {
            win.onclick = function (e) {
                if (e.clientX - me.getX() < 0 || e.clientY - me.getY() < 0 || e.clientX - (me.getX() + me.getWidth()) > 0 || e.clientY - (me.getY() + me.getHeight()) > 0) {
                    console.log("true");
                    me.hide();
                }
            }
        });
    },
    initFormPanel: function () {
        var me = this,

        formPanel = Ext.create('Ext.form.Panel', Ext.apply({}, {
                    layout: {
                        type: 'vbox'
                    },
                    height: 28,
                    width: '100%'
                })),
        /*
        pagingtoolbar = Ext.create('Ext.toolbar.Paging', Ext.apply({}, {
        renderTo: document.body,
        dock: 'bottom',
        width: '100%',
        height: 30,
        width: '100%',
        afterPageText: '页（共 {0} 页）',
        beforePageText: '第',
        displayInfo: true,
        displayMsg: '显示  {0} - {1} 条，共 {2} 页',
        //store: 'downloadGridPanelStore',
        style: {
        "border": 'none'
        //'background': 'inherit'
        }
        })),*/
        toolbar = Ext.create('Ext.toolbar.Toolbar', Ext.apply({}, {
                    renderTo: document.body,
                    dock: 'bottom',
                    height: 30,
                    width: '100%',
                    layout: {
                        type: 'hbox'
                    },
                    items: [{
                            xtype: 'tbspacer',
                            width: '38%'
                        }
                    ],
                    style: {
                        "border": 'none'
                    }
                })),
        uploadButton = Ext.create('Ext.form.field.File', Ext.apply({}, {
                    name: me.fileUploadName,
                    id: me.id + '-upload',
                    hideLabel: true,
                    buttonText: '添加文件',
                    buttonOnly: true,
                    width: 72,
                    buttonConfig: {
                        iconCls: 'upload-button-icon',
                        style: {
                            "border": 'none',
                            "background": "inherit"
                        }
                    },
                    listeners: {
                        mouseover: {
                            element: 'el',
                            fn: function (e,file) {
                                this.setStyle({
                                    background: 'linear-gradient( #F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)'
                                })
                            }
                        },
                        mouseout: {
                            element: 'el',
                            fn: function () {
                                this.setStyle({
                                    background: 'inherit'
                                })
                            }
                        },
                        mousedown: {
                            element: 'el',
                            fn: function () {
                                this.setStyle({
                                    background: 'linear-gradient( #BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)'
                                })
                            }
                        },
                        click: {
                            element: 'el',
                            fn: function (e, file) {
                                if (me.isMultiple) {
                                    file.setAttribute("multiple", "multiple");
                                }
                            }
                        },
                        change: {
                            element: 'el',
                            fn: function (e, file) {
								console.log(file.files,"<==========");
                                var fileList = file.files,
                                upload = me.UploadGridPanel,
                                store = upload.getStore();
                                store.removeAll();
                                me.uploadFileList = fileList;
                                for (i in fileList) {
                                    if (Ext.isNumeric(i)) {
                                        var type,uploadValue = {};
                                        uploadValue.fileName = fileList[i].name;
                                        type = fileList[i].name.split(".");
										console.log(fileList[i].type);
										uploadValue.type = "."+type[1].trim();
                                        uploadValue.size = Ext.util.Format.fileSize(fileList[i].size);
                                        uploadValue.state = '等待上传';
                                        uploadValue.attachmentIndex = i + 1;
                                        store.add(uploadValue);
                                    }
                                }
                            }
                        }
                    }
                })),
        saveButton = Ext.create('Ext.button.Button', Ext.apply({}, {
                    id: me.id + '-submit' + '-button',
                    text: '保存',
                    iconCls: 'saveAction-button-item',
                    handler: function () {
                        var form = this.up("form").getForm(),
                        uploadStore = me.UploadGridPanel.getStore(),
                        downloadStore = me.DownloadGridPanel.getStore();
                        //下载面板删除逻辑
                        if (!Ext.isEmpty(me.downloadRecordRemovedArray)) {
                            Ext.each(me.downloadRecordRemovedArray, function (record) {
                                downloadStore.remove(record);
                            });
                            downloadStore.commitChanges();
                        }
                        //上传逻辑
                        if (form.isValid()) {
                            form.submit({
                                //url: 'http://192.168.2.208:9091/sys/sys1100/sys-generalsel-head/getSubSys',
                                //url: 'http://192.168.168.161:30031/upload',
                                //url: 'http://192.168.3.111:9333/upload',
                                //url: 'http://192.168.2.208:9333/upload',
                                url: me.submitUrl,
                                params: me.submitParams,
                                success: function (fp, o) {
                                    Rs.Msg.messageAlert({
                                        title: '提示',
                                        message: '上传成功'
                                    });
                                    downloadStore.on('beforeload', function () {
                                        console.log(arguments, "beforeload");
                                        if (!Ext.isEmpty(me.uploadRecordRemovedArray)) {
                                            Ext.each(me.uploadRecordRemovedArray, function (record) {
                                                console.log("record:", record);
                                                var attachmentIndex = record.data.attachmentIndex.slice(1);
                                                console.log("attachmentId:", attachmentIndex, o.result[attachmentIndex]);
                                                Ext.Ajax.request({
                                                    method: me.recordRemovedRequestMethod,
                                                    url: me.recordRemovedUrl,
                                                    params: {
                                                        attachmentIndex: attachmentIndex,
                                                        attachmentId: o.result[attachmentIndex].attachmentId
                                                    },
                                                    success: function () {
                                                        me.uploadRecordRemovedArray.length = 0;
                                                    },
                                                    failure: function () {
                                                        console.log("传递参数有误");
                                                    }
                                                });

                                            });
                                        }
                                    });
                                    downloadStore.reload();
                                    uploadStore.removeAll();
                                    console.log("success", fp, o);
                                    me.uploadSuccess(fp, o);
                                },
                                failure: function (fp, o) {
                                    Rs.Msg.messageAlert({
                                        title: '提示',
                                        message: '上传失败'
                                    });
                                    console.log("fail");
                                    var uploadStore = me.UploadGridPanel.getStore();
                                    uploadStore.removeAll();
                                    me.uploadRecordRemovedArray.length = 0;
                                    me.uploadFailure(fp, o);
                                }
                            });
                        }
                    },
                    style: {
                        "border": 'none',
                        "background": "inherit"
                    },
                    listeners: {
                        mouseover: {
                            element: 'el',
                            fn: function () {
                                this.setStyle({
                                    background: 'linear-gradient( #F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)'
                                })
                            }
                        },
                        mouseout: {
                            element: 'el',
                            fn: function () {
                                this.setStyle({
                                    background: 'inherit'
                                })
                            }
                        },
                        mousedown: {
                            element: 'el',
                            fn: function () {
                                this.setStyle({
                                    background: 'linear-gradient( #BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)'
                                })
                            }
                        }
                    }
                }));
        me.uploadButton = uploadButton,
        me.saveButton = saveButton;
        me.formPanel = formPanel;
        me.toolbar = toolbar;
        //me.toolbar.add([me.uploadButton, me.saveButton]);
        me.toolbar.add(me.uploadButton, '-', me.saveButton);
        // me.pagingtoolbar = pagingtoolbar;
        // me.pagingtoolbar.insert(10, me.uploadButton);
        // me.pagingtoolbar.insert(11, me.saveButton);
        // me.pagingtoolbar.remove(12);
        // me.formPanel.add(me.pagingtoolbar);
        me.formPanel.add(me.toolbar);
    },
    initGridPanel: function () {
        var me = this,
        DownloadGridPanel = Ext.create('Ext.grid.Panel', Ext.apply({}, {
                    // title: '附件列表',
                    stripeRows: true,
                    autoHeight: true,
                    border: false,
                    width: '100%',
                    scrollable: false,
                    store: new Rs.ext.form.store.RsDownloadStore({
                        storeId: 'downloadGridPanelStore'
                    }),
                    columns: [{
                            xtype: 'gridcolumn',
                            text: '附件编码',
                            //width: 10,
                            hidden: true,
                            dataIndex: 'attachmentId',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '附件索引',
                            //width: 10,
                            hidden: true,
                            dataIndex: 'attachmentIndex',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '文件名',
                            width: me.gridFileNameWidth,
                            sortable: true,
                            dataIndex: 'fileName',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '类型',
                            //width: 50,
                            flex: 1,
                            sortable: true,
                            dataIndex: 'type',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '大小',
                            //width: 80,
                            flex: 1,
                            sortable: true,
                            dataIndex: 'size',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '状态',
                            //width: 70,
                            flex: 1,
                            sortable: true,
                            dataIndex: 'state',
                            menuDisabled: true,
                            scope: this,
                            renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
                                return '<a style="color:#3abbfe">已经上传</a>';
                            }
                        }, {
                            xtype: 'actioncolumn',
                            text: '下载',
                            width: 60,
                            align: 'center',
                            items: [{
                                    iconCls: 'downloadAction-button-item',
                                    handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                                        //要求后台查出来的数据按attachmentIndex排序
                                        me.downloadParams={
                                            attachmentId: record.data.attachmentId,
                                            attachmentIndex: rowIndex + 1
                                        };
                                        Ext.Ajax.request({
                                            isUpload: true,
                                            method: me.downloadRequestMethod,
                                            url: me.downloadUrl,
                                            form: Ext.dom.Helper.createDom('<form/>'),
                                            params: me.downloadParams
                                        });
                                    }
                                }
                            ]
                        }, {
                            xtype: 'actioncolumn',
                            text: '操作',
                            align: 'center',
                            width: 60,
                            items: [{
                                    iconCls: 'deleteAction1-button-item',
                                    handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                                        if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
                                            record.deleteFlag = '';
                                            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-0')).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
                                        } else {
                                            record.deleteFlag = 'D';
                                            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-0')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
                                        }
                                        me.downloadRecordRemovedArray.push(record);
                                    }
                                }
                            ]
                        }
                    ]
                }));
        me.DownloadGridPanel = DownloadGridPanel;
    },
    initUploadGridPanel: function () {
        var me = this,
        UploadGridPanel = Ext.create('Ext.grid.Panel', Ext.apply({}, {
                    // title: '附件列表',
                    stripeRows: true,
                    autoHeight: true,
                    border: false,
                    hideHeaders: true,
                    width: '100%',
                    flex: 1,
                    scrollable: false,
                    store: new Rs.ext.form.store.RsUploadStore(),
                    columns: [{
                            xtype: 'gridcolumn',
                            text: '附件编码',
                            //width: 10,
                            hidden: true,
                            dataIndex: 'attachmentId',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '附件索引',
                            //width: 10,
                            hidden: true,
                            dataIndex: 'attachmentIndex',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '文件名',
                            width: me.gridFileNameWidth,
                            sortable: true,
                            dataIndex: 'fileName',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '类型',
                            //width: 50,
                            flex: 1,
                            sortable: true,
                            dataIndex: 'type',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '大小',
                            //width: 80,
                            flex: 1,
                            sortable: true,
                            dataIndex: 'size',
                            menuDisabled: true
                        }, {
                            xtype: 'gridcolumn',
                            text: '状态',
                            //width: 70,
                            flex: 1,
                            sortable: true,
                            dataIndex: 'state',
                            menuDisabled: true,
                            scope: this
                        }, {
                            xtype: 'actioncolumn',
                            text: '下载',
                            width: 60,
                            align: 'center',
                            items: [{
                                    iconCls: 'downloadAction1-button-item',
                                    handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                                        Rs.Msg.messageAlert({
                                            title: '提示',
                                            message: '文件尚未提交'
                                        });
                                    }
                                }
                            ]
                        }, {
                            xtype: 'actioncolumn',
                            text: '操作',
                            align: 'center',
                            width: 60,
                            items: [{
                                    iconCls: 'deleteAction1-button-item',
                                    handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                                        if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
                                            record.deleteFlag = '';
                                            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-0')).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
                                        } else {
                                            record.deleteFlag = 'D';
                                            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-0')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
                                        }
                                        me.uploadRecordRemovedArray.push(record);
                                    }
                                }
                            ]
                        }
                    ]
                }));
        me.UploadGridPanel = UploadGridPanel;
    },
    uploadSuccess: function (fp, o) {
        console.log("uploadSuccess");
    },
    uploadFailure: function (fp, o) {
        console.log("uploadFailure");
    }
});
