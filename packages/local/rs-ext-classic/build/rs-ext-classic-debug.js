Ext.define('Rs.ext.overrides.Component', {
    override: 'Ext.Component',
    initComponent: function() {
        var me = this;
        me.callParent();
        me.initLanguage(Rs.LANG);
    },
    translations: {},
    initLanguage: function(lang) {
        var me = this;
        if (me.isContainer) {
            return;
        }
        me.translate(lang);
    },
    translate: function(lang) {
        var me = this;
        me.statics().doTranslation(me, me.translations, lang);
    }
}, function(Cls) {
    var Labels = [
            {
                name: 'button',
                func: 'setText'
            },
            {
                name: 'field',
                func: 'setFieldLabel'
            },
            {
                name: 'fieldcontainer',
                func: 'setFieldLabel'
            },
            {
                name: 'panel',
                func: 'setTitle'
            },
            {
                name: 'gridcolumn',
                func: 'setText'
            }
        ];
    Cls.addStatics({
        getDecimals: function(id) {
            var decmals = Rs.DECIMALS || {};
            return decmals[id];
        },
        getLanguage: function(id) {
            var language = Rs.MULTILANGUAGE || {};
            return language[id];
        },
        doTranslation: function(cmp, items, lang, isItemId) {
            var prefix = isItemId ? '#' : '';
            Ext.iterate(items, function(query, langs) {
                var item = query == '' ? cmp : cmp.down(prefix + query);
                if (!Ext.isEmpty(item)) {
                    Ext.each(Labels, function(label) {
                        if (item.isXType(label.name)) {
                            item[label.func](langs[lang]);
                            return false;
                        }
                    });
                }
            });
        }
    });
});

Ext.define('Rs.ext.overrides.data.Model', {
    override: 'Ext.data.Model'
});
/*set: function(fieldName, newValue, options) {
        var me = this,
            cls = me.self,
            data = me.data,
            modified = me.modified,
            prevVals = me.previousValues,
            session = me.session,
            single = Ext.isString(fieldName),
            opt = (single ? options : newValue),
            convertOnSet = opt ? opt.convert !== false : me.convertOnSet,
            fieldsMap = me.fieldsMap,
            silent = opt && opt.silent,
            commit = opt && opt.commit,
            updateRefs = !(opt && opt.refs === false) && session,
            // Don't need to do dirty processing with commit, since we'll always
            // end up with nothing modified and not dirty
            dirty = !(opt && opt.dirty === false && !commit),
            modifiedFieldNames = null,
            dirtyRank = 0,
            associations = me.associations,
            currentValue, field, idChanged, key, name, oldId, comparator, dep, dependents,
            i, numFields, newId, rankedFields, reference, value, values, roleName;
		
		if(newValue == ""){
			newValue = null;
		}
        if (single) {
            values = me._singleProp;
            values[fieldName] = newValue;
        }
        else {
            values = fieldName;
        }
 
        if (!(rankedFields = cls.rankedFields)) {
            // On the first edit of a record of this type we need to ensure we have the
            // topo-sort done:
            rankedFields = cls.rankFields();
        }
 
        numFields = rankedFields.length;
 
        do {
            for (name in values) {
                value = values[name];
                currentValue = data[name];
                comparator = me;
                field = fieldsMap[name];
 
                if (field) {
                    if (convertOnSet && field.convert) {
                        value = field.convert(value, me);
                    }
 
                    comparator = field;
                    reference = field.reference;
                }
                else {
                    reference = null;
                }
 
                if (comparator.isEqual(currentValue, value)) {
                    continue; // new value is the same, so no change...
                }
				
				if (currentValue == undefined && value == null){
                    continue;
                }
				
                if(value == null){
					data[name] = '';
				}else{
					data[name] = value;
				}
				
				
                (modifiedFieldNames || (modifiedFieldNames = [])).push(name);
                (prevVals || (me.previousValues = prevVals = {}))[name] = currentValue;
 
                // We need the cls to be present because it means the association class is loaded,
                // otherwise it could be pending.
                if (reference && reference.cls) {
                    if (updateRefs) {
                        session.updateReference(me, field, value, currentValue);
                    }
 
                    reference.onValueChange(me, session, value, currentValue);
                }
 
                i = (dependents = field && field.dependents) && dependents.length;
 
                while (i-- > 0) {
                    // we use the field instance to hold the dirty bit to avoid any
                    // extra allocations... we'll clear this before we depart. We do
                    // this so we can perform the fewest recalculations possible as
                    // each dependent field only needs to be recalculated once.
                    (dep = dependents[i]).dirty = true;
                    dirtyRank = dirtyRank ? Math.min(dirtyRank, dep.rank) : dep.rank;
                }
 
                if (!field || field.persist) {
                    if (modified && modified.hasOwnProperty(name)) {
                        if (!dirty || comparator.isEqual(modified[name], value)) {
                            // The original value in me.modified equals the new value, so
                            // the field is no longer modified:
                            delete modified[name];
                            me.dirty = -1; // fix me.dirty later (still truthy)
                        }
                    }
                    else if (dirty) {
                        if (!modified) {
                            me.modified = modified = {}; // create only when needed
                        }
 
                        me.dirty = true;
                        modified[name] = currentValue;
                    }
                }
 
                if (name === me.idField.name) {
                    idChanged = true;
                    oldId = currentValue;
                    newId = value;
                }
            }
 
            if (!dirtyRank) {
                // Unless there are dependent fields to process we can break now. This is
                // what will happen for all code pre-dating the depends or simply not
                // using it, so it will add very little overhead when not used.
                break;
            }
 
            // dirtyRank has the minimum rank (a 1-based value) of any dependent field
            // that needs recalculating due to changes above. The way we go about this
            // is to use our helper object for processing single argument invocations
            // to process just this one field. This is because the act of setting it
            // may cause another field to be invalidated, so while we cannot know at
            // this moment all the fields we need to recalculate, we know that only
            // those following this field in rankedFields can possibly be among them.
 
            field = rankedFields[dirtyRank - 1]; // dirtyRank is 1-based
            field.dirty = false; // clear just this field's dirty state
 
            if (single) {
                delete values[fieldName]; // cleanup last value
            }
            else {
                values = me._singleProp; // switch over
                single = true;
            }
 
            fieldName = field.name;
            values[fieldName] = data[fieldName];
            // We are now processing a dependent field, so we want to force a
            // convert to occur because it's the only way it will get a value
            convertOnSet = true;
 
            // Since dirtyRank is 1-based and refers to the field we need to handle
            // on this pass, we can treat it like an index for a minute and look at
            // the next field on towards the end to find the index of the next dirty
            // field.
            for (; dirtyRank < numFields; ++dirtyRank) {
                if (rankedFields[dirtyRank].dirty) {
                    break;
                }
            }
 
            if (dirtyRank < numFields) {
                // We found a field after this one marked as dirty so make the index
                // a proper 1-based rank:
                ++dirtyRank;
            }
            else {
                // We did not find any more dirty fields after this one, so clear the
                // dirtyRank and we will perhaps fall out after the next update
                dirtyRank = 0;
            }
        } while (1); // eslint-disable-line no-constant-condition
 
        if (me.dirty < 0) {
            // We might have removed the last modified field, so check to see if there
            // are any modified fields remaining and correct me.dirty:
            me.dirty = false;
 
            for (key in modified) {
                if (modified.hasOwnProperty(key)) {
                    me.dirty = true;
 
                    break;
                }
            }
        }
 
        if (single) {
            // cleanup our reused object for next time... important to do this before
            // we fire any events or call anyone else (like afterEdit)!
            delete values[fieldName];
        }
 
        ++me.generation;
 
        if (idChanged) {
            me.id = newId;
            me.onIdChanged(newId, oldId);
            me.callJoined('onIdChanged', [oldId, newId]);
 
            if (associations) {
                for (roleName in associations) {
                    associations[roleName].onIdChanged(me, oldId, newId);
                }
            }
        }
 
        if (commit) {
            me.commit(silent, modifiedFieldNames);
        }
        else if (!silent && !me.editing && modifiedFieldNames) {
            me.callJoined('afterEdit', [modifiedFieldNames]);
        }
 
        return modifiedFieldNames;
    }*/

Ext.define('Rs.ext.overrides.data.Store', {
    override: 'Ext.data.Store',
    /**
     *
     */
    checkBeforeLoad: true
});
// PAGING METHODS
/**
     * Loads a given 'page' of data by setting the start and limit values appropriately. Internally
     * this just causes a normal load operation, passing in calculated 'start' and 'limit' params.
     * @param {Number} page The number of the page to load.
     * @param {Object} [options] See options for {@link #method-load}.
     */
/*loadPage: function(page, options) {
        var me = this,
            size = me.getPageSize();

        if(me.checkBeforeLoad && me.needsSync){
            Ext.Msg.show({
                title: '提示' ,
                msg: '存在未保存的数据,确定重新加载?',
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.QUESTION,
                fn: function(btn, text) {
                    me.un('beforeload' , me.beforeLoadCheckData , me);
                    if (btn == 'ok') {
                        me.currentPage = page;
                        // Copy options into a new object so as not to mutate passed in objects
                        options = Ext.apply({
                            page: page,
                            start: (page - 1) * size,
                            limit: size,
                            addRecords: !me.getClearOnPageLoad()
                        }, options);

                        me.read(options);
                        me.needsSync = undefined;
                    }
                },
                scope: me
            });
            return;
        }
        me.currentPage = page;

        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            page: page,
            start: (page - 1) * size,
            limit: size,
            addRecords: !me.getClearOnPageLoad()
        }, options);

        me.read(options);
    }*/

Ext.define('Rs.ext.overrides.panel.Panel', {
    override: 'Ext.panel.Panel',
    initComponent: function() {
        var me = this;
        me.callParent();
        me.initPanelLanguage();
        me.initPanelDecimals();
    },
    initPanelLanguage: function(language) {
        var me = this;
        me.translate(Rs.LANG);
    },
    translate: function(lang) {
        var me = this,
            language = Ext.Component.getLanguage(me.id);
        Ext.Component.doTranslation(me, language, lang, true);
        me.callParent(arguments);
    },
    initPanelDecimals: function() {
        var me = this,
            decimals = Ext.Component.getDecimals(me.id);
        Ext.iterate(decimals, function(itemId, presicsion) {
            var comp = me.down('#' + itemId);
            //numbercolumn 特殊处理
            comp && (comp.decimalPrecision = presicsion);
        });
    }
});

Ext.define('Rs.ext.overrides.form.field.Text', {
    override: 'Ext.form.field.Text',
    /**
     * 目前针对已知情况只过滤的英文字符中' 单引号
     */
    maskRe: new RegExp('[^\']'),
    stripCharsRe: new RegExp('[\']', 'gi')
});

Ext.define('Rs.ext.overrides.grid.CellEditor', {
    override: 'Ext.grid.CellEditor',
    onSpecialKey: function(field, event, eOpts) {
        var me = this,
            key = event.getKey();
        //console.log(event);
        if (key === event.ENTER && event.shiftKey == false) {
            event.ENTER = 9;
            event.keyCode = 9;
            event.event.code = 'Tab';
            event.event.key = 'Tab';
        }
        var complete = me.completeOnEnter && key === event.ENTER && (!eOpts || !eOpts.fromBoundList),
            cancel = me.cancelOnEsc && key === event.ESC,
            view = me.editingPlugin.view;
        if (complete || cancel) {
            // Do not let the key event bubble into the NavigationModel
            // after we're done processing it.
            // We control the navigation action here; we focus the cell.
            event.stopEvent();
            // Maintain visibility so that focus doesn't leak.
            // We need to direct focusback to the owning cell.
            if (cancel) {
                me.focusLeaveAction = 'cancelEdit';
            }
            view.ownerGrid.setActionableMode(false);
        }
    }
});

Ext.define('Rs.ext.overrides.grid.column.Number', {
    override: 'Ext.grid.column.Number',
    afterRender: function() {
        var me = this;
        me.callParent(arguments);
        var panelId = me.up('grid').id,
            itemId = me.itemId;
        var decimals = Rs.DECIMALS[panelId];
        //Ext.Component.getDecimals(panelId);
        if (!Ext.isEmpty(decimals)) {
            var format = me.format;
            format = format.split('.')[0] + '.' + Ext.String.leftPad('', decimals[itemId] || 2, '0');
            me.format = format;
            console.log('====>', format);
        }
    }
});

/**
 * @class Rs.ext.window.MessageAlert
 * @extends Ext.window.MessageBox
 * @author LiGuangqiao
 * 自定义提示框
 */
Ext.define('Rs.ext.window.MessageAlert', {
    extend: 'Ext.window.MessageBox',
    alias: 'widget.msgalert',
    closable: false,
    initComponent: function() {
        this.callParent();
    },
    getErrorMsg: function(err_code) {
        var params = {},
            errowMsg;
        params.sql = "select err_code,err_des_c,err_des_e from sys_err_info where err_code = '" + err_code + "'";
        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    errowMsg = obj.data[0];
                } else {
                    Ext.Msg.alert("系统提示", obj.mesg);
                }
            },
            failure: function(response, opts) {
                Ext.Msg.alert("系统提示", "服务器未连接");
            }
        });
        return errowMsg;
    },
    /**
     * 提示框
     * private
     * @method messageAlert
     * @params {Object} cfg  参数对象
     ** @params {String} title 提示栏标题
     ** @params {String} extraMsg 额外自定义提示内容
     ** @params {Boolean} isBackOrFront 额外自定义提示内容拼接在前面还是后面 true 拼接在后面 false拼接在前面
     ** @params {String} message 提示内容
     ** @params {String} stateCode 状态码  一个全局对象{"101":"error 101"}
     ** @params {Number} width 提示框宽度
     ** @params {Number} height 提示框长度
     ** @params {Boolean} modal 模态开关 true表示模态，false非模态
     ** @params {Number} autoCloseDistance 提示框默认自动关闭距离，默认为500，注：当isAutoCloseDistance设置为false时失效
     ** @params {Boolean} isAutoCloseDistance 提示框按距离自动关闭开关 true表示打开，false关闭，默认为false
     ** @params {Boolean} autoTimeClose 是否自动关闭开关 true表示开启自动关闭，false不开启 默认false不开启
     ** @params {Number} time 自动关闭的时间，使用此参数autoClose置为true才生效
     ** @params {Boolean} closable 显示关闭按钮开关 true显示，false不显示 默认false不显示
     ** @params {number} buttons 按钮列表 1--确定 2--是 4--否 8--取消 6--是否 9--确定取消 14--是否取消
     ** @params {Object} buttonText 改变按钮文本显示内容{"ok":"确定按钮文本","cancel":"取消按钮文本","yes":"是按钮文本","no":"否按钮文本"}
     * @params {Function} fn 回调函数
     * @params {Object} scope
     */
    //title,message,modal,width,height,autoCloseDistance,isAutoCloseDistance,autoTimeClose,time,closable,fn, scope
    messageAlert: function(cfg, fn, scope) {
        var me = this,
            ERRORLANG;
        //全局状态码对象
        if (Rs.LANG === "en") {
            ERRORLANG = "ERR_DES_E";
        } else if (Rs.LANG === "zh") {
            ERRORLANG = "ERR_DES_C";
        } else {
            ERRORLANG = "ERR_DES_C";
        }
        if (!Ext.isEmpty(cfg.stateCode)) {
            var ERRORINFO = me.getErrorMsg(cfg.stateCode);
            Ext.Object.each(ERRORINFO, function(key, value, myself) {
                if (ERRORLANG === key) {
                    cfg.message = value;
                }
            });
        }
        if (Ext.isEmpty(cfg.isBackOrFront)) {
            cfg.isBackOrFront = false;
        }
        if (!Ext.isEmpty(cfg.extraMsg)) {
            if (cfg.isBackOrFront) {
                cfg.message += cfg.extraMsg;
            } else {
                cfg.message = cfg.extraMsg + cfg.message;
            }
        }
        if (Ext.isEmpty(cfg.title)) {
            cfg.title = "提示";
        }
        if (Ext.isEmpty(cfg.width)) {
            cfg.width = this.minWidth;
        }
        if (Ext.isEmpty(cfg.height)) {
            cfg.height = this.minHeight;
        }
        //初始化提示框默认自动关闭距离
        if (Ext.isEmpty(cfg.autoCloseDistance)) {
            cfg.autoCloseDistance = 500;
        }
        //初始化提示框按距离自动关闭开关
        if (Ext.isEmpty(cfg.isAutoCloseDistance)) {
            cfg.isAutoCloseDistance = false;
        }
        //初始化显示关闭按钮开关
        if (!(Ext.isEmpty(cfg.closable))) {
            me.closable = cfg.closable;
        }
        //初始化模态开关
        if (Ext.isEmpty(cfg.modal)) {
            cfg.modal = false;
        }
        //初始化自动关闭的时间
        if (Ext.isEmpty(cfg.time)) {
            cfg.time = 5;
        }
        //初始化自动关闭开关
        if (Ext.isEmpty(cfg.autoTimeClose)) {
            cfg.autoTimeClose = false;
        }
        if (Ext.isString(cfg.title)) {
            cfg.title = {
                title: cfg.title,
                height: cfg.height,
                width: cfg.width,
                message: cfg.message,
                buttons: cfg.buttons,
                buttonText: cfg.buttonText,
                fn: fn,
                modal: cfg.modal,
                scope: scope,
                minWidth: this.minWidth,
                minHeight: this.minHeight
            };
        }
        if (cfg.autoTimeClose) {
            var task = {
                    taskFlag: 1,
                    run: function() {
                        task.taskFlag++;
                        me.show(cfg.title);
                        if (task.taskFlag > cfg.time) {
                            me.close();
                        }
                    },
                    interval: 1000,
                    //间隔时间1s
                    repeat: cfg.time
                };
            var runner = new Ext.util.TaskRunner();
            runner.start(task);
            //按距离自动关闭提示框逻辑
            var win = window.top,
                distance = 0,
                distanceX = 0,
                distanceY = 0;
            if (!Ext.isEmpty(win)) {
                if (cfg.isAutoCloseDistance) {
                    win.onmousemove = function(mouseEvent) {
                        if (mouseEvent.movementX < 0) {
                            distanceX -= mouseEvent.movementX;
                        } else {
                            distanceX += mouseEvent.movementX;
                        }
                        if (mouseEvent.movementY < 0) {
                            distanceY -= mouseEvent.movementY;
                        } else {
                            distanceY += mouseEvent.movementY;
                        }
                        distance = distanceX * distanceX + distanceY * distanceY;
                        if (distanceX >= cfg.autoCloseDistance || distanceY >= cfg.autoCloseDistance || distance >= (cfg.autoCloseDistance * cfg.autoCloseDistance)) {
                            distanceX = 0;
                            distanceY = 0;
                            distance = 0;
                            if (!Ext.isEmpty(task)) {
                                runner.stop(task);
                            }
                            me.close();
                        }
                    };
                }
            } else {
                Ext.Msg.alert("无法捕获外层窗口异常", "按光标移动距离自动关闭方法失效");
            }
        } else {
            me.show(cfg.title);
            //按距离自动关闭提示框逻辑
            var win = window.top,
                distance = 0,
                distanceX = 0,
                distanceY = 0;
            if (!Ext.isEmpty(win)) {
                if (cfg.isAutoCloseDistance) {
                    win.onmousemove = function(mouseEvent) {
                        if (mouseEvent.movementX < 0) {
                            distanceX -= mouseEvent.movementX;
                        } else {
                            distanceX += mouseEvent.movementX;
                        }
                        if (mouseEvent.movementY < 0) {
                            distanceY -= mouseEvent.movementY;
                        } else {
                            distanceY += mouseEvent.movementY;
                        }
                        distance = distanceX * distanceX + distanceY * distanceY;
                        if (distanceX >= cfg.autoCloseDistance || distanceY >= cfg.autoCloseDistance || distance >= (cfg.autoCloseDistance * cfg.autoCloseDistance)) {
                            distanceX = 0;
                            distanceY = 0;
                            distance = 0;
                            if (!Ext.isEmpty(task)) {
                                runner.stop(task);
                            }
                            me.close();
                        }
                    };
                }
            } else {
                Ext.Msg.alert("无法捕获外层窗口异常", "按光标移动距离自动关闭方法失效");
            }
        }
        //监听提示框失焦事件
        //点击外部提示框关闭
        if (Ext.isEmpty(me.hasFocusLeave)) {
            me.on('focusleave', function() {
                me.hasFocusLeave = true;
                if (!Ext.isEmpty(task)) {
                    runner.stop(task);
                }
                me.close();
            });
        }
        //监听键盘按下事件
        //任意键盘按下关闭提示框
        if (!Ext.isEmpty(me.getEl())) {
            me.getEl().on({
                keydown: function() {
                    if (!Ext.isEmpty(task)) {
                        runner.stop(task);
                    }
                    me.close();
                }
            });
        }
    }
}, function(MessageBox) {
    /**
     * @class Rs.ext.window.MessageBox
     * @alternateClassName Rs.Msg
     * @extends Ext.window.MessageBox
     * @singleton
     * @inheritdoc Ext.window.MessageBox
     */
    // We want to defer creating Ext.MessageBox and Ext.Msg instances
    // until overrides have been applied.
    Ext.onInternalReady(function() {
        Rs.ext.window.MessageBox = Rs.Msg = new MessageBox();
    });
});

Ext.define('Rs.ext.util.Marker', {
    singleton: true,
    alternateClassName: [
        'Rs.Marker'
    ],
    getErrorMsg: function(err_code) {
        var params = {},
            errowMsg = {};
        params.sql = "select err_code,err_des_c as ZH,err_des_e as EN from sys_err_info where err_code = '" + err_code + "'";
        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    errowMsg = obj.data[0];
                } else {
                    Ext.Msg.alert("系统提示", obj.mesg);
                }
            },
            failure: function(response, opts) {
                Ext.Msg.alert("系统提示", "服务器未连接");
            }
        });
        return errowMsg;
    },
    /**
     * 显示错误弹窗信息
     */
    showMsg: function(errorCodes) {
        var me = this,
            errMsg,
            errors = [],
            win = me.getWin();
        win.show();
        Ext.each(errorCodes, function(errCode) {
            errMsg = me.getErrorMsg(errCode);
            errors.push({
                code: errCode,
                msg: errMsg[Rs.LANG.toUpperCase()]
            });
        });
        win.store.setData(errors);
    },
    getWin: function() {
        var me = this,
            win = me.msgWindow;
        if (win)  {
            return win;
        }
        
        var store = Ext.create('Ext.data.JsonStore', {
                fields: [
                    'code',
                    'msg'
                ]
            });
        win = Ext.create('Ext.window.Window', {
            width: 420,
            height: 280,
            layout: 'fit',
            closable: false,
            closeAction: 'hide',
            listeners: {
                'focusleave': function(win) {
                    win.hide();
                },
                'hide': function() {
                    //me.focusFirst(); 
                    Ext.defer(me.focusFirst, 10, me);
                }
            },
            items: [
                {
                    xtype: 'grid',
                    border: false,
                    header: false,
                    store: store,
                    columns: [
                        {
                            width: 50,
                            dataIndex: 'code'
                        },
                        {
                            flex: 1,
                            dataIndex: 'msg'
                        }
                    ]
                }
            ]
        });
        win.store = store;
        me.msgWindow = win;
        return win;
    },
    /**
     * 不符合要求的单元格填色
     */
    mark: function(parameters) {
        var me = this,
            errorCodes = {};
        me.records = {} , me.panelIds = [] , me.markerEls = {};
        if (!Ext.isArray(parameters))  {
            parameters = [
                parameters
            ];
        }
        
        Ext.each(parameters, function(params, idx) {
            var els,
                id = params.panelId,
                panel = Ext.getCmp(id),
                errArr = params.errArr,
                errorMsg = params.errorMsg;
            Ext.each(errorMsg, function(errorCode) {
                errorCodes[errorCode] = errorCode;
            });
            if (!panel)  {
                return;
            }
            
            me.panelIds.push(panel);
            me.unmark(panel);
            if (panel.isXType('grid')) {
                els = me.getMarkElsOfGrid(panel, errArr);
            } else //me.focusOfGrid(panel, els.first(), errArr);
            {
                els = me.getMarkElsOfCard(panel, errArr);
            }
            //me.focusOfCard(panel, els.first());
            me.markerEls[id] = els;
            panel.invalidEls = els;
            me.records[id] = errArr;
            me.markStyle(els);
        });
        var codes = Ext.Object.getKeys(errorCodes);
        if (Ext.isEmpty(codes)) {
            //me.focusFirst();
            Ext.defer(me.focusFirst, 10, me);
        } else {
            me.showMsg(codes);
        }
    },
    focusFirst: function() {
        var me = this,
            id, els;
        Ext.each(me.panelIds, function(panel) {
            id = panel.getId();
            els = me.markerEls[id];
            if (els.getCount()) {
                me.focusOnEl(panel, els.first());
                return false;
            }
        });
    },
    focusOnEl: function(panel, el) {
        var me = this;
        if (!Ext.isEmpty(el)) {
            if (panel.isXType('grid')) {
                me.focusOfGrid(panel, el);
            } else {
                me.focusOfCard(panel, el);
            }
        }
    },
    focusOfGrid: function(grid, el) {
        var me = this,
            position,
            view = grid.getView(),
            store = grid.getStore(),
            records = me.records[grid.id],
            id = store.getModel().idProperty,
            header = view.getHeaderByCell(el),
            record = store.getById(records[0][id]),
            editing = grid.getPlugin('cellediting');
        if (record) {
            position = view.getPosition(record, header);
            editing.startEditByPosition(position);
        }
    },
    focusOfCard: function(card, el) {
        el.focus();
    },
    getMarkElsOfGrid: function(grid, errArr) {
        var record, rowEl, selectors,
            view = grid.getView(),
            store = grid.getStore(),
            id = store.getModel().idProperty,
            els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function(item) {
            selectors = [];
            record = store.getById(item[id]);
            if (record) {
                rowEl = Ext.fly(view.getRow(record));
                if (rowEl) {
                    Ext.each(item.checkField, function(field) {
                        selectors.push('td[data-columnid=' + field + ']');
                    });
                    els.add(rowEl.select(selectors.join(',')));
                }
            }
        });
        return els;
    },
    getMarkElsOfCard: function(card, errArr) {
        var els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function(item) {
            Ext.each(item.checkField, function(field) {
                els.add(card.down('#' + field).inputEl);
            });
        });
        return els;
    },
    markStyle: function(els) {
        els.applyStyles({
            background: '#ffdfd7'
        });
    },
    /**
     * 取消填色标记
     */
    unmark: function(panel) {
        var els = panel.invalidEls;
        if (!Ext.isEmpty(els)) {
            els.applyStyles({
                background: 'none'
            });
        }
        panel.invalidEls = null;
    }
});

/**
 * 重写Extjs原生组件使其符合RS10规范及做相应定制化
 */
(function() {
    Ext.apply(Ext.ns('Rs'), {
        LANG: 'zh',
        DECIMALS: {}
    });
    Ext.syncRequire([
        'Rs.ext.overrides.Component',
        'Rs.ext.overrides.form.field.Text',
        'Rs.ext.overrides.data.Store',
        'Rs.ext.overrides.data.Model',
        'Rs.ext.overrides.panel.Panel',
        'Rs.ext.overrides.grid.CellEditor',
        'Rs.ext.overrides.grid.column.Number',
        'Rs.ext.window.MessageAlert',
        'Rs.ext.util.Marker'
    ]);
    var man = Ext.manifest,
        locale = man.locale || 'zh_CN';
    Ext.Loader.loadScript({
        //url: man.paths['Rs.ext'] + '/../locale/' + locale + '/rs-ext-locale-' + locale + '.js'
        url: '/packages/local/rs-ext-classic/locale/' + locale + '/rs-ext-locale-' + locale + '.js'
    });
}());

/**
 * @class Rs.ext.button.ExceptionButton
 * @extends Ext.button.Button
 * @author LiGuangqiao
 * ExceptionButton
 */
Ext.define('Rs.ext.button.ExceptionButton', {
    alias: 'widget.exception-button',
    extend: 'Ext.button.Button',
    configs: {
        /**
         *@cfg {function} exceptionHandler
         *例外信息按钮的处理拓展逻辑自定义
         */
        exceptionHandler: function() {},
        /**
         *@cfg {string} pageCode
         *例外信息所属的页面编码
         */
        pageCode: '',
        /**
         *@cfg {string} queryUrl
         *例外信息查询的后台接口
         */
        queryUrl: '',
        /**
         *@cfg {string} queryProxyType
         *代理类型
         */
        queryProxyType: '',
        /**
         *@cfg {string} displayFields
         *显示字段
         */
        displayFields: '',
        /**
         *@cfg {string} buttonText
         *按钮文本
         */
        buttonText: ''
    },
    buttonIconCls: 'exception-button',
    queryUrl: '',
    queryProxyType: 'rest',
    //queryUrl:'/business/sys/test8888/sys-menu-tree/crud/',
    pageCode: '',
    displayFields: 'excInfo',
    //displayFields:'sysCode',
    isButton: true,
    buttonText: '例外信息',
    initComponent: function() {
        var me = this;
        me.callParent();
        me.initExceptionPanel();
        me.on('afterrender', function(myself) {
            myself.setText(myself.buttonText);
            myself.setIconCls(myself.buttonIconCls);
            myself.setHandler(function() {
                myself.exceptionHandler();
                myself.exceptionWindow.show();
            });
        });
    },
    initExceptionPanel: function() {
        var me = this,
            model = Ext.create('Ext.data.Model', {
                requires: [
                    'Ext.data.field.Field'
                ],
                fields: [
                    {
                        name: me.displayFields
                    }
                ]
            }),
            store = Ext.create('Ext.data.Store', {
                storeId: 'exceptionStore',
                autoLoad: true,
                model: model,
                proxy: {
                    type: me.queryProxyType,
                    url: me.queryUrl,
                    extraParams: {
                        pagCode: me.pageCode,
                        companyCode: '00'
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'data.records'
                    }
                }
            }),
            exceptionWindow = Ext.create('Ext.window.Window', {
                title: '例外信息',
                closable: false,
                width: 750,
                height: 208,
                layout: 'fit',
                //至少得给定一个宽度
                alignTarget: me,
                defaultAlign: 'tl-bl',
                listeners: {
                    'focusleave': function(myself) {
                        myself.hide();
                    }
                }
            }),
            exceptionPanel = Ext.create('Ext.grid.Panel', {
                scrollable: true,
                store: store,
                height: '100%',
                width: '100%',
                columns: [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: me.displayFields,
                        width: '100%'
                    }
                ]
            });
        //floating:true
        exceptionWindow.add(exceptionPanel);
        me.exceptionWindow = exceptionWindow;
        me.store = store;
        me.exceptionPanel = exceptionPanel;
    },
    exceptionHandler: function() {}
});
//  console.log("exceptionHandler");

/**
 * 页面设置（偏好按钮）
 * 1.页面设置是面向页面的，页面中只有一个页面设置按钮。
 * 2.偏好的内容包括全局的语言选择，列表（grid）的页面大小及查询面板中的查询条件。
 * 3.支持页面偏号的保存，清除。
 * 注：
 *     具体的页面外观设计参照：云平台前台界面样式统一化设计-4.0
 */
Ext.define('Rs.ext.button.PrefButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.pref-button',
    iconCls: 'rs-icon-cog',
    initComponent: function() {
        var me = this;
        me.callParent();
        me.on('click', me.statics().showPrefHandler);
    },
    translations: {
        '': {
            zh: '页面设置',
            en: 'Page Settings'
        }
    }
}, function(Cls) {
    var a = function(combox, record) {
            var vf = combox.valueField,
                lang = record.get(vf),
                comps = [];
            //pref, pref.btn
            Ext.iterate(Rs.MULTILANGUAGE, function(id, ctn) {
                var comp = Ext.getCmp(id);
                comp && comps.push(comp);
            });
            Ext.each(comps, function(comp) {
                comp.translate(lang);
            });
            Rs.LANG = lang;
        };
    var pref = Ext.create('Ext.window.Window', {
            closable: false,
            translations: {
                '': {
                    zh: '页面设置',
                    en: 'Preference Settings'
                },
                '#lang': {
                    zh: '语言',
                    en: 'Language'
                },
                '#pagesize': {
                    zh: '当页数据',
                    en: 'Page Size'
                },
                '#test': {
                    zh: '条',
                    en: 'Items'
                },
                '#conditions': {
                    zh: '查询条件',
                    en: 'Query Conditions'
                },
                '#save': {
                    zh: '保存页面偏好',
                    en: 'Save'
                },
                '#ok': {
                    zh: '确定',
                    en: 'OK'
                }
            },
            listeners: {
                'focusleave': function(win) {
                    win.hide();
                }
            },
            items: [
                {
                    xtype: 'form',
                    border: false,
                    bodyPadding: 20,
                    layout: {
                        type: 'vbox',
                        pack: 'center',
                        align: 'center'
                    },
                    defaults: {
                        width: 280,
                        labelAlign: 'right'
                    },
                    fbar: [
                        '->',
                        {
                            type: 'button',
                            itemId: 'ok',
                            handler: function() {
                                pref.hide();
                            }
                        },
                        '->'
                    ],
                    items: [
                        {
                            xtype: 'combobox',
                            itemId: 'lang',
                            value: Rs.LANG,
                            store: [
                                [
                                    'zh',
                                    '中文'
                                ],
                                [
                                    'en',
                                    'English'
                                ]
                            ],
                            listeners: {
                                'select': a
                            }
                        }
                    ]
                }
            ]
        });
    /*, {
                xtype: 'fieldcontainer',
                itemId: 'pagesize',
                layout: 'hbox',
                items: [{
                    xtype: 'numberfield',
                    flex: 1
                }, {
                    xtype: 'splitter'
                }, {
                    xtype: 'displayfield',
                    itemId: 'test',
                    labelSeparator: ''
                }]
            }, {
                xtype: 'combobox',
                itemId: 'conditions'
            }, {
                xtype: 'checkboxfield',
                itemId: 'save'
            }*/
    Cls.addStatics({
        showPrefHandler: function(btn) {
            pref.btn = btn;
            pref.show();
        }
    });
});

/**
 * @class Rs.ext.button.RsButton
 * @extends Ext.button.Button
 * @author ZanShuangpeng
 * RsButton
 */
Ext.define('Rs.ext.button.RsButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.rsbutton',
    //_btnCls: Ext.baseCSSPrefix + 'btn-RsButton',
    //overCls: Ext.baseCSSPrefix + 'btn-RsOver',
    //_pressedCls: Ext.baseCSSPrefix + 'btn-RsPressed',
    initComponent: function() {
        var me = this;
        tempStyle = {};
        tempStyle.background = 'linear-gradient(#e4f3ff 45%,#c3d9f3 50%,#c9dffa 90%,#d7ecff 95%)';
        tempStyle.borderColor = '#aac8f1';
        me.style = Ext.Object.merge(tempStyle, me.style);
        // WAI-ARIA spec requires that menu buttons react to Space and Enter keys
        // by showing the menu while leaving focus on the button, and to Down Arrow key
        // by showing the menu and selecting first menu item. This behavior may conflict
        // with historical Ext JS menu button behavior if a handler or a click listener
        // is set on a button; in that case Space or Enter key would activate
        // the handler/click listener, and only Down Arrow key would open the menu.
        // To avoid the ambiguity, we check if the button has both menu *and* handler
        // or click event listener, and warn the developer in that case.
        // Note that this check does not apply to Split buttons because those now have
        // two tab stops and can effectively combine both menu and toggling/href/handler.
        if (!me.isSplitButton && me.menu) {
            if (me.enableToggle || me.toggleGroup) {
                Ext.ariaWarn(me, "According to WAI-ARIA 1.0 Authoring guide " + "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " + "menu button '" + me.id + "' behavior will conflict with " + "toggling.");
            }
            if (me.href) {
                Ext.ariaWarn(me, "According to WAI-ARIA 1.0 Authoring guide " + "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " + "menu button '" + me.id + "' cannot behave as a link.");
            }
            // Only check listeners of the component instance; there could be other
            // listeners on the EventBus inherited via hasListeners prototype.
            if (me.handler || me.hasListeners.hasOwnProperty('click')) {
                Ext.ariaWarn(me, "According to WAI-ARIA 1.0 Authoring guide " + "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " + "menu button '" + me.id + "' should display the menu " + "on SPACE and ENTER keys, which will conflict with the " + "button handler.");
            }
        }
        // Ensure no selection happens
        me.addCls(Ext.baseCSSPrefix + 'unselectable');
        me.callParent();
        if (me.menu) {
            // Flag that we'll have a splitCls
            me.split = true;
            me.setMenu(me.menu, /* destroyMenu */
            false, true);
        }
        // Accept url as a synonym for href
        if (me.url) {
            me.href = me.url;
        }
        // preventDefault defaults to false for links
        me.configuredWithPreventDefault = me.hasOwnProperty('preventDefault');
        if (me.href && !me.configuredWithPreventDefault) {
            me.preventDefault = false;
        }
        if (Ext.isString(me.toggleGroup) && me.toggleGroup !== '') {
            me.enableToggle = true;
        }
        if (me.html && !me.text) {
            me.text = me.html;
            delete me.html;
        }
    },
    onMouseOver: function(e) {
        var me = this;
        me.el.dom.style.background = 'linear-gradient(#F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)';
        me.el.dom.style.borderColor = '#7EA9E2';
        if (!me.disabled && !e.within(me.el, true, true)) {
            me.onMouseEnter(e);
        }
    },
    onMouseOut: function(e) {
        var me = this;
        me.el.dom.style.background = 'linear-gradient(#e4f3ff 45%,#c3d9f3 50%,#c9dffa 90%,#d7ecff 95%)';
        me.el.dom.style.borderColor = '#aac8f1';
        if (!e.within(me.el, true, true)) {
            if (me.overMenuTrigger) {
                me.onMenuTriggerOut(e);
            }
            me.onMouseLeave(e);
        }
    },
    onMouseDown: function(e) {
        var me = this,
            activeEl;
        me.el.dom.style.background = 'linear-gradient(#BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)';
        me.el.dom.style.borderColor = '#99BBE8';
        if (Ext.isIE || Ext.isEdge || e.pointerType === 'touch') {
            // In IE the use of unselectable on the button's elements causes the element
            // to not receive focus, even when it is directly clicked.
            // On Touch devices, we need to explicitly focus on touchstart.
            if (me.deferFocusTimer) {
                Ext.undefer(me.deferFocusTimer);
            }
            activeEl = Ext.Element.getActiveElement();
            me.deferFocusTimer = Ext.defer(function() {
                var focusEl;
                me.deferFocusTimer = null;
                // We can't proceed if we've been destroyed, or the app has since controlled
                // the focus, or if we are no longer focusable.
                if (me.destroying || me.destroyed || (Ext.Element.getActiveElement() !== activeEl) || !me.canFocus()) {
                    return;
                }
                focusEl = me.getFocusEl();
                // Deferred to give other mousedown handlers the chance to preventDefault
                if (focusEl && !e.defaultPrevented) {
                    focusEl.focus();
                }
            }, 1);
        }
        if (!me.disabled && e.button === 0) {
            Ext.button.Manager.onButtonMousedown(me, e);
            me.removeCls(me._arrowPressedCls);
            me.addCls(me._pressedCls);
        }
    },
    onMouseUp: function(e) {
        var me = this;
        me.el.dom.style.background = 'linear-gradient(#F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)';
        me.el.dom.style.borderColor = '#aac8f1';
        // If the external mouseup listener of the ButtonManager fires after the button
        // has been destroyed, ignore.
        if (!me.destroyed && e.button === 0) {
            if (!me.pressed) {
                me.removeCls(me._pressedCls);
            }
        }
    }
});

/**
 * @class Rs.ext.data.FrontCachedStore
 * @extends Ext.data.Store
 * @author LiGuangqiao
 * 伴生数据存储 获取请求数据的同时会缓存到伴生静态存储（cachedStore）中
 */
Ext.define('Rs.ext.data.FrontCachedStore', {
    extend: 'Ext.data.Store',
    alias: 'store.frontcachedstore',
    configs: {
        /**
         *@cfg {object} extraParams
         *额外参数对象
         */
        extraParams: {},
        /**
         *@cfg {string} gridPanelId
         *与当前store绑定的grid列表面板ID
         */
        gridPanelId: '',
        /**
         *@cfg {string} isCacheDataToFront
         *defaultValue:false
         *是否将数据缓存到静态存储，开关打开后默认已加载过的数据不再重新请求
         */
        isCacheDataToFront: false,
        /**
         *@cfg {string} paramsFormStrict
         *defaultValue:true
         *请求的参数是否按照规范严格要求例如：params: {"sysCode":"sys","parentMenuCode":"gl20"}
         */
        paramsFormStrict: true
    },
    extraParams: {},
    //"test":"haoshuohaohsuo"
    isFrontCachedStore: true,
    paramsFormStrict: true,
    paramKey: "params",
    isCacheDataToFront: false,
    isDynamicStore: true,
    forceChangeStore: false,
    constructor: function(config) {
        var me = this,
            data;
        if (config) {
            if (config.buffered) {
                if (this.self !== Ext.data.Store) {
                    Ext.raise('buffered config not supported on derived Store classes. ' + 'Please derive from Ext.data.BufferedStore.');
                }
                // Hide this from Cmd
                /* eslint-disable-next-line dot-notation */
                return new Ext.data['BufferedStore'](config);
            }
            if (config.remoteGroup) {
                Ext.log.warn('Ext.data.Store: remoteGroup has been removed. ' + 'Use remoteSort instead.');
            }
        }
        /**
         * @event beforeprefetch
         * Fires before a prefetch occurs. Return `false` to cancel.
         * @param {Ext.data.Store} this
         * @param {Ext.data.operation.Operation} operation The associated operation.
         */
        /**
         * @event groupchange
         * Fired whenever the grouping in the grid changes.
         * @param {Ext.data.Store} store The store.
         * @param {Ext.util.Grouper} grouper The grouper object.
         */
        /**
         * @event prefetch
         * Fires whenever records have been prefetched.
         * @param {Ext.data.Store} this
         * @param {Ext.data.Model[]} records An array of records.
         * @param {Boolean} successful `true` if the operation was successful.
         * @param {Ext.data.operation.Operation} operation The associated operation.
         */
        /**
         * @event filterchange
         * Fired whenever the filter set changes.
         * @param {Ext.data.Store} store The store.
         * @param {Ext.util.Filter[]} filters The array of Filter objects.
         */
        me.callParent([
            config
        ]);
        // See applyData for the details.
        data = me.inlineData;
        if (data) {
            delete me.inlineData;
            me.loadInlineData(data);
        }
        var proxy = me.getProxy();
        me.initCachedStore();
        //保持静态数据存储与动态请求数据存储的页码信息保持一致
        me.cachedStore.on('load', function(store) {
            var dataRemovedArray = [];
            store.totalCount = store.queryStaticDataCondintion["noRelatedDataTotalCount"];
            if (!Ext.isEmpty(store.relationStaticDataArry)) {
                Ext.each(store.relationStaticDataArry, function(recordObj, index, array) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === store.currentPage && recordObj["queryRecord"] === store.queryStaticDataCondintion["queryRecord"]) {
                        if (recordObj["queryRecord"].phantom) {
                            store.totalCount = tempRecord["data"].length;
                        } else {
                            store.totalCount = tempRecord["relatedDataTotalCount"];
                        }
                    }
                    if (!Ext.isEmpty(store.getDynamicStore().removedRecord)) {
                        Ext.each(store.getDynamicStore().removedRecord, function(recordRemoved, index, itself) {
                            if (recordObj["queryRecord"] === recordRemoved) {
                                dataRemovedArray.push(recordObj);
                            }
                        });
                    }
                });
                Ext.each(dataRemovedArray, function(obj) {
                    Ext.Array.remove(store.relationStaticDataArry, obj);
                });
            }
        });
        /*
        me.cachedStore.on('clear', function (store) {
        //me.cachedDataAllClear();
        });
         */
        //当前为静态存储（cachedStore）时每次新增数据，同步到缓存数据集中
        me.cachedStore.on('add', function(store, record, index) {
            if (index === 0) {
                store.totalCount = 1;
            }
            me.synchroData(store, store);
        });
        //当前为静态存储（cachedStore）时每次删除数据，同步到缓存数据集中
        me.cachedStore.on('remove', function(store, records, index) {
            me.synchroData(store, store);
        });
        me.cachedStore.onAfter('remove', function(store, records, index, isMove) {
            var grid = Ext.getCmp(me.gridPanelId);
            if (!Ext.Object.isEmpty(grid.relationGridStoreSet)) {
                Ext.Object.eachValue(grid.relationGridStoreSet, function(relationGridStore) {
                    relationGridStore.removedRecord = records;
                });
            }
        });
        // grid.relationGridStore.removedRecord = records;
        //往关联面板传递请求参数
        me.on('beforeload', function(store) {
            var finalQueryParams = {},
                proxyParams, queryParams;
            proxyParams = proxy.getConfig("extraParams");
            if (!Ext.isEmpty(proxyParams)) {
                if (!Ext.isEmpty(proxyParams[me.paramKey])) {
                    if (!Ext.isEmpty(me.queryConditionField) && !Ext.isString(proxyParams[me.paramKey])) {
                        queryParams = Ext.Object.merge(proxyParams, me.queryConditionField);
                    } else if (!Ext.isEmpty(me.queryConditionField) && Ext.isString(proxyParams[me.paramKey])) {
                        queryParams = Ext.Object.merge(Ext.decode(proxyParams[me.paramKey]), me.queryConditionField);
                    } else {
                        if (Ext.isString(proxyParams[me.paramKey])) {
                            queryParams = Ext.decode(proxyParams[me.paramKey]);
                        } else {
                            queryParams = proxyParams[me.paramKey];
                        }
                    }
                } else {
                    if (!Ext.isEmpty(me.queryConditionField)) {
                        queryParams = Ext.Object.merge(proxyParams, me.queryConditionField);
                    } else {
                        queryParams = proxyParams;
                    }
                }
                Ext.Object.merge(queryParams, store.extraParams);
                if (me.paramsFormStrict && !Ext.Object.isEmpty(queryParams)) {
                    finalQueryParams[me.paramKey] = Ext.encode(queryParams);
                } else {
                    finalQueryParams = queryParams;
                }
            }
            if (proxy.type !== "memory") {
                proxy.setConfig("extraParams", finalQueryParams);
            }
        });
        me.on('clear', function(store) {
            me.cachedDataAllClear();
        });
        //每次动态store新增数据，同步到缓存数据集中
        me.on('add', function(store, record, index) {
            me.synchroData(me.getCachedStore(), me);
            
        });
        //每次动态store删除数据，同步到缓存数据集中
        me.on('remove', function(store, records, index) {
            me.synchroData(me.getCachedStore(), me);
        });
        me.onAfter('remove', function(store, records, index, isMove) {
            var grid = Ext.getCmp(store.gridPanelId);
            if (!Ext.Object.isEmpty(grid.relationGridStoreSet)) {
                Ext.Object.eachValue(grid.relationGridStoreSet, function(relationGridStore) {
                    relationGridStore.removedRecord = records;
                });
            }
        });
        // grid.relationGridStore.removedRecord = records;
        //记录数据总数，并将无关联列表数据保存到缓存store的noRelationStaticDataObj里（关联列表数据存到relationStaticDataArry里）
        me.on('load', function(store) {
            var cachedData = store.getCachedStore().getRelationStaticDataArry(),
                dataRemovedArray = [];
            if (!Ext.isEmpty(cachedData) && !Ext.isEmpty(store.removedRecord)) {
                Ext.each(cachedData, function(pageRecord, index, array) {
                    var cachedPageData = pageRecord.cachedPageData;
                    Ext.each(store.removedRecord, function(recordRemoved, index, itself) {
                        if (pageRecord["queryRecord"] === recordRemoved) {
                            dataRemovedArray.push(pageRecord);
                        }
                    });
                });
                Ext.each(dataRemovedArray, function(obj) {
                    Ext.Array.remove(store.relationStaticDataArry, obj);
                });
            }
            me.synchroData(me.getCachedStore(), me);
        });
    },
    setExtraParams: function(obj) {
        var me = this;
        me.extraParams = obj;
    },
    getExtraParams: function() {
        var me = this;
        return me.obj;
    },
    /**
     * 重写loadPage函数
     * private
     * @method loadPage
     * 逻辑简述：每次执行loadPage时先检验cachedStore中是否已有数据----->是------>使用cachedStore加载静态数据
     * 															|
     *															 ----->否------>发送请求去加载数据
     */
    loadPage: function(page, options) {
        var me = this,
            size = me.getPageSize(),
            grid = Ext.getCmp(me.gridPanelId);
        me.currentPage = page;
        if (Ext.isEmpty(options)) {
            options = {
                newRecord: false
            };
        }
        if ((options.newRecord && (!me.isHaveCachData(page))) || (me.isHaveCachData(page) && me.isCacheDataToFront && (!me.forceChangeStore))) {
            //console.log("dynamicStore to cachedStore", grid.id);
            grid.setStore(me.cachedStore);
            me.cachedStore.loadPage(page, options);
        } else {
            grid.setStore(me);
            // console.log("dynamicStore load", grid.id);
            options = Ext.apply({
                page: page,
                start: (page - 1) * size,
                limit: size,
                addRecords: !me.getClearOnPageLoad()
            }, options);
            me.read(options);
            me.forceChangeStore = false;
        }
    },
    /**
     * 重写cachedStore的loadPage函数
     * private
     * @method cachedLoadPage
     * 逻辑简述：每次执行loadPage时先检验cachedStore中是否已有数据----->是------>在cachedStore加载静态数据
     * 															|
     *															 ----->否------>使用dynamicStore去加载数据
     */
    cachedLoadPage: function(page, options) {
        var me = this,
            size = me.getPageSize(),
            grid = Ext.getCmp(me.dynamicStore.gridPanelId),
            record;
        if (Ext.isEmpty(options)) {
            options = {
                newRecord: false
            };
        }
        if ((options.newRecord && (!me.isHaveCachData(page))) || (me.isHaveCachData(page) && me.isCacheDataToFront && (!me.forceChangeStore))) {
            //console.log("cachedStore load", grid.id);
            me.removeAll();
            if (!Ext.isEmpty(me.relationStaticDataArry)) {
                Ext.each(me.relationStaticDataArry, function(recordObj) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === page && recordObj["queryRecord"] === me.queryStaticDataCondintion["queryRecord"]) {
                        record = tempRecord.data;
                    }
                });
            } else {
                record = me.noRelationStaticDataObj[page];
            }
            me.currentPage = page;
            me.setData(record);
            options = Ext.apply({
                page: page,
                start: (page - 1) * size,
                limit: size,
                addRecords: true
            }, options);
            me.read(options);
        } else {
            // console.log("cachedStore to dynamicStore", grid.id);
            me.forceChangeStore = false;
            grid.setStore(me.dynamicStore);
            me.dynamicStore.loadPage(page, options);
        }
    },
    /**
     * 判断是否已经有静态数据
     * private
     * @method isHaveCachData
     * @return {boolean} true/false
     * 逻辑简述：
     * 根据relationStaticDataArry（关联查询的静态数据集，多帧页面时启用优先级大于无关联面板数据集）、
     * noRelationStaticDataObj（无关联面板的静态数据集）判断是否已经有静态数据
     *
     */
    isHaveCachData: function(page) {
        var me = this,
            flag = false;
        if (me.isDynamicStore) {
            if (!Ext.isEmpty(me.cachedStore.relationStaticDataArry)) {
                Ext.each(me.cachedStore.relationStaticDataArry, function(pageRecord, index, array) {
                    var cachedPageData = pageRecord.cachedPageData;
                    if (pageRecord["currentPage"] === page && pageRecord["queryRecord"] === me.cachedStore.queryStaticDataCondintion["queryRecord"]) {
                        flag = true;
                    }
                });
            }
            if (!Ext.isEmpty(me.cachedStore.noRelationStaticDataObj[page])) {
                flag = true;
            }
        }
        if (me.isCachedStore) {
            if (!Ext.isEmpty(me.relationStaticDataArry)) {
                Ext.each(me.relationStaticDataArry, function(pageRecord, index, array) {
                    var cachedPageData = pageRecord.cachedPageData;
                    if (pageRecord["currentPage"] === page && pageRecord["queryRecord"] === me.queryStaticDataCondintion["queryRecord"]) {
                        flag = true;
                    }
                });
            }
            if (!Ext.isEmpty(me.noRelationStaticDataObj)) {
                if (!Ext.isEmpty(me.noRelationStaticDataObj[page])) {
                    flag = true;
                }
            }
        }
        return flag;
    },
    /**
     * 初始化静态数据存储
     * private
     * @method initCachedStore
     */
    initCachedStore: function() {
        var me = this,
            cachedStore = Ext.create('Ext.data.Store', {
                id: me.id + "Cached",
                dynamicStore: me,
                isFrontCachedStore: true,
                isCachedStore: true,
                pageSize: me.getPageSize(),
                //当前grid没有被关联时的的静态数据集
                noRelationStaticDataObj: {},
                //当前grid被关联时页面静态数据集
                relationStaticDataArry: [],
                isCacheDataToFront: me.isCacheDataToFront,
                model: me.getModel(),
                queryStaticDataCondintion: {},
                proxy: {
                    type: 'memory',
                    enablePaging: true,
                    reader: {
                        type: 'json'
                    }
                },
                loadPage: me.cachedLoadPage,
                isHaveCachData: me.isHaveCachData,
                getCachedStore: me.getCachedStore,
                getDynamicStore: me.getDynamicStore,
                //获取无关联页面静态缓存数据集
                getRelationStaticDataArry: function() {
                    return me.getCachedStore().relationStaticDataArry;
                },
                //获取关联查询页面静态缓存数据集
                getNoRelationStaticDataObj: function() {
                    return me.getCachedStore().noRelationStaticDataObj;
                }
            });
        me.cachedStore = cachedStore;
    },
    /**
     * 返回静态缓存数据存储
     * public
     * @method getCachedStore
     * @return {Ext.data.Store} CachedStore
     */
    getCachedStore: function() {
        var me = this;
        if (me.isDynamicStore) {
            return me.cachedStore;
        }
        return me;
    },
    /**
     * 返回动态请求数据存储
     * public
     * @method getDynamicStore
     * @return {Rs.ext.data.frontCachedStore} getdynamicStore
     */
    getDynamicStore: function() {
        var me = this;
        if (me.isCachedStore) {
            return me.dynamicStore;
        }
        return me;
    },
    /**
     * 清空缓存数据
     * public
     * @method cachedDataAllClear
     */
    cachedDataAllClear: function() {
        var me = this;
        if (!Ext.isEmpty(me.getCachedStore().getRelationStaticDataArry())) {
            me.getCachedStore().getRelationStaticDataArry().length = 0;
        }
        if (!Ext.isEmpty(me.getCachedStore().getNoRelationStaticDataObj())) {
            Ext.Object.clear(me.getCachedStore().getNoRelationStaticDataObj());
        }
    },
    /**
     * 同步数据方法
     * private
     * @method synchroData
     */
    synchroData: function(cachedStore, currentStore) {
        var isPush = true;
        cachedStore.queryStaticDataCondintion["noRelatedDataTotalCount"] = currentStore.totalCount;
        if (currentStore.totalCount === 0) {
            cachedStore.queryStaticDataCondintion["noRelatedDataTotalCount"] = 1;
            currentStore.totalCount = 1;
        }
        cachedStore.queryStaticDataCondintion["currentPage"] = currentStore.currentPage;
        if (!Ext.isEmpty(cachedStore.queryStaticDataCondintion["queryRecord"])) {
            var tempObj = {
                    relatedDataTotalCount: cachedStore.queryStaticDataCondintion["noRelatedDataTotalCount"],
                    data: currentStore.getRange()
                },
                tempObjP = {
                    currentPage: cachedStore.queryStaticDataCondintion["currentPage"],
                    queryRecord: cachedStore.queryStaticDataCondintion["queryRecord"],
                    cachedPageData: tempObj
                };
            if (!Ext.isEmpty(cachedStore.relationStaticDataArry)) {
                Ext.each(cachedStore.relationStaticDataArry, function(obj, index) {
                    if (obj["currentPage"] === tempObjP["currentPage"] && obj["queryRecord"] === tempObjP["queryRecord"]) {
                        isPush = false;
                        //  console.log("dynamicStore queryRecord");
                        Ext.Array.replace(cachedStore.relationStaticDataArry, index, 1, [
                            tempObjP
                        ]);
                    }
                });
                if (isPush) {
                    cachedStore.relationStaticDataArry.push(tempObjP);
                }
            } else {
                cachedStore.relationStaticDataArry.push(tempObjP);
            }
        } else {
            cachedStore.noRelationStaticDataObj[currentStore.currentPage] = currentStore.getRange();
        }
    }
});

/**
 * @class Rs.ext.data.RsStore
 * @extends Ext.data.Store
 * @author ZanShuangpeng
 * RsStore
 */
Ext.define('Rs.ext.data.RsStore', {
    extend: 'Ext.data.Store',
    alias: 'widget.rsstore',
    configs: {
        /**
         *@cfg {String} addAltText
         *是否触发load前验证
         */
        checkBeforeLoad: true,
        /**
         *@cfg {String} addIcon
         *默认值字段
         */
        defaultFieldValue: {}
    },
    loadPage: function(page, options) {
        var me = this,
            size = me.getPageSize();
        if (me.checkBeforeLoad && me.checkNeedSync()) {
            Ext.Msg.show({
                title: '提示',
                msg: '存在未保存的数据,确定继续操作?',
                buttons: Ext.Msg.OKCANCEL,
                closable: false,
                fn: function(btn, text) {
                    //me.un('beforeload' , me.beforeLoadCheckData , me);
                    if (btn == 'ok') {
                        me.checkNeedSyncFlag = true;
                        me.currentPage = page;
                        // Copy options into a new object so as not to mutate passed in objects
                        options = Ext.apply({
                            page: page,
                            start: (page - 1) * size,
                            limit: size,
                            addRecords: !me.getClearOnPageLoad()
                        }, options);
                        me.read(options);
                        me.needsSync = undefined;
                    } else {
                        me.checkNeedSyncFlag = '';
                    }
                },
                scope: me
            });
            return;
        }
        me.checkNeedSyncFlag = '';
        me.currentPage = page;
        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            page: page,
            start: (page - 1) * size,
            limit: size,
            addRecords: !me.getClearOnPageLoad()
        }, options);
        me.read(options);
    },
    flushLoad: function() {
        var me = this,
            options = me.pendingLoadOptions,
            operation;
        if (me.destroying || me.destroyed) {
            return;
        }
        // If it gets called programatically before the timer fired, the listener will need
        // cancelling.
        me.clearLoadTask();
        if (!options) {
            return;
        }
        me.setLoadOptions(options);
        if (me.getRemoteSort() && options.sorters) {
            me.fireEvent('beforesort', me, options.sorters);
        }
        operation = Ext.apply({
            internalScope: me,
            internalCallback: me.onProxyLoad,
            scope: me
        }, options);
        me.lastOptions = operation;
        operation = me.createOperation('read', operation);
        if (Ext.isEmpty(me.checkNeedSyncFlag) && me.checkBeforeLoad && me.checkNeedSync()) {
            Ext.Msg.show({
                title: '提示',
                msg: '存在未保存的数据,确定继续操作?',
                buttons: Ext.Msg.OKCANCEL,
                closable: false,
                fn: function(btn, text) {
                    // me.un('beforeload' , me.beforeLoadCheckData , me);
                    if (btn == 'ok') {
                        me.checkNeedSyncFlag = '';
                        if (me.fireEvent('beforeload', me, operation) !== false) {
                            me.onBeforeLoad(operation);
                            me.loading = true;
                            // Internal event, fired after the flag is set, we need
                            // to fire this beforeload is too early
                            if (me.hasListeners.beginload) {
                                me.fireEvent('beginload', me, operation);
                            }
                            operation.execute();
                        } else {
                            if (me.getAsynchronousLoad()) {
                                operation.abort();
                            }
                            operation.setCompleted();
                        }
                    } else {
                        return;
                    }
                },
                scope: me
            });
        } else {
            me.checkNeedSyncFlag = '';
            if (me.fireEvent('beforeload', me, operation) !== false) {
                me.onBeforeLoad(operation);
                me.loading = true;
                // Internal event, fired after the flag is set, we need
                // to fire this beforeload is too early
                if (me.hasListeners.beginload) {
                    me.fireEvent('beginload', me, operation);
                }
                operation.execute();
            } else {
                if (me.getAsynchronousLoad()) {
                    operation.abort();
                }
                operation.setCompleted();
            }
        }
    },
    checkNeedSync: function() {
        var me = this;
        modifiedRecords = me.getModifiedRecords();
        modifiedFlag = false;
        newRecord = [];
        emptyCount = 0;
        if (Ext.isEmpty(modifiedRecords)) {
            if (me.checkDeleteRecord()) {
                return true;
            } else {
                return false;
            }
        } else {
            Ext.each(modifiedRecords, function(modifiedRecord) {
                if (emptyCount > 0) {
                    return true;
                }
                modifiedFlag = me.checkIsEmptyRecord(modifiedRecord);
                if (!modifiedFlag) {
                    emptyCount += 1;
                    return true;
                }
            }, this);
            if (modifiedFlag) {
                return false;
            } else {
                return true;
            }
        }
    },
    //验证某一行是否为修改行
    checkIsEmptyRecord: function(record) {
        var me = this;
        emptyFlag = true;
        if (record.crudState == 'U') {
            emptyFlag = false;
            return emptyFlag;
        }
        if (record.crudState == 'D') {
            emptyFlag = true;
            return emptyFlag;
        }
        if (me.checkDeleteRecord()) {
            emptyFlag = false;
            return emptyFlag;
        }
        if (record.phantom) {
            var columnfields = Object.keys(record.data);
            defaultFields = Ext.isEmpty(me.defaultFieldValue) ? '' : Object.keys(me.defaultFieldValue);
            Ext.each(defaultFields, function(defaultField) {
                var col = columnfields.indexOf(defaultField);
                if (col == -1) {} else {
                    columnfields.splice(col, 1);
                }
            });
            for (var i = 1; i < columnfields.length; i++) {
                if (!Ext.isEmpty(record.data[columnfields[i]])) {
                    emptyFlag = false;
                    return emptyFlag;
                }
            }
        }
        return emptyFlag;
    },
    checkDeleteRecord: function() {
        var me = this;
        deleteFlag = false;
        me.each(function(record) {
            if (!deleteFlag) {
                if (record.deleteFlag == 'D') {
                    deleteFlag = true;
                }
            }
        }, this);
        if (deleteFlag) {
            return true;
        } else {
            return false;
        }
    }
});

/**
	 * @Rs.ext.field.plugin.ControlStatusPlugin
	 * @extends Ext.plugin.Abstract
	 * @author 
	 * 后台业务状态控制插件
	 */
Ext.define('Rs.ext.field.plugin.ControlStatusPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.controlstatus',
    requires: 'Ext.form.field.Field',
    configs: {
        panelId: '',
        controlObj: '',
        errorCode: '',
        tipType: ''
    },
    init: function() {
        var me = this;
        if (me.config.panelId && Ext.getCmp(me.config.panelId).isXType('form')) {
            //卡片
            var obj = me.config.controlObj;
            if (obj) {
                for (var i = 0; i < obj.length; i++) {
                    (function() {
                        var queryStr = obj[i].queryStr;
                        var targetValue = obj[i].targetValue;
                        var reg = /\[(.*?)\]/gi;
                        var tmp = queryStr.match(reg);
                        if (tmp && tmp.length == 1) {
                            var fieldId = tmp[0].replace(reg, "$1");
                            Ext.getCmp(fieldId).on('blur', function(cmp) {
                                var sql = queryStr.replace(tmp[0], cmp.getValue());
                                me.formFieldsControlStatus(sql, fieldId, targetValue);
                            });
                        }
                    })();
                }
            }
        }
    },
    formFieldsControlStatus: function(sql, fieldId, targetValue) {
        var params = {};
        params.sql = sql;
        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function(response, opts) {
                var data = [];
                var responseText = Ext.decode(response.responseText);
                if (responseText.success) {
                    data = responseText.data;
                } else {
                    console.log("系统提示", responseText.mesg);
                }
                if (data.length < 1) {
                    Ext.getCmp(fieldId).setValue();
                }
            },
            failure: function(response, opts) {
                Ext.getCmp(fieldId).setValue();
                console.log("系统提示", "服务器未连接");
            }
        });
    }
});

Ext.define('Rs.ext.form.PagePanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.Pageform',
    alternateClassName: [
        'Ext.PageFormPanel',
        'Ext.form.PageFormPanel'
    ],
    configs: {
        /**
         *@cfg {String} store
         *����Դ
         */
        store: '',
        /**
         *@cfg {Boolean} addIcon
         *������ʱĬ������
         */
        insertFlag: false
    },
    /**
     * @cfg {Boolean} pollForChanges
     * If set to `true`, sets up an interval task (using the {@link #pollInterval}) in which the
     * panel's fields are repeatedly checked for changes in their values. This is in addition
     * to the normal detection each field does on its own input element, and is not needed
     * in most cases. It does, however, provide a means to absolutely guarantee detection
     * of all changes including some edge cases in some browsers which do not fire native events.
     * Defaults to `false`.
     */
    /**
     * @cfg {Number} pollInterval
     * Interval in milliseconds at which the form's fields are checked for value changes. Only used
     * if the {@link #pollForChanges} option is set to `true`. Defaults to 500 milliseconds.
     */
    /**
     * @cfg {Ext.enums.Layout/Object} layout
     * The {@link Ext.container.Container#layout} for the form panel's immediate child items.
     */
    layout: 'anchor',
    bodyAriaRole: 'form',
    basicFormConfigs: [
        /**
         * @cfg api
         * @inheritdoc Ext.form.Basic#cfg!api
         */
        'api',
        /**
         * @cfg baseParams
         * @inheritdoc Ext.form.Basic#cfg!baseParams
         */
        'baseParams',
        /**
         * @cfg errorReader
         * @inheritdoc Ext.form.Basic#cfg!errorReader
         */
        'errorReader',
        /**
         * @cfg jsonSubmit
         * @inheritdoc Ext.form.Basic#cfg!jsonSubmit
         */
        'jsonSubmit',
        /**
         * @cfg method
         * @inheritdoc Ext.form.Basic#cfg!method
         */
        'method',
        /**
         * @cfg paramOrder
         * @inheritdoc Ext.form.Basic#cfg!paramOrder
         */
        'paramOrder',
        /**
         * @cfg paramsAsHash
         * @inheritdoc Ext.form.Basic#cfg!paramsAsHash
         */
        'paramsAsHash',
        /**
         * @cfg reader
         * @inheritdoc Ext.form.Basic#cfg!reader
         */
        'reader',
        /**
         * @cfg standardSubmit
         * @inheritdoc Ext.form.Basic#cfg!standardSubmit
         */
        'standardSubmit',
        /**
         * @cfg timeout
         * @inheritdoc Ext.form.Basic#cfg!timeout
         */
        'timeout',
        /**
         * @cfg trackResetOnLoad
         * @inheritdoc Ext.form.Basic#cfg!trackResetOnLoad
         */
        'trackResetOnLoad',
        /**
         * @cfg url
         * @inheritdoc Ext.form.Basic#cfg!url
         */
        'url',
        /**
         * @cfg waitMsgTarget
         * @inheritdoc Ext.form.Basic#cfg!waitMsgTarget
         */
        'waitMsgTarget',
        /**
         * @cfg waitTitle
         * @inheritdoc Ext.form.Basic#cfg!waitTitle
         */
        'waitTitle'
    ],
    initComponent: function() {
        var me = this;
        if (me.frame) {
            me.border = false;
        }
        if (Ext.isEmpty(me.insertFlag)) {
            me.insertFlag = false;
        }
        me.initFieldAncestor();
        me.callParent();
        me.relayEvents(me.form, [
            /**
             * @event beforeaction
             * @inheritdoc Ext.form.Basic#beforeaction
             */
            'beforeaction',
            /**
             * @event actionfailed
             * @inheritdoc Ext.form.Basic#actionfailed
             */
            'actionfailed',
            /**
             * @event actioncomplete
             * @inheritdoc Ext.form.Basic#actioncomplete
             */
            'actioncomplete',
            /**
             * @event validitychange
             * @inheritdoc Ext.form.Basic#validitychange
             */
            'validitychange',
            /**
             * @event dirtychange
             * @inheritdoc Ext.form.Basic#dirtychange
             */
            'dirtychange'
        ]);
        // Start polling if configured
        if (me.pollForChanges) {
            me.startPolling(me.pollInterval || 500);
        }
        var store = me.store;
        if (store && !Ext.isObject(store) && !store.isStore && !store.storeId) {
            store = Ext.apply({
                autoDestroy: true
            }, store);
            store = me.store = Ext.data.StoreManager.lookup(store || 'ext-empty-store');
            //var store = Ext.getStore(me.store);
            var model = store.model;
            var idProperty = Ext.create('Ext.form.field.Text', {
                    name: model.idProperty,
                    hidden: true
                });
            me.items.items.push(idProperty);
            store.on('load', function(store, records, options) {
                if (!Ext.isEmpty(records) && records.length > 0) {
                    me.page = 0;
                    me.loadRecord(records[0]);
                } else //Ext.loadRecord(Ext.getStore(component.store).data.items[0]);
                {
                    if (me.insertFlag) {
                        me.addNewRecord();
                    }
                }
            });
        }
    },
    //store.add({});
    initItems: function() {
        // Create the BasicForm
        this.callParent();
        this.initMonitor();
        this.form = this.createForm();
    },
    // Initialize the BasicForm after all layouts have been completed.
    afterFirstLayout: function() {
        this.callParent(arguments);
        this.form.initialize();
    },
    /**
     * @private
     */
    createForm: function() {
        var cfg = {},
            props = this.basicFormConfigs,
            len = props.length,
            i = 0,
            prop;
        for (; i < len; ++i) {
            prop = props[i];
            cfg[prop] = this[prop];
        }
        return new Ext.form.Basic(this, cfg);
    },
    /**
     * Provides access to the {@link Ext.form.Basic Form} which this Panel contains.
     * @return {Ext.form.Basic} The {@link Ext.form.Basic Form} which this Panel contains.
     */
    getForm: function() {
        return this.form;
    },
    /**
     * Loads an {@link Ext.data.Model} into this form (internally just calls
     * {@link Ext.form.Basic#loadRecord}).
     * See also {@link Ext.form.Basic#trackResetOnLoad trackResetOnLoad}. The fields in the model
     * are mapped to  fields in the form by matching either the {@link Ext.form.field.Base#name}
     * or {@link Ext.Component#itemId}.  
     * @param {Ext.data.Model} record The record to load
     * @return {Ext.form.Basic} The Ext.form.Basic attached to this FormPanel
     */
    loadRecord: function(record) {
        return this.getForm().loadRecord(record);
    },
    /**
     * Returns the currently loaded Ext.data.Model instance if one was loaded via
     * {@link #loadRecord}.
     * @return {Ext.data.Model} The loaded instance
     */
    getRecord: function() {
        return this.getForm().getRecord();
    },
    /**
     * Persists the values in this form into the passed {@link Ext.data.Model} object
     * in a beginEdit/endEdit block. If the record is not specified, it will attempt to update
     * (if it exists) the record provided to {@link #loadRecord}.
     * @param {Ext.data.Model} [record] The record to edit
     * @return {Ext.form.Basic} The Ext.form.Basic attached to this FormPanel
     */
    updateRecord: function(record) {
        //if(Ext.isEmpty(this.getRecord())){
        //	return false;
        //}
        return this.getForm().updateRecord(record);
    },
    /**
     * @method getValues
     * Convenience function for fetching the current value of each field in the form.
     * This is the same as calling {@link Ext.form.Basic#getValues this.getForm().getValues()}.
     *
     * @inheritdoc Ext.form.Basic#getValues
     */
    getValues: function(asString, dirtyOnly, includeEmptyText, useDataValues) {
        return this.getForm().getValues(asString, dirtyOnly, includeEmptyText, useDataValues);
    },
    /**
     * @method isDirty
     * Convenience function to check if the form has any dirty fields. This is the same as calling
     * {@link Ext.form.Basic#isDirty this.getForm().isDirty()}.
     *
     * @inheritdoc Ext.form.Basic#isDirty
     */
    isDirty: function() {
        return this.form.isDirty();
    },
    /**
     * @method isValid
     * Convenience function to check if the form has all valid fields. This is the same as calling
     * {@link Ext.form.Basic#isValid this.getForm().isValid()}.
     *
     * @inheritdoc Ext.form.Basic#isValid
     */
    isValid: function() {
        return this.form.isValid();
    },
    /**
     * @method reset
     * Convenience function reset the form. This is the same as calling
     * {@link Ext.form.Basic#reset this.getForm().reset()}.
     *
     * @inheritdoc Ext.form.Basic#reset
     */
    reset: function(resetRecord) {
        return this.form.reset(resetRecord);
    },
    /**
     * @method hasInvalidField
     * Convenience function to check if the form has any invalid fields. This is the same as calling
     * {@link Ext.form.Basic#hasInvalidField this.getForm().hasInvalidField()}.
     *
     * @inheritdoc Ext.form.Basic#hasInvalidField
     */
    hasInvalidField: function() {
        return this.form.hasInvalidField();
    },
    doDestroy: function() {
        this.stopPolling();
        this.form.destroy();
        this.callParent();
    },
    /**
     * This is a proxy for the underlying BasicForm's {@link Ext.form.Basic#load} call.
     * @param {Object} options The options to pass to the action (see {@link Ext.form.Basic#load}
     * and {@link Ext.form.Basic#doAction} for details)
     */
    load: function(options) {
        this.form.load(options);
    },
    /**
     * This is a proxy for the underlying BasicForm's {@link Ext.form.Basic#submit} call.
     * @param {Object} options The options to pass to the action (see {@link Ext.form.Basic#submit}
     * and {@link Ext.form.Basic#doAction} for details)
     */
    submit: function(options) {
        this.form.submit(options);
    },
    /**
     * Start an interval task to continuously poll all the fields in the form for changes in their
     * values. This is normally started automatically by setting the {@link #pollForChanges} config.
     * @param {Number} interval The interval in milliseconds at which the check should run.
     */
    startPolling: function(interval) {
        this.stopPolling();
        this.pollTask = Ext.util.TaskManager.start({
            interval: interval,
            run: this.checkChange,
            scope: this
        });
    },
    /**
     * Stop a running interval task that was started by {@link #startPolling}.
     */
    stopPolling: function() {
        var task = this.pollTask;
        if (task) {
            Ext.util.TaskManager.stop(task, true);
            this.pollTask = null;
        }
    },
    /**
     * Forces each field within the form panel to
     * {@link Ext.form.field.Field#checkChange check if its value has changed}.
     */
    checkChange: function() {
        var fields = this.form.getFields().items,
            f,
            fLen = fields.length;
        for (f = 0; f < fLen; f++) {
            fields[f].checkChange();
        }
        if (this.isDirty()) {
            var record = this.getRecord();
            if (Ext.isEmpty(record)) {
                if (this.insertFlag) {
                    this.addNewRecord();
                } else {
                    return false;
                }
            }
            this.updateRecord(this.getRecord());
        } else {
            var record = this.getRecord();
            if (!Ext.isEmpty(record) && !Ext.isEmpty(record.crudState) && !Ext.isEmpty(record.modified)) {
                if (record.crudState === 'U') {
                    //this.revertModified(this.getRecord());
                    this.updateRecord(this.getRecord());
                } else if (record.crudState === 'C') {
                    this.updateRecord(this.getRecord());
                }
            }
        }
    },
    getStore: function() {
        return Ext.getStore(this.store);
    },
    revertModified: function(record) {
        var revertFieds = Object.keys(record.modified);
        Ext.each(revertFieds, function(revertFied) {
            record.set(revertFied, record.modified[revertFied]);
        });
    },
    addNewRecord: function() {
        var store = Ext.getStore(this.store),
            model = store.model,
            record = Ext.create(model, {}),
            items = this.items.items;
        if (this.page != undefined) {
            this.page += 1;
        } else {
            this.page = 0;
        }
        store.insert(this.page, record);
        if (store.data.length > 1) {
            Ext.each(items, function(item) {
                item.setValue();
            });
        }
        this.loadRecord(record);
    }
});

Ext.define('Rs.ext.form.PagePanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.Pageform',
    alternateClassName: [
        'Ext.PageFormPanel',
        'Ext.form.PageFormPanel'
    ],
    configs: {
        /**
         *@cfg {String} store
         *����Դ
         */
        store: '',
        /**
         *@cfg {String} relationGridPanelId
         *���������id
         */
        relationGridPanelId: '',
        /**
         *@cfg {array} relationGridQueryFieldArray
         *�����ֶ�
         */
        relationGridQueryFieldArray: [],
        /**
         *@cfg {Boolean} addIcon
         *������ʱĬ������
         */
        insertFlag: false
    },
    relationGridPanelId: "",
    relationGridQueryFieldArray: [],
    /**
     * @cfg {Boolean} pollForChanges
     * If set to `true`, sets up an interval task (using the {@link #pollInterval}) in which the
     * panel's fields are repeatedly checked for changes in their values. This is in addition
     * to the normal detection each field does on its own input element, and is not needed
     * in most cases. It does, however, provide a means to absolutely guarantee detection
     * of all changes including some edge cases in some browsers which do not fire native events.
     * Defaults to `false`.
     */
    /**
     * @cfg {Number} pollInterval
     * Interval in milliseconds at which the form's fields are checked for value changes. Only used
     * if the {@link #pollForChanges} option is set to `true`. Defaults to 500 milliseconds.
     */
    /**
     * @cfg {Ext.enums.Layout/Object} layout
     * The {@link Ext.container.Container#layout} for the form panel's immediate child items.
     */
    layout: 'anchor',
    bodyAriaRole: 'form',
    basicFormConfigs: [
        /**
         * @cfg api
         * @inheritdoc Ext.form.Basic#cfg!api
         */
        'api',
        /**
         * @cfg baseParams
         * @inheritdoc Ext.form.Basic#cfg!baseParams
         */
        'baseParams',
        /**
         * @cfg errorReader
         * @inheritdoc Ext.form.Basic#cfg!errorReader
         */
        'errorReader',
        /**
         * @cfg jsonSubmit
         * @inheritdoc Ext.form.Basic#cfg!jsonSubmit
         */
        'jsonSubmit',
        /**
         * @cfg method
         * @inheritdoc Ext.form.Basic#cfg!method
         */
        'method',
        /**
         * @cfg paramOrder
         * @inheritdoc Ext.form.Basic#cfg!paramOrder
         */
        'paramOrder',
        /**
         * @cfg paramsAsHash
         * @inheritdoc Ext.form.Basic#cfg!paramsAsHash
         */
        'paramsAsHash',
        /**
         * @cfg reader
         * @inheritdoc Ext.form.Basic#cfg!reader
         */
        'reader',
        /**
         * @cfg standardSubmit
         * @inheritdoc Ext.form.Basic#cfg!standardSubmit
         */
        'standardSubmit',
        /**
         * @cfg timeout
         * @inheritdoc Ext.form.Basic#cfg!timeout
         */
        'timeout',
        /**
         * @cfg trackResetOnLoad
         * @inheritdoc Ext.form.Basic#cfg!trackResetOnLoad
         */
        'trackResetOnLoad',
        /**
         * @cfg url
         * @inheritdoc Ext.form.Basic#cfg!url
         */
        'url',
        /**
         * @cfg waitMsgTarget
         * @inheritdoc Ext.form.Basic#cfg!waitMsgTarget
         */
        'waitMsgTarget',
        /**
         * @cfg waitTitle
         * @inheritdoc Ext.form.Basic#cfg!waitTitle
         */
        'waitTitle'
    ],
    storePage: 1,
    initComponent: function() {
        var me = this;
        if (me.frame) {
            me.border = false;
        }
        if (Ext.isEmpty(me.insertFlag)) {
            me.insertFlag = false;
        }
        me.initFieldAncestor();
        me.callParent();
        me.relayEvents(me.form, [
            /**
                 * @event beforeaction
                 * @inheritdoc Ext.form.Basic#beforeaction
                 */
            'beforeaction',
            /**
                 * @event actionfailed
                 * @inheritdoc Ext.form.Basic#actionfailed
                 */
            'actionfailed',
            /**
                 * @event actioncomplete
                 * @inheritdoc Ext.form.Basic#actioncomplete
                 */
            'actioncomplete',
            /**
                 * @event validitychange
                 * @inheritdoc Ext.form.Basic#validitychange
                 */
            'validitychange',
            /**
                 * @event dirtychange
                 * @inheritdoc Ext.form.Basic#dirtychange
                 */
            'dirtychange'
        ]);
        // Start polling if configured
        if (me.pollForChanges) {
            me.startPolling(me.pollInterval || 500);
        }
        if (me.store) {
            var store = Ext.getStore(me.store);
            var model = store.model;
            var idProperty = Ext.create('Ext.form.field.Text', {
                    name: model.idProperty,
                    hidden: true
                });
            me.items.items.push(idProperty);
            if (!Ext.isEmpty(me.relationGridPanelId)) {
                me.on('recordChange', function(record) {
                    var obj = me.getRelationObj(me.relationGridPanelId, me.relationGridQueryFieldArray);
                    me.loadGridPanel(obj, record);
                });
            }
            store.on('load', function(store, records, options) {
                if (!Ext.isEmpty(records) && records.length > 0) {
                    me.page = 0;
                    me.loadRecord(records[0]);
                } else //Ext.loadRecord(Ext.getStore(component.store).data.items[0]);
                {
                    if (me.insertFlag) {
                        me.addNewRecord();
                    }
                }
            });
        }
    },
    //store.add({});
    setStore: function(store) {
        this.store = store.id;
    },
    getRelationObj: function(relationGridPanelId, relationGridQueryFieldArray) {
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
    loadGridPanel: function(relatedObj, record, fn) {
        Ext.each(relatedObj.relationGridQueryFieldArray, function(fieldName, index, array) {
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
            callback: function() {}
        });
    },
    initItems: function() {
        // Create the BasicForm
        this.callParent();
        this.initMonitor();
        this.form = this.createForm();
    },
    // Initialize the BasicForm after all layouts have been completed.
    afterFirstLayout: function() {
        this.callParent(arguments);
        this.form.initialize();
    },
    /**
     * @private
     */
    createForm: function() {
        var cfg = {},
            props = this.basicFormConfigs,
            len = props.length,
            i = 0,
            prop;
        for (; i < len; ++i) {
            prop = props[i];
            cfg[prop] = this[prop];
        }
        return new Ext.form.Basic(this, cfg);
    },
    /**
     * Provides access to the {@link Ext.form.Basic Form} which this Panel contains.
     * @return {Ext.form.Basic} The {@link Ext.form.Basic Form} which this Panel contains.
     */
    getForm: function() {
        return this.form;
    },
    /**
     * Loads an {@link Ext.data.Model} into this form (internally just calls
     * {@link Ext.form.Basic#loadRecord}).
     * See also {@link Ext.form.Basic#trackResetOnLoad trackResetOnLoad}. The fields in the model
     * are mapped to  fields in the form by matching either the {@link Ext.form.field.Base#name}
     * or {@link Ext.Component#itemId}.
     * @param {Ext.data.Model} record The record to load
     * @return {Ext.form.Basic} The Ext.form.Basic attached to this FormPanel
     */
    loadRecord: function(record) {
        this.fireEvent('recordChange', record);
        return this.getForm().loadRecord(record);
    },
    /**
     * Returns the currently loaded Ext.data.Model instance if one was loaded via
     * {@link #loadRecord}.
     * @return {Ext.data.Model} The loaded instance
     */
    getRecord: function() {
        return this.getForm().getRecord();
    },
    /**
     * Persists the values in this form into the passed {@link Ext.data.Model} object
     * in a beginEdit/endEdit block. If the record is not specified, it will attempt to update
     * (if it exists) the record provided to {@link #loadRecord}.
     * @param {Ext.data.Model} [record] The record to edit
     * @return {Ext.form.Basic} The Ext.form.Basic attached to this FormPanel
     */
    updateRecord: function(record) {
        //if(Ext.isEmpty(this.getRecord())){
        //	return false;
        //}
        return this.getForm().updateRecord(record);
    },
    /**
     * @method getValues
     * Convenience function for fetching the current value of each field in the form.
     * This is the same as calling {@link Ext.form.Basic#getValues this.getForm().getValues()}.
     *
     * @inheritdoc Ext.form.Basic#getValues
     */
    getValues: function(asString, dirtyOnly, includeEmptyText, useDataValues) {
        return this.getForm().getValues(asString, dirtyOnly, includeEmptyText, useDataValues);
    },
    /**
     * @method isDirty
     * Convenience function to check if the form has any dirty fields. This is the same as calling
     * {@link Ext.form.Basic#isDirty this.getForm().isDirty()}.
     *
     * @inheritdoc Ext.form.Basic#isDirty
     */
    isDirty: function() {
        return this.form.isDirty();
    },
    /**
     * @method isValid
     * Convenience function to check if the form has all valid fields. This is the same as calling
     * {@link Ext.form.Basic#isValid this.getForm().isValid()}.
     *
     * @inheritdoc Ext.form.Basic#isValid
     */
    isValid: function() {
        return this.form.isValid();
    },
    /**
     * @method reset
     * Convenience function reset the form. This is the same as calling
     * {@link Ext.form.Basic#reset this.getForm().reset()}.
     *
     * @inheritdoc Ext.form.Basic#reset
     */
    reset: function(resetRecord) {
        return this.form.reset(resetRecord);
    },
    /**
     * @method hasInvalidField
     * Convenience function to check if the form has any invalid fields. This is the same as calling
     * {@link Ext.form.Basic#hasInvalidField this.getForm().hasInvalidField()}.
     *
     * @inheritdoc Ext.form.Basic#hasInvalidField
     */
    hasInvalidField: function() {
        return this.form.hasInvalidField();
    },
    doDestroy: function() {
        this.stopPolling();
        this.form.destroy();
        this.callParent();
    },
    /**
     * This is a proxy for the underlying BasicForm's {@link Ext.form.Basic#load} call.
     * @param {Object} options The options to pass to the action (see {@link Ext.form.Basic#load}
     * and {@link Ext.form.Basic#doAction} for details)
     */
    load: function(options) {
        this.form.load(options);
    },
    /**
     * This is a proxy for the underlying BasicForm's {@link Ext.form.Basic#submit} call.
     * @param {Object} options The options to pass to the action (see {@link Ext.form.Basic#submit}
     * and {@link Ext.form.Basic#doAction} for details)
     */
    submit: function(options) {
        this.form.submit(options);
    },
    /**
     * Start an interval task to continuously poll all the fields in the form for changes in their
     * values. This is normally started automatically by setting the {@link #pollForChanges} config.
     * @param {Number} interval The interval in milliseconds at which the check should run.
     */
    startPolling: function(interval) {
        this.stopPolling();
        this.pollTask = Ext.util.TaskManager.start({
            interval: interval,
            run: this.checkChange,
            scope: this
        });
    },
    /**
     * Stop a running interval task that was started by {@link #startPolling}.
     */
    stopPolling: function() {
        var task = this.pollTask;
        if (task) {
            Ext.util.TaskManager.stop(task, true);
            this.pollTask = null;
        }
    },
    /**
     * Forces each field within the form panel to
     * {@link Ext.form.field.Field#checkChange check if its value has changed}.
     */
    checkChange: function() {
        var fields = this.form.getFields().items,
            f,
            fLen = fields.length;
        for (f = 0; f < fLen; f++) {
            fields[f].checkChange();
        }
        if (this.isDirty()) {
            var record = this.getRecord();
            if (Ext.isEmpty(record)) {
                if (this.insertFlag) {
                    this.addNewRecord();
                } else {
                    return false;
                }
            }
            this.updateRecord(this.getRecord());
        } else {
            var record = this.getRecord();
            if (!Ext.isEmpty(record) && !Ext.isEmpty(record.crudState) && !Ext.isEmpty(record.modified)) {
                if (record.crudState === 'U') {
                    //this.revertModified(this.getRecord());
                    this.updateRecord(this.getRecord());
                } else if (record.crudState === 'C') {
                    this.updateRecord(this.getRecord());
                }
            }
        }
    },
    getStore: function() {
        return Ext.getStore(this.store);
    },
    revertModified: function(record) {
        var revertFieds = Object.keys(record.modified);
        Ext.each(revertFieds, function(revertFied) {
            record.set(revertFied, record.modified[revertFied]);
        });
    },
    setNullValue: function(record, store, items, forceFlag) {
        if (record.phantom || forceFlag) {
            if (store.data.length > 1) {
                Ext.each(items, function(item) {
                    item.setValue();
                });
            }
        }
    },
    removeRecord: function() {
        var store = Ext.getStore(this.store),
            page = this.page,
            record = store.getRange()[page],
            preRecord = store.getRange()[page - 1],
            nextRecord = store.getRange()[page + 1],
            items = this.items.items;
        store.remove(record);
        if (page === 0) {
            this.loadRecord(nextRecord);
            this.setNullValue(nextRecord, store, items);
            this.page = page + 1;
        } else {
            this.loadRecord(preRecord);
            this.setNullValue(preRecord, store, items);
            this.page = page - 1;
        }
    },
    addNewRecord: function() {
        var store = Ext.getStore(this.store),
            model = store.model,
            record = Ext.create(model, {}),
            items = this.items.items;
        if (this.page != undefined) {
            this.page += 1;
        } else {
            this.page = 0;
        }
        store.insert(this.page, record);
        this.setNullValue(record, store, items, true);
        this.loadRecord(record);
    }
});

Ext.define('Rs.ext.form.model.RsDownloadModel', {
    extend: 'Ext.data.Model',
    fields: [
        {
            name: 'attachmentId',
            type: 'string'
        },
        {
            name: 'attachmentIndex',
            type: 'string'
        },
        {
            name: 'fileName',
            type: 'string'
        },
        {
            name: 'type'
        },
        {
            name: 'size'
        },
        {
            name: 'state'
        }
    ]
});

Ext.define('Rs.ext.form.store.RsDownloadStore', function() {
    return {
        extend: 'Ext.data.Store',
        model: 'Rs.ext.form.model.RsDownloadModel',
        proxy: {
            type: 'ajax',
            //  url: 'http://192.168.2.208:9091/sys/testFileUtils/sys-attachment/crud',
            url: '/sys/testFileUtils/sys-attachment/crud',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    };
});

Ext.define('Rs.ext.form.model.RsUploadModel', {
    extend: 'Ext.data.Model',
    fields: [
        {
            name: 'attachmentId',
            type: 'string'
        },
        {
            name: 'attachmentIndex',
            type: 'string'
        },
        {
            name: 'fileName',
            type: 'string'
        },
        {
            name: 'type'
        },
        {
            name: 'size'
        },
        {
            name: 'state'
        }
    ]
});

Ext.define('Rs.ext.form.store.RsUploadStore', function() {
    return {
        extend: 'Ext.data.Store',
        model: 'Rs.ext.form.model.RsUploadModel'
    };
});

Ext.define('Rs.ext.form.UpDownloadPanel', {
    extend: 'Ext.window.Window',
    alias: 'widget.rs-upload-download-panel',
    requires: [
        'Ext.form.Panel',
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
        uploadSuccess: function(fp, o) {},
        uploadFailure: function(fp, o) {}
    },
    initComponent: function() {
        var me = this,
            win = window.top;
        me.callParent();
        me.initFormPanel();
        me.initGridPanel();
        me.initUploadGridPanel();
        me.add([
            me.DownloadGridPanel,
            me.UploadGridPanel,
            me.formPanel
        ]);
        me.on('beforeshow', function() {
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
            win.onclick = function() {};
        });
        me.DownloadGridPanel.on('columnresize', function(headerContainer, resizeColumn, width) {
            console.log(arguments, "columnresize arguments");
            var columnIndex = resizeColumn.fullColumnIndex,
                upload = me.UploadGridPanel,
                column = upload.getColumns();
            column[columnIndex].setWidth(width);
            console.log(column);
            console.log(me.UploadGridPanel, "<=========");
        });
        me.on('focusleave', function() {
            win.onclick = function(e) {
                if (e.clientX - me.getX() < 0 || e.clientY - me.getY() < 0 || e.clientX - (me.getX() + me.getWidth()) > 0 || e.clientY - (me.getY() + me.getHeight()) > 0) {
                    console.log("true");
                    me.hide();
                }
            };
        });
    },
    initFormPanel: function() {
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
                items: [
                    {
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
                        fn: function(e, file) {
                            this.setStyle({
                                background: 'linear-gradient( #F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)'
                            });
                        }
                    },
                    mouseout: {
                        element: 'el',
                        fn: function() {
                            this.setStyle({
                                background: 'inherit'
                            });
                        }
                    },
                    mousedown: {
                        element: 'el',
                        fn: function() {
                            this.setStyle({
                                background: 'linear-gradient( #BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)'
                            });
                        }
                    },
                    click: {
                        element: 'el',
                        fn: function(e, file) {
                            if (me.isMultiple) {
                                file.setAttribute("multiple", "multiple");
                            }
                        }
                    },
                    change: {
                        element: 'el',
                        fn: function(e, file) {
                            console.log(file.files, "<==========");
                            var fileList = file.files,
                                upload = me.UploadGridPanel,
                                store = upload.getStore();
                            store.removeAll();
                            me.uploadFileList = fileList;
                            for (i in fileList) {
                                if (Ext.isNumeric(i)) {
                                    var type,
                                        uploadValue = {};
                                    uploadValue.fileName = fileList[i].name;
                                    type = fileList[i].name.split(".");
                                    console.log(fileList[i].type);
                                    uploadValue.type = "." + type[1].trim();
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
                handler: function() {
                    var form = this.up("form").getForm(),
                        uploadStore = me.UploadGridPanel.getStore(),
                        downloadStore = me.DownloadGridPanel.getStore();
                    //下载面板删除逻辑
                    if (!Ext.isEmpty(me.downloadRecordRemovedArray)) {
                        Ext.each(me.downloadRecordRemovedArray, function(record) {
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
                            success: function(fp, o) {
                                Rs.Msg.messageAlert({
                                    title: '提示',
                                    message: '上传成功'
                                });
                                downloadStore.on('beforeload', function() {
                                    console.log(arguments, "beforeload");
                                    if (!Ext.isEmpty(me.uploadRecordRemovedArray)) {
                                        Ext.each(me.uploadRecordRemovedArray, function(record) {
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
                                                success: function() {
                                                    me.uploadRecordRemovedArray.length = 0;
                                                },
                                                failure: function() {
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
                            failure: function(fp, o) {
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
                        fn: function() {
                            this.setStyle({
                                background: 'linear-gradient( #F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)'
                            });
                        }
                    },
                    mouseout: {
                        element: 'el',
                        fn: function() {
                            this.setStyle({
                                background: 'inherit'
                            });
                        }
                    },
                    mousedown: {
                        element: 'el',
                        fn: function() {
                            this.setStyle({
                                background: 'linear-gradient( #BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)'
                            });
                        }
                    }
                }
            }));
        me.uploadButton = uploadButton , me.saveButton = saveButton;
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
    initGridPanel: function() {
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
                columns: [
                    {
                        xtype: 'gridcolumn',
                        text: '附件编码',
                        //width: 10,
                        hidden: true,
                        dataIndex: 'attachmentId',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '附件索引',
                        //width: 10,
                        hidden: true,
                        dataIndex: 'attachmentIndex',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '文件名',
                        width: me.gridFileNameWidth,
                        sortable: true,
                        dataIndex: 'fileName',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '类型',
                        //width: 50,
                        flex: 1,
                        sortable: true,
                        dataIndex: 'type',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '大小',
                        //width: 80,
                        flex: 1,
                        sortable: true,
                        dataIndex: 'size',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '状态',
                        //width: 70,
                        flex: 1,
                        sortable: true,
                        dataIndex: 'state',
                        menuDisabled: true,
                        scope: this,
                        renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                            return '<a style="color:#3abbfe">已经上传</a>';
                        }
                    },
                    {
                        xtype: 'actioncolumn',
                        text: '下载',
                        width: 60,
                        align: 'center',
                        items: [
                            {
                                iconCls: 'downloadAction-button-item',
                                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
                                    //要求后台查出来的数据按attachmentIndex排序
                                    me.downloadParams = {
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
                    },
                    {
                        xtype: 'actioncolumn',
                        text: '操作',
                        align: 'center',
                        width: 60,
                        items: [
                            {
                                iconCls: 'deleteAction1-button-item',
                                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
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
    initUploadGridPanel: function() {
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
                columns: [
                    {
                        xtype: 'gridcolumn',
                        text: '附件编码',
                        //width: 10,
                        hidden: true,
                        dataIndex: 'attachmentId',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '附件索引',
                        //width: 10,
                        hidden: true,
                        dataIndex: 'attachmentIndex',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '文件名',
                        width: me.gridFileNameWidth,
                        sortable: true,
                        dataIndex: 'fileName',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '类型',
                        //width: 50,
                        flex: 1,
                        sortable: true,
                        dataIndex: 'type',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '大小',
                        //width: 80,
                        flex: 1,
                        sortable: true,
                        dataIndex: 'size',
                        menuDisabled: true
                    },
                    {
                        xtype: 'gridcolumn',
                        text: '状态',
                        //width: 70,
                        flex: 1,
                        sortable: true,
                        dataIndex: 'state',
                        menuDisabled: true,
                        scope: this
                    },
                    {
                        xtype: 'actioncolumn',
                        text: '下载',
                        width: 60,
                        align: 'center',
                        items: [
                            {
                                iconCls: 'downloadAction1-button-item',
                                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
                                    Rs.Msg.messageAlert({
                                        title: '提示',
                                        message: '文件尚未提交'
                                    });
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'actioncolumn',
                        text: '操作',
                        align: 'center',
                        width: 60,
                        items: [
                            {
                                iconCls: 'deleteAction1-button-item',
                                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
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
    uploadSuccess: function(fp, o) {
        console.log("uploadSuccess");
    },
    uploadFailure: function(fp, o) {
        console.log("uploadFailure");
    }
});

/**
 * @class Rs.ext.form.field.DateInputField
 * @extends Ext.form.field.Text
 * @author LiGuangqiao
 * 日期控件
 * 正则表达式
 * 年：
 * ([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})
 * 闰年
 * ([0-9]{2})(0[48]|[2468][048]|[13579][26])
 * (0[48]|[2468][048]|[3579][26])00
 * 月日：
 * (0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])
 * (0[469]|11)-(0[1-9]|[12][0-9]|30)
 * 02-(0[1-9]|[1][0-9]|2[0-8])
 * 闰年：
 * 02-29
 */
Ext.define('Rs.ext.form.field.DateInputField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.dateinputfield',
    configs: {
        /**
         *@cfg {String} format
		 *defaultValue 'Y/m/d'
         *日期格式
         */
        format: ""
    },
    regex: undefined,
    format: 'Y/m/d',
    maxLength: 10,
    initComponent: function() {
        var me = this,
            formatRegex0 = new RegExp("Y(.|\n)*m(.|\n)*d"),
            formatRegex1 = new RegExp("d(.|\n)*m(.|\n)*Y"),
            formatRegex2 = new RegExp("m(.|\n)*d(.|\n)*Y"),
            tempRegex, tempRegex1;
        me.callParent();
        me.on('afterrender', function(thisField) {
            tempRegex1 = "^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})" + "(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))" + "|((0[469]|11)(0[1-9]|[12][0-9]|30))" + "|(02(0[1-9]|[1][0-9]|2[0-8]))))$" + "|^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)$";
            if (formatRegex0.test(thisField.format)) {
                tempRegex = new RegExp("(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(.|\n)" + "(((0[13578]|1[02])(.|\n)(0[1-9]|[12][0-9]|3[01]))" + "|((0[469]|11)(.|\n)(0[1-9]|[12][0-9]|30))|(02(.|\n)(0[1-9]|[1][0-9]|2[0-8]))))" + "|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))(.|\n)02(.|\n)29)" + "|(" + tempRegex1 + ")");
            }
            if (formatRegex1.test(thisField.format)) {
                tempRegex = new RegExp("((((0[1-9]|[12][0-9]|3[01])(.|\n)(0[13578]|1[02]))" + "|((0[1-9]|[12][0-9]|30)(.|\n)(0[469]|11))" + "|((0[1-9]|[1][0-9]|2[0-8])(.|\n)02))(.|\n)([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))" + "|((29(.|\n)02)(.|\n)(((0[48]|[2468][048]|[3579][26])00)|(([0-9]{2})(0[48]|[2468][048]|[13579][26]))))" + "|(" + tempRegex1 + ")");
            }
            if (formatRegex2.test(thisField.format)) {
                tempRegex = new RegExp("(((0[13578]|1[02])(.|\n)(0[1-9]|[12][0-9]|3[01])" + "|(0[469]|11)(.|\n)(0[1-9]|[12][0-9]|30)" + "|02(.|\n)(0[1-9]|[1][0-9]|2[0-8]))(.|\n)([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))" + "|((02(.|\n)29)(.|\n)(((0[48]|[2468][048]|[3579][26])00)$|(([0-9]{2})(0[48]|[2468][048]|[13579][26]))))" + "|(" + tempRegex1 + ")");
            }
            me.regex = new RegExp(tempRegex);
        });
        me.on('blur', function(thisField) {
            var year, month, day, tempValue, newValue,
                oldValue = thisField.getValue();
            if (Ext.isNumeric(oldValue)) {
                if (oldValue.length < 8 || oldValue.length > 8) {
                    flag = flag && false;
                } else {
                    year = oldValue.slice(0, 4);
                    month = oldValue.slice(4, 6);
                    day = oldValue.slice(6, 8);
                    /*
                    if (formatRegex0.test(thisField.format)){
                    year = oldValue.slice(0, 4);
                    month = oldValue.slice(4, 6);
                    day = oldValue.slice(6, 8);
                    }
                    if (formatRegex1.test(thisField.format)){
                    year = oldValue.slice(4, 8);
                    month = oldValue.slice(2, 4);
                    day = oldValue.slice(0, 2);
                    }
                    if (formatRegex2.test(thisField.format)){
                    year = oldValue.slice(4, 8);
                    month = oldValue.slice(0, 2);
                    day = oldValue.slice(2, 4);
                    }*/
                    var flag = thisField.isLegalDate(year, month, day);
                    if (flag) {
                        tempValue = month + "/" + day + "/" + year;
                        newValue = Ext.Date.format(new Date(tempValue), thisField.format);
                        thisField.setValue(newValue);
                    }
                }
            } else {
                //console.log(Ext.Date.parse(oldValue, 'Y/m/d'), "<----");
                if (Ext.Date.parse(oldValue, 'Y/m/d')) {
                    thisField.setValue(Ext.Date.format(new Date(oldValue), thisField.format));
                }
            }
        });
    },
    /**
     * 判断日期是否合法的函数
     * public
     * @method isLegalDate
     * @params {String} year 年
     * @params {String} month 月
     * @params {String} day 日
     */
    isLegalDate: function(year, month, day) {
        var flag = true;
        if (month - "12" > 0 || month - "01" < 0) {
            flag = flag && false;
            Rs.Msg.messageAlert({
                "message": "非法日期"
            });
        }
        if (month === "01" || month === "03" || month === "05" || month === "07" || month === "08" || month === "10" || month === "12") {
            if (day - "31" > 0 || day - "01" < 0) {
                flag = flag && false;
                Rs.Msg.messageAlert({
                    "message": "非法日期"
                });
            }
        }
        if (month === "04" || month === "06" || month === "09" || month === "11") {
            if (day - "30" > 0 || day - "01" < 0) {
                flag = flag && false;
                Rs.Msg.messageAlert({
                    "message": "非法日期"
                });
            }
        }
        if ((year % 4 === 0 && year % 100 === 0) || year % 400 === 0) {
            if (month === "02") {
                if (day - "29" > 0 || day - "01" < 0) {
                    flag = flag && false;
                    Rs.Msg.messageAlert({
                        "message": "非法日期"
                    });
                }
            }
        } else {
            if (month === "02") {
                if (day - "28" > 0 || day - "01" < 0) {
                    flag = flag && false;
                    Rs.Msg.messageAlert({
                        "message": "非法日期"
                    });
                }
            }
        }
        return flag;
    }
});

Ext.define('Rs.ext.form.field.DecimalAwareNumberfield', {
    extend: 'Ext.form.field.Number',
    xtype: 'decimalawarenumberfield',
    config: {
        /**
		 *@cfg panelId
		 *所属面板ID.
		 */
        panelId: '',
        /**
		 *@cfg compId
		 *定位小数位数组件的标识.
		 */
        compId: ''
    },
    afterRender: function() {
        var me = this,
            panelId = me.panelId;
        me.callParent(arguments);
        if (!Rs || !Rs.DECIMALS) {
            console.error('确保 Rs.DECIMALS 不为空!');
            return;
        }
        if (Ext.isEmpty(Rs.DECIMALS[panelId])) {
            console.error('panelId属性为空, 导致获取不到该组件所对应的小数位数!');
            return;
        }
        var compId = me.compId,
            //保证IDE能够编辑
            decimals = Rs.DECIMALS[panelId];
        //decimals = Ext.Component.getDecimals(panelId);
        if (Ext.isEmpty(compId) || (decimals[compId] == undefined)) {
            console.error('itemId属性为空, 导致获取不到该组件所对应的小数位数!');
            return;
        }
        me.decimalPrecision = decimals[compId];
    }
});

Ext.define('Rs.ext.form.field.RsCheckBox', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.rscheckbox',
    setValue: function(checked) {
        var me = this,
            boxes, i, len, box;
        checked = checked == 'Y' ? true : false;
        // If an array of strings is passed, find all checkboxes in the group with the same name
        // as this one and check all those whose inputValue is in the array, un-checking all the 
        // others. This is to facilitate setting values from Ext.form.Basic#setValues, 
        // but is not publicly documented as we don't want users depending on this 
        // behavior.
        if (Ext.isArray(checked)) {
            boxes = me.getManager().getByName(me.name, me.getFormId()).items;
            len = boxes.length;
            for (i = 0; i < len; ++i) {
                box = boxes[i];
                box.setValue(Ext.Array.contains(checked, box.inputValue));
            }
        } else {
            // The callParent() call ends up trigger setRawValue, we only want to modify
            // the lastValue when setRawValue being called independently.
            me.duringSetValue = true;
            me.callParent(arguments);
            delete me.duringSetValue;
        }
        return me ? 'Y' : 'N';
    }
});

/**
 * @class Rs.ext.form.field.TimeInputField
 * @extends Ext.form.field.Text
 * @author LiGuangqiao
 * 时间控件
 */
Ext.define('Rs.ext.form.field.TimeInputField', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.timeinputfield',
    configs: {
        /**
         *@cfg {String} format
         *defaultValue 'H:i'
         *时间格式
         */
        format: "",
        /**
         *@cfg {Boolean} strictFormat
         *使用标准时间格式例如：true 8点=08:00,false 8点=8:00
         */
        strictFormat: undefined
    },
    strictFormat: true,
    regex: undefined,
    format: 'H:i',
    initComponent: function() {
        var me = this,
            formatRegex = new RegExp("H(.|\n)i"),
            tempRegex, tempRegex0;
        tempRegex0 = me.format[1];
        me.callParent();
        me.on('afterrender', function(thisField) {
            if (formatRegex.test(thisField.format)) {
                tempRegex = "(^[0-9]$)" + "|^(([0-1][0-9])|(2[0-3]))$" + "|^(([0-1][0-9]|2[0-3])([0-5][0-9]))$" + "|^(([0-1][0-9]|2[0-3])([^\\w]|(" + tempRegex0 + ")|[_])([0-5][0-9]))$" + "|^(([0-9])([^\\w]|(" + tempRegex0 + ")|[_])([0-5][0-9]))$";
            }
            me.regex = new RegExp(tempRegex);
        });
        me.on('blur', function(thisField) {
            var hour, minute, tempValue, newValue;
            tempValue;
            oldValue = thisField.getValue();
            if (Ext.isNumeric(oldValue)) {
                if (oldValue.length === 1) {
                    hour = "0" + oldValue;
                    minute = "00";
                    tempValue = hour + ":" + minute;
                }
                if (oldValue.length === 2) {
                    hour = oldValue;
                    minute = "00";
                    tempValue = hour + ":" + minute;
                }
                /*
                if (oldValue.length === 3) {
                if (oldValue.slice(1, 2) - "6" >= 0) {
                hour = oldValue.slice(0, 2);
                minute = oldValue.slice(2, 3) + "0";
                } else {
                hour = "0" + oldValue.slice(0, 1);
                minute = oldValue.slice(1, 3);
                }
                tempValue = hour + ":" + minute;
                }*/
                if (oldValue.length === 4) {
                    hour = oldValue.slice(0, 2);
                    minute = oldValue.slice(2, 4);
                    tempValue = hour + ":" + minute;
                }
                tempValue = "1995/10/09 " + tempValue;
                //console.log(tempValue);
                newValue = Ext.Date.format(new Date(tempValue), thisField.format);
                //console.log(newValue);
                if (newValue.slice(0, 1) === "0") {
                    if (!me.strictFormat) {
                        newValue = newValue.slice(1, 5);
                    }
                }
                thisField.setValue(newValue);
            } else {
                tempValue = "1995/10/09 " + oldValue;
                if (Ext.Date.parse(tempValue, 'Y/m/d H:i')) {
                    newValue = Ext.Date.format(new Date(tempValue), thisField.format);
                    //console.log("ssss", tempValue, Ext.Date.parse(tempValue, 'Y/m/d H:i'));
                    if (newValue.slice(0, 1) === "0") {
                        if (!me.strictFormat) {
                            newValue = newValue.slice(1, 5);
                        }
                        thisField.setValue(newValue);
                    }
                }
            }
        });
    }
});

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
    isRelationPanel: true,
    addible: true,
    deletable: true,
    isAddWhileNoRecords: true,
    moreRelationGridObj: {},
    relationGridStoreSet: {},
    //上帧行点击事件是否触发所关联面板的数据加载
    clickAutoLoadRelationGridPanel: true,
    relationGridPanelAutoLoad: true,
    initComponent: function() {
        var me = this;
        me.callParent();
        me.on('afterrender', function(gridPanel) {
            // console.log("gridPanel", gridPanel);
            var myGridStore = gridPanel.getStore(),
                columnsArray = gridPanel.getColumns(),
                pluginsArray = gridPanel.getPlugins(),
                actionColumn, cellPlugin, deleteHead;
            Ext.each(pluginsArray, function(plugins, index, myself) {
                if (plugins.ptype === "cellediting") {
                    cellPlugin = plugins;
                    gridPanel.cellPlugin = cellPlugin;
                }
                if ("deleteHead" === plugins.ptype) {
                    deleteHead = plugins;
                }
            });
            Ext.each(columnsArray, function(column, index, myself) {
                if (column.xtype === "rsactioncolumn") {
                    actionColumn = column;
                }
                if (column.xtype === "rs-action-column-restricted") {
                    actionColumn = column;
                    gridPanel.actionColumn = actionColumn;
                }
            });
            if (!Ext.isEmpty(cellPlugin)) {
                cellPlugin.onAfter('edit', function(myself, cellData) {
                    if (!Ext.isEmpty(cellData.record.deleteFlag) && cellData.record.deleteFlag === 'D') {
                        Ext.get(cellData.row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
                    }
                });
            }
            myGridStore.on('load', function(thisStore, records, successful) {
                //默认新增行
                gridPanel.synchroAddDefaultValue(gridPanel, actionColumn, thisStore, thisStore, successful, gridPanel.isAddWhileNoRecords);
            });
            myGridStore.getCachedStore().on('load', function(thisCachedStore, records, successful) {
                //默认新增行
                gridPanel.synchroAddDefaultValue(gridPanel, actionColumn, thisCachedStore.getDynamicStore(), thisCachedStore, true, gridPanel.isAddWhileNoRecords);
            });
            //删除按钮变色逻辑
            gridPanel.getView().on('refresh', function(view, temp) {
                //console.log("ceshi",gridPanel.id);
                var thisStore = view.grid.getStore();
                if (!Ext.isEmpty(thisStore.getRange())) {
                    var removeIndexArr = [];
                    Ext.each(thisStore.getRange(), function(record, index, myself) {
                        if (!Ext.isEmpty(record.deleteFlag)) {
                            if (record.deleteFlag === 'D') {
                                removeIndexArr.push(index);
                            }
                        }
                    });
                    if (removeIndexArr.length !== 0) {
                        //console.log(gridPanel.id, "--->", gridPanel.getEl().dom.getElementsByClassName('x-action-col-icon x-action-col-2').length);
                        Ext.each(removeIndexArr, function(removeIndex, index, myself) {
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
                    Ext.Object.eachValue(gridPanel.moreRelationGridObj, function(obj) {
                        var tempObj = gridPanel.getRelationObj(obj.relationGridPanelId, obj.relationGridQueryFieldArray);
                        gridPanel.relationGridPanelHandler(gridPanel, tempObj, myGridStore);
                    });
                }
            }
        });
    },
    queryConditionHasNull: function(obj) {
        var flag = false;
        Ext.Object.each(obj, function(key, value, myself) {
            if (value === "null") {
                myself[key] = "";
                flag = true;
            }
        });
        return flag;
    },
    isArrayItemObj: function(array) {
        if (array.length !== 0) {
            if (Ext.isObject(array[0])) {
                return true;
            }
        } else {
            return false;
        }
    },
    isArrayHaveField: function(array, field) {
        var flag = false;
        if (array.length !== 0) {
            if (Ext.isObject(array[0])) {
                Ext.each(array, function(fieldName, index, arrayItself) {
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
    getRelationObj: function(relationGridPanelId, relationGridQueryFieldArray) {
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
    relationGridPanelHandler: function(gridPanel, relatedObj, myGridStore) {
        //默认下帧展示按第一行记录条件查询结果的第一页
        myGridStore.on('load', function(thisStore, recordArray, successful, operation) {
            var record = thisStore.getRange();
            if (gridPanel.relationGridPanelAutoLoad && !Ext.isEmpty(record)) {
                gridPanel.autoLoadRelationPanel(gridPanel, relatedObj, record[0]);
            }
            if (Ext.isEmpty(record)) {
                relationGridPanel.getStore().removeAll();
            }
        });
        myGridStore.cachedStore.on('load', function(thisStore, recordArray, successful, operation) {
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
        myGridStore.on('update', function(thisStore, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                gridPanel.syncDataWhenUpdate(gridPanel, relatedObj, record, operation, modifiedFieldNames);
            }
        });
        myGridStore.cachedStore.on('update', function(thisStore, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                gridPanel.syncDataWhenUpdate(gridPanel, relatedObj, record, operation, modifiedFieldNames);
            }
        });
        //上帧点击数据行，下帧根据该数据行的条件查询并展示，默认查询结果的第一页
        gridPanel.on("rowclick", function(view, record, row, rowIndex, e, eOpts, fn, flag) {
            if (!Ext.isEmpty(e)) {
                if (Ext.get(e.getTarget()).hasCls('addAction-button-item') || Ext.get(e.getTarget()).hasCls('deleteAction1-button-item') || Ext.get(e.getTarget()).hasCls('deleteAction2-button-item')) {
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
    syncDataWhenUpdate: function(gridPanel, relatedObj, record, operation, modifiedFieldNames) {
        var field = modifiedFieldNames[0],
            relationModifiedFieldNames = [],
            recordArray, relationRecord;
        if (gridPanel.isArrayHaveField(relatedObj.relationGridQueryFieldArray, field) && !Ext.isEmpty(field)) {
            if (!Ext.isEmpty(relatedObj.cachedStore.getRelationStaticDataArry())) {
                Ext.each(relatedObj.cachedStore.getRelationStaticDataArry(), function(recordObj) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === relatedObj.cachedStore.currentPage && recordObj["queryRecord"] === record) {
                        recordArray = tempRecord.data;
                    }
                });
                var tempField;
                if (gridPanel.isArrayItemObj(relatedObj.relationGridQueryFieldArray)) {
                    Ext.each(relatedObj.relationGridQueryFieldArray, function(fieldName, index, array) {
                        if (field === fieldName["upField"]) {
                            tempField = fieldName["downField"];
                        }
                    });
                } else {
                    tempField = field;
                }
                Ext.each(recordArray, function(eachRecord) {
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
    synchroAddDefaultValue: function(gridPanel, actionColumn, dynamicStore, currentStore, successful, isAddWhileNoRecords) {
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
                    tempObj, tempObj1;
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
    autoLoadRelationPanel: function(gridPanel, relatedObj, record, fn, flag) {
        Ext.each(relatedObj.relationGridQueryFieldArray, function(fieldName, index, array) {
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
            callback: function() {
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
        addHandler: function(grid, rowIndex, colIndex, item, e, record, row, defaultValue) {},
        /**
         *@cfg {function} extraAddHandler
         *额外新增逻辑
         */
        extraAddHandler: function(thisColumn, grid, rowIndex, colIndex, item, e, record, row) {},
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
        deleteHandler: function(grid, rowIndex, colIndex, item, e, record, row, pluginsObj) {},
        /**
         *@cfg {function} extraRemoveHandler
         *额外删除逻辑
         */
        extraRemoveHandler: function(thisColumn, grid, rowIndex, colIndex, item, e, record, row) {}
    },
    text: '操作',
    addFlag: "add",
    removeFlag: "remove",
    pluginsObj: {},
    gridPluginsArray: undefined,
    addDefaultValue: {},
    queryAddValue: {},
    items: [
        {},
        {},
        {}
    ],
    initMenu: function() {
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
        Ext.each(me.items, function(selfItem, index) {
            if (index >= 4) {
                if (!Ext.isEmpty(selfItem)) {
                    selfItem.index = index;
                    me.Menu.add(selfItem);
                    if (Ext.isEmpty(selfItem.fn)) {
                        selfItem.fn = selfItem.handler;
                    }
                }
                me.Menu.on('hide', function() {
                    selfItem.hidden = true;
                });
            }
        });
    },
    initComponent: function() {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.on('afterrender', function() {
            var grid = me.up("grid"),
                addButton = {},
                removeButton = {};
            if (Ext.isEmpty(me.gridPluginsArray)) {
                me.gridPluginsArray = grid.getPlugins();
                var obj = {};
                Ext.each(me.gridPluginsArray, function(pluginObj) {
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
            Ext.each(me.items, function(item, index) {
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
                handler: function(view, rowIndex, colIndex, item, e, record, row) {
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
                            callback: function() {
                                var increasable = true;
                                if (!Ext.isEmpty(me.pluginsObj.editPlugin)) {
                                    Ext.Object.each(me.pluginsObj, function(key, itemObj, objItSelf) {
                                        if (key === "relateStateControlF") {
                                            increasable = increasable && (itemObj.relateStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                        }
                                    });
                                }
                                /*
                                        if (key === "stateControlF") {
                                        increasable = increasable && (itemObj.gridStateControl(objItSelf.editPlugin, record, itemObj.itemIds));
                                        }
                                         */
                                return increasable;
                            },
                            add: function(increasable) {
                                if (increasable) {
                                    me.addHandler(view.grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue, me.queryAddValue, me);
                                }
                            }
                        }, me.addFlag);
                    } else {
                        //无关联面板的分支或者有关联面但下帧不通过点击事件去加载数据的分支
                        var increasable = true;
                        if (!Ext.isEmpty(me.pluginsObj.editPlugin)) {
                            Ext.Object.each(me.pluginsObj, function(key, itemObj, objItSelf) {
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
                handler: function(view, rowIndex, colIndex, item, e, record, row) {
                    me.extraRemoveHandler(me, view.grid, rowIndex, colIndex, item, e, record, row);
                    var store = view.grid.getStore();
                    if (!Ext.isEmpty(store.isFrontCachedStore)) {
                        if (store.isCacheDataToFront) {
                            store.loadPage(store.currentPage, {
                                isLoadRelationGridPanel: false,
                                callback: function() {
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
                    handler: function(view, rowIndex, colIndex, item, e, record, row) {
                        var itemDom = row.getElementsByClassName("moreAction-button-item")[0];
                        me.Menu.alignTo(itemDom);
                        //避免bind时嵌套死循环
                        Ext.each(me.items, function(selfItem, index) {
                            if (index >= 4) {
                                if (!Ext.isEmpty(selfItem.fn)) {
                                    var handlerFn = Ext.Function.bind(selfItem.fn, this, [
                                            view,
                                            rowIndex,
                                            colIndex,
                                            item,
                                            e,
                                            record,
                                            row
                                        ], false),
                                        menuItems = me.Menu.items.items;
                                    Ext.each(menuItems, function(menu, index) {
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
        });
    },
    /**
     * 缓存面板刷新页面函数
     * public
     * @method refresh
     * @params {Ext.data.Store} store
     */
    refresh: function(store) {
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
    extraAddHandler: function(thisColumn, grid, rowIndex, colIndex, item, e, record, row) {},
    //thisColumn.addDefaultValue = {menuCode: Math.random()};
    //console.log("item",thisColumn);
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
    addHandler: function(grid, rowIndex, colIndex, item, e, record, row, defaultValue, queryAddValue, thisColumn) {
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
    notCachedDeleteHandler: function(grid, rowIndex, colIndex, item, e, record, row, pluginsObj, thisColumn) {
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
                    Ext.Object.each(pluginsObj, function(key, itemObj, objItSelf) {
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
    iconChange: function(row, changeFlag) {
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
    extraRemoveHandler: function(thisColumn, grid, rowIndex, colIndex, item, e, record, row) {},
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
    deleteHandler: function(grid, rowIndex, colIndex, item, e, record, row, pluginsObj, removeFlag, thisColumn) {
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
                        callback: function(thisRecordArray, operation, success) {
                            var deletable = true;
                            if (!Ext.isEmpty(pluginsObj.editPlugin)) {
                                Ext.Object.each(pluginsObj, function(key, itemObj, objItSelf) {
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
                        remove: function(deletable) {
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
                        Ext.Object.each(pluginsObj, function(key, itemObj, objItSelf) {
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
        addHandler: function(grid, rowIndex, colIndex, item, e, record, row, defaultValue) {},
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
        deleteHandler: function(grid, rowIndex, colIndex, item, e, record, row) {}
    },
    text: '操作',
    addDefaultValue: {},
    items: [
        {},
        {},
        {}
    ],
    initMenu: function() {
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
        Ext.each(me.items, function(selfItem, index) {
            if (index >= 4) {
                if (!Ext.isEmpty(selfItem)) {
                    selfItem.index = index;
                    me.Menu.add(selfItem);
                    if (Ext.isEmpty(selfItem.fn)) {
                        selfItem.fn = selfItem.handler;
                    }
                }
                me.Menu.on('hide', function() {
                    selfItem.hidden = true;
                });
            }
        });
    },
    initComponent: function() {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.on('afterrender', function() {
            me.initMenu();
            Ext.each(me.items, function(item, index) {
                if (index >= 4) {
                    item.hidden = true;
                }
            });
            me.items[0] = {
                disabled: true
            };
            //hidden: true
            me.items[1] = {
                altText: me.addAltText,
                iconCls: 'addAction-button-item',
                icon: me.addIcon,
                disabled: me.addDisabled,
                hidden: me.addHidden,
                tooltip: me.addToolTip,
                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
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
                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
                    me.deleteHandler(grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue);
                }
            };
            if (me.items.length >= 5) {
                me.items[3] = {
                    iconCls: 'moreAction-button-item',
                    handler: function(grid, rowIndex, colIndex, item, e, record, row) {
                        var itemDom = row.getElementsByClassName("moreAction-button-item")[0];
                        me.Menu.alignTo(itemDom);
                        //console.log("itemDom:",itemDom);
                        //避免bind时嵌套死循环
                        Ext.each(me.items, function(selfItem, index) {
                            if (index >= 4) {
                                if (!Ext.isEmpty(selfItem.fn)) {
                                    var handlerFn = Ext.Function.bind(selfItem.fn, this, [
                                            grid,
                                            rowIndex,
                                            colIndex,
                                            item,
                                            e,
                                            record,
                                            row
                                        ], false),
                                        menuItems = me.Menu.items.items;
                                    Ext.each(menuItems, function(menu, index) {
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
        });
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
    addHandler: function(grid, rowIndex, colIndex, item, e, record, row, defaultValue) {
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
    deleteHandler: function(grid, rowIndex, colIndex, item, e, record, row) {
        if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
            record.deleteFlag = '';
            //row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src = '../../../resources/images/del_nor.png'
            Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
        } else {
            if (!Ext.isEmpty(record.crudState) && record.crudState == 'C' && record.phantom) {
                if (grid.store.data.length > 1) {
                    grid.store.remove(record);
                }
            } else {
                record.deleteFlag = 'D';
                //row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src = '../../../resources/images/del_press.png'
                Ext.get(row.getElementsByClassName('x-action-col-icon x-action-col-2')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
            }
        }
    }
});

/**
 * @class Rs.ext.grid.column.RsCheck
 * @extends Ext.grid.column.Check
 * @author ZanShuangpeng
 * 复选框列
 */
Ext.define('Rs.ext.grid.column.RsCheckColumn', {
    extend: 'Ext.grid.column.Check',
    alias: 'widget.rscheckcolumn',
    processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
        var me = this,
            key = type === 'keydown' && e.getKey(),
            isClick = type === me.triggerEvent,
            disabled = me.disabled,
            ret, checked;
        // Flag event to tell SelectionModel not to process it.
        e.stopSelection = !key && me.stopSelection;
        if (!disabled && (isClick || (key === e.ENTER || key === e.SPACE))) {
            if (me.isRecordChecked(record) == true || me.isRecordChecked(record) == 'Y') {
                checked = false;
            } else {
                checked = true;
            }
            //checked = !me.isRecordChecked(record);
            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked, record, e) !== false) {
                var checkValue = '';
                if (checked == true || checked === 'Y') {
                    checkValue = 'Y';
                } else {
                    checkValue = 'N';
                }
                me.setRecordCheck(record, recordIndex, checkValue, cell, e);
                // Do not allow focus to follow from this mousedown unless the grid
                // is already in actionable mode
                if (isClick && !view.actionableMode) {
                    e.preventDefault();
                }
                if (me.hasListeners.checkchange) {
                    me.fireEvent('checkchange', me, recordIndex, checked, record, e);
                }
            }
        } else {
            ret = me.callParent(arguments);
        }
        return ret;
    },
    defaultRenderer: function(value, cellValues) {
        var me = this,
            cls = me.checkboxCls,
            tip = '';
        if (me.invert) {
            value = !value;
        }
        if (me.disabled) {
            cellValues.tdCls += ' ' + me.disabledCls;
        }
        if (value == true || value == 'Y') {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip;
        } else {
            tip = me.tooltip;
        }
        if (tip) {
            cellValues.tdAttr += ' data-qtip="' + Ext.htmlEncode(tip) + '"';
        }
        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' + (!value ? '-not' : '') + '-selected"';
        }
        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();
        return '<span class="' + cls + '" role="' + me.checkboxAriaRole + '"' + (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') + '></span>';
    },
    setRecordCheck: function(record, recordIndex, checked, cell) {
        var me = this,
            prop = me.property;
        // Only proceed if we NEED to change
        // eslint-disable-next-line eqeqeq
        if ((prop ? record[prop] : record.get(me.dataIndex)) != checked) {
            if (prop) {
                record[prop] = checked;
                me.updater(cell, checked);
            } else {
                var checkValue = '';
                if (checked == true || checked == 'Y') {
                    checkValue = 'Y';
                } else {
                    checkValue = 'N';
                }
                record.set(me.dataIndex, checkValue);
            }
        }
    },
    updater: function(cell, value) {
        var me = this,
            tip;
        if (me.invert) {
            value = !value;
        }
        if (value == true || value == 'Y') {
            tip = me.checkedTooltip;
        } else {
            tip = me.tooltip;
        }
        if (tip) {
            cell.setAttribute('data-qtip', tip);
        } else {
            cell.removeAttribute('data-qtip');
        }
        if (me.useAriaElements) {
            me.updateCellAriaDescription(null, value, cell);
        }
        cell = Ext.fly(cell);
        cell[me.disabled ? 'addCls' : 'removeCls'](me.disabledCls);
        // eslint-disable-next-line max-len
        var clsValue = true;
        if (value == true || value == 'Y') {
            clsValue = true;
        } else {
            clsValue = false;
        }
        Ext.fly(cell.down(me.getView().innerSelector, true).firstChild)[clsValue ? 'addCls' : 'removeCls'](Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
        // This will update the header state on the next animation frame
        // after all rows have been updated.
        me.updateHeaderState();
    }
});

/**
 * @class Rs.ext.grid.column.RsSplitColumn
 * @extends Ext.grid.column.Action
 * @author ZanShuangpeng
 * 拆分列
 */
Ext.define('Rs.ext.grid.column.RsSplitColumn', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.rssplitcolumn',
    configs: {
        /**
         *@cfg {String} addIcon
         *拆分操作自定义图标（路径）
         */
        splitIcon: "",
        /**
         *@cfg {Array} splictFields
         *拆分字段数组
         */
        splictFields: [],
        /**
         *@cfg {String} assignmentOld
         *原数据行赋值字段
         */
        assignmentOld: {},
        /**
         *@cfg {String} assignmentNew 
         *新数据行赋值字段
         */
        assignmentNew: {}
    },
    //text: Ext.isEmpty(splitText) ? splitText :'addAction-button-item',
    items: [
        {},
        {}
    ],
    width: 80,
    initMenu: function() {
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
        Ext.each(me.items, function(selfItem, index) {
            if (index >= 3) {
                if (!Ext.isEmpty(selfItem)) {
                    selfItem.index = index;
                    me.Menu.add(selfItem);
                    if (Ext.isEmpty(selfItem.fn)) {
                        selfItem.fn = selfItem.handler;
                    }
                }
                me.Menu.on('hide', function() {
                    selfItem.hidden = true;
                });
            }
        });
    },
    initComponent: function() {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.on('afterrender', function() {
            var grid = me.up("grid");
            me.initMenu();
            Ext.each(me.items, function(item, index) {
                if (index >= 3) {
                    item.hidden = true;
                }
            });
            me.items[0] = {
                disabled: true
            };
            me.items[1] = {
                iconCls: Ext.isEmpty(me.splitIcon) ? 'addAction-button-item' : me.splitIcon,
                //tooltip: me.addToolTip,
                handler: function(view, rowIndex, colIndex, item, e, record, row) {
                    me.splictHandler(view, rowIndex, colIndex, item, e, record, row);
                }
            };
        });
    },
    splictHandler: function(view, rowIndex, colIndex, item, e, record, row) {
        var me = this,
            store = view.grid.getStore(),
            temp = {};
        if (Ext.isEmpty(me.splictFields)) {
            for (var name in record.data) {
                if (name != store.model.idProperty && name != 'ROWNUM_') {
                    temp[name] = record.data[name];
                }
            }
        } else {
            Ext.each(me.splictFields, function(field) {
                temp[field] = record.data[field];
            });
        }
        rowNum = rowIndex + 1 , store.insert(rowNum, temp);
        if (!Ext.isEmpty(me.assignmentOld)) {
            for (var name in me.assignmentOld) {
                record.set(name, record.data[me.assignmentOld[name]]);
            }
        }
        if (!Ext.isEmpty(me.assignmentNew)) {
            for (var name in me.assignmentNew) {
                var recordNew = store.getAt(rowNum);
                recordNew.set(name, record.data[me.assignmentNew[name]]);
            }
        }
    }
});

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
        uploadHandler: function(uploadParams, uploadFileParam, submitUrl, isMultiple, obj) {},
        /**
         *@cfg {function} uploadSuccess
         *上传成功回调函数
         * @method uploadSuccess
         * @params {Object} responseText 响应内容
         */
        uploadSuccess: function(responseText) {},
        /**
         *@cfg {function} uploadFailure
         *上传失败回调函数
         * @method uploadFailure
         * @params {Object} responseText 响应内容
         */
        uploadFailure: function(responseText) {}
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
    initComponent: function() {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.initIframe();
        me.on('afterrender', function() {
            me.items[0] = {
                disabled: true
            };
            //hidden: true
            me.items[1] = {
                altText: me.uploadAltText,
                iconCls: 'submit-button-icon',
                icon: me.uploadIcon,
                disabled: me.uploadDisabled,
                hidden: me.uploadHidden,
                tooltip: me.uploadToolTip,
                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
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
    initIframe: function() {
        var me = this,
            iframe = Ext.DomHelper.createDom('<iframe>');
        iframe.setAttribute('name', 'formIframe' + me.id);
        iframe.style.display = "none";
        iframe.addEventListener('load', function() {
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
    uploadHandler: function(me, uploadParams, uploadFileParam, submitUrl, isMultiple, obj) {
        if (!Ext.isEmpty(uploadFileParam)) {
            var input = Ext.DomHelper.createDom('<input>'),
                form = Ext.DomHelper.createDom('<form>'),
                uploadParamsNum = 0,
                uploadParamsArray = [],
                uploadAvailable = true,
                fileAcceptReg = "",
                fileAcceptRegArray = [],
                fileRegType, regAtrr;
            input.setAttribute('name', uploadFileParam);
            if (isMultiple) {
                input.setAttribute('multiple', 'multiple');
            }
            input.setAttribute('type', 'file');
            if (!Ext.isEmpty(me.fileAccept)) {
                input.setAttribute('accept', me.fileAccept);
                if (me.fileAccept.indexOf(",") != -1) {
                    fileAcceptRegArray = me.fileAccept.split(",");
                    Ext.each(fileAcceptRegArray, function(atrr, index, thisArray) {
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
            }
            //console.log(fileAcceptReg,"fileAcceptReg:<--------");
            //console.log(fileRegType, fileRegType.test("zip"), "fileRegType:<--------");
            input.style.opacity = 0;
            if (!Ext.isEmpty(uploadParams)) {
                Ext.Object.each(uploadParams, function(key, value, uploadParams) {
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
            input.addEventListener('change', function(e) {
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
                    Ext.each(gridPluginsArray, function(pluginObj) {
                        if (me.savePluginPtype === pluginObj.ptype) {
                            // console.log("pluginObj", pluginObj);
                            pluginObj.addButton.on('click', function() {
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
    uploadSuccess: function(responseText, rowObj) {},
    // console.log("success:", responseText);
    /**
     * 上传失败回调函数
     * public
     * @method uploadFailure
     * @params {Object} responseText 响应内容
     */
    uploadFailure: function(responseText, rowObj) {},
    //console.log("failure:", responseText);
    overLimitSize: function(limitSize, realSize) {
        var sizeOne = Ext.util.Format.uppercase(limitSize),
            sizeTwo, fileLimitSize, fileSize;
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
        thumbUploadSuccess: function(rowIndex, thumbData) {},
        /**
         *@cfg {function} thumbUploadFailure
         *缩略图上传失败回调函数
         */
        thumbUploadFailure: function() {}
    },
    text: '操作',
    fileAccept: "/*",
    limitFileSize: "100m",
    uploadToolTip: "上传缩略图",
    initComponent: function(thumbUploadAction) {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
        me.on('afterrender', function() {
            if (!Ext.isEmpty(me.gridStoreId) && !Ext.isEmpty(me.thumbField)) {
                var store = Ext.getStore(me.gridStoreId);
                me.storeHandler(store, me.thumbField, me);
                if (store.isDynamicStore) {
                    me.storeHandler(store.getCachedStore(), me.thumbField, me);
                }
            }
            me.items[0] = {
                disabled: true
            };
            //hidden: true
            me.items[1] = {
                altText: me.uploadAltText,
                iconCls: 'submit-thumbbutton-icon',
                icon: me.uploadIcon,
                disabled: me.uploadDisabled,
                hidden: me.uploadHidden,
                tooltip: me.uploadToolTip,
                handler: function(grid, rowIndex, colIndex, item, e, record, row) {
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
    uploadThumb: function(me, obj) {
        //小图标（logo）上传场景特殊
        var img = Ext.DomHelper.createDom('<img>'),
            submitButton = obj.row.getElementsByClassName("submit-thumbbutton-icon"),
            thumbUpload = Ext.DomHelper.createDom('<input>'),
            acceptTempType, acceptType;
        if (me.fileAccept.lastIndexOf(".") != -1) {
            acceptTempType = me.fileAccept.split(".")[1];
            acceptType = new RegExp("^image/" + acceptTempType);
        }
        if (me.fileAccept.lastIndexOf("/") != -1) {
            acceptTempType = me.fileAccept.split("/")[1];
            acceptType = new RegExp("^image/" + acceptTempType);
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
        thumbUpload.addEventListener('change', function(e) {
            var submitButtonRow,
                grid = obj.view.grid,
                file = e.srcElement.files,
                gridPluginsArray = grid.getPlugins();
            Ext.each(gridPluginsArray, function(pluginObj) {
                if ("cellediting" === pluginObj.ptype) {
                    pluginObj.on('edit', function(editPlugin, field) {
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
                        reader.onload = (function(aImg) {
                            return function(e) {
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
    storeHandler: function(store, thumbField, thumbColumn) {
        store.on("load", function(thisStore, records, successful, operation, eOpts) {
            var recordArray = thisStore.getRange();
            Ext.each(recordArray, function(record, index, itSelf) {
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
    isBase64String: function(str) {
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
    setFieldValue: function(thumbData, record, thumbField) {
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
    thumbUploadSuccess: function(rowIndex, thumbData) {},
    //console.log(rowIndex,thumbData);
    /**
     * 缩略图上传失败回调函数
     * public
     * @method thumbUploadFailure
     */
    thumbUploadFailure: function() {},
    // console.log("no!!!");
    overLimitSize: function(limitSize, realSize) {
        var sizeOne = Ext.util.Format.uppercase(limitSize),
            sizeTwo, fileLimitSize, fileSize;
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

Ext.define('Rs.ext.grid.plugin.CalculateAssign', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.calculateassign',
    /* 	requires: [
		//'Rs.ext.button.RsButton'
		'Ext.form.field.Field'
	], */
    requires: 'Ext.form.field.Field',
    configs: {
        relyOn: [],
        //依赖字段
        assignValue: '',
        rule: ''
    },
    //初始化插件
    init: function(grid) {
        var me = this;
        if (!me.relyOn || !me.assignValue || !me.rule) {
            return false;
        }
        if (grid.isXType('grid')) {
            //grid.xtype=='mygridpanel'||grid.xtype=='gridpanel'){
            me.grid = grid;
        } else /*me.grid.on('edit',function(editPlugin,context){
				//if((me.relyOn).includes(context.field)){
					//me.gridCalculate(context);
				//} 
				me.gridCalculate(context);
				
				
			});*/
        {
            for (j = 0; j < me.relyOn.length; j++) {
                var a = me.relyOn[j];
                Ext.getCmp(a).on('blur', function() {
                    me.formCalculate(me.relyOn, me.assignValue, me.rule);
                });
            }
        }
    },
    formCalculate: function(relyOn, assignValue, formula) {
        var formulaResult = "";
        var symbleFlag = false;
        var field = "";
        var calResult = 0;
        var me = this;
        for (i = 0; i < formula.length; i++) {
            if (formula.charAt(i) == "[") {
                symbleFlag = true;
                field = "";
            } else if (formula.charAt(i) == "]") {
                symbleFlag = false;
                //console.log("field:"+field);
                //console.log("field_name:"+record.get(field));
                if (Ext.getCmp(field).value) {
                    formulaResult = formulaResult + Ext.getCmp(field).value.toString();
                } else {
                    return false;
                }
            } else if (!symbleFlag) {
                formulaResult = formulaResult + formula.charAt(i);
            } else if (symbleFlag) {
                field = field + formula.charAt(i);
            }
        }
        calResult = me.doStr(formulaResult);
        if (isNaN(calResult) || Ext.isEmpty(calResult)) {
            Ext.Msg.alert('提示', '公式字段配置错误');
            return false;
        }
        calResult = calResult.toFixed(2);
        Ext.getCmp(assignValue).setValue(calResult);
        return true;
    },
    gridCalculate: function(context) {
        var me = this;
        var assignValue = me.assignValue;
        var formula = me.rule;
        var record = context.record;
        var formulaResult1 = '';
        var symbleFlag = false;
        var field = "";
        var calResult = 0;
        if ((me.relyOn).includes(context.field)) {
            for (i = 0; i < formula.length; i++) {
                if (formula.charAt(i) == "[") {
                    symbleFlag = true;
                    field = "";
                } else if (formula.charAt(i) == "]") {
                    symbleFlag = false;
                    //formulaResult1 = formulaResult1 + record.get(field).toString();
                    if (record.get(field)) {
                        formulaResult1 = formulaResult1 + record.get(field).toString();
                    } else {
                        return false;
                    }
                } else if (!symbleFlag) {
                    formulaResult1 = formulaResult1 + formula.charAt(i);
                } else if (symbleFlag) {
                    field = field + formula.charAt(i);
                }
            }
            calResult = me.doStr(formulaResult1);
            if (isNaN(calResult) || Ext.isEmpty(calResult)) {
                Ext.Msg.alert('提示', '公式字段配置错误');
                return false;
            }
            calResult = calResult.toFixed(2);
            record.set(assignValue, calResult);
            return true;
        }
    },
    doStr: function(fn) {
        var Fn = Function;
        return new Fn("return " + fn)();
    }
});

Ext.define('Rs.ext.grid.plugin.DecrementPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.decrement-plugin',
    configs: {
        panelId: ''
    },
    gridFieldDecrease: function(field, record) {
        var panel, tempRecord, oldValue, newValue,
            me = this;
        if (!Ext.isEmpty(me.panelId)) {
            panel = Ext.getCmp(me.panelId);
        }
        if (Ext.isEmpty(record) && !Ext.isEmpty(me.panelId)) {
            tempRecord = panel.getSelection()[0];
            oldValue = tempRecord.get(field);
            if (oldValue > 0) {
                newValue = oldValue - 1;
                tempRecord.set(field, newValue);
            }
        }
        if (!Ext.isEmpty(record) && !Ext.isEmpty(field)) {
            oldValue = record.get(field);
            if (oldValue > 0) {
                newValue = oldValue - 1;
                record.set(field, newValue);
            }
        }
    },
    formFieldDecrease: function(id) {
        if (!Ext.isEmpty(id)) {
            var item = Ext.getCmp(id),
                oldValue = item.getValue(),
                newValue;
            if (oldValue > 0) {
                newValue = oldValue - 1;
                item.setValue(newValue);
            }
        }
    }
});

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
    init: function(grid) {
        var me = this;
        grid.on('afterrender', function(thisGrid) {
            var fieldsArray = [],
                oldColumnArray = [],
                newColumnArray = [],
                tempColumnArray = [],
                columnModelConfig = {},
                t = {};
            var data = [
                    {
                        dataIndex: "nodeType",
                        text: "wff",
                        itemId: "wtf"
                    },
                    {
                        dataIndex: "seqNo",
                        text: "qqq",
                        itemId: "qqq"
                    }
                ];
            //获取原有的列和模型字段
            Ext.each(thisGrid.getStore().getModel().getFields(), function(obj, index, itself) {
                var tempField = {};
                if (obj.name !== "id") {
                    Ext.Object.each(obj, function(key, value, myself) {
                        tempField[key] = value;
                    });
                    fieldsArray.push(tempField);
                }
            });
            Ext.each(thisGrid.getColumns(), function(column) {
                var tempColumn = {};
                Ext.Object.each(column.getInitialConfig(), function(key, value, myself) {
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
            Ext.each(data, function(dataObj, index, itself) {
                var newColumn = {};
                Ext.Object.merge(newColumn, columnModelConfig);
                Ext.Object.merge(newColumn, dataObj);
                Ext.Object.each(dataObj, function(key, value, myself) {
                    //newColumn[key] = value;
                    if (key === "dataIndex") {
                        fieldsArray.push({
                            name: value
                        });
                    }
                    if (!Ext.isEmpty(me.extraColumnConfig)) {
                        Ext.Object.each(me.extraColumnConfig, function(dataIndex, configObj, objself) {
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

Ext.define('Rs.ext.grid.plugin.FieldDiffentControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fielddiffentcontrolf',
    /*requires: [
		//'Rs.ext.button.RsButton'
		'Ext.form.field.Field'
	],*/
    configs: {
        itemIds: '',
        panelId: '',
        checkField: [],
        errorCode: ''
    },
    //初始化插件
    init: function(grid) {
        var me = this;
        me.grid = grid;
    },
    /*me.grid.on('edit',function(editPlugin,context){
			        
			me.gridAttributeUnsame(me.itemIds,me.checkField,context);
		});*/
    gridAttributeUnsame: function(context) {
        var me = this,
            itemIds = me.itemIds,
            checkField = me.checkField,
            record = context.record,
            field = context.field;
        rowIndex = context.rowIdx;
        if (field != itemIds) {
            return true;
        }
        if (rowIndex == 0) {
            return true;
        }
        if (Ext.isEmpty(record.get(checkField))) {
            return true;
        }
        var checkValue = me.grid.getStore().getAt(rowIndex - 1).get(checkField);
        if (record.get(checkField).toString() == checkValue.toString()) {
            record.set(checkField, '');
            Ext.Msg.alert('提示', '业务属性一致');
            return false;
        } else {
            return true;
        }
    }
});

Ext.define('Rs.ext.grid.plugin.FieldSameControlB', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fieldsamecontrolb',
    //requires:'Ext.button.Button',
    configs: {
        /**
		*@cfg {string} itemId
		*控件id
		*/
        itemIds: '',
        /**
		*@cfg {string} panelId
		*来源面板id
		*/
        panelId: '',
        /**
		*@cfg {string} panelId
		*数据面板id
		*/
        dataPanelId: '',
        /**
		*@cfg {string} tableCode
		*数据表
		*/
        tableCode: '',
        /**
		*@cfg {string} fields
		*数据表字段
		*/
        fields: '',
        /**
		*@cfg {string} condition
		*约束条件
		*/
        condition: '',
        /**
		*@cfg {string} errorCode
		*错误信息码
		*/
        errorCode: '',
        /**
		*@cfg {string} tipType
		*提示类型
		*/
        tipType: ''
    },
    //初始化插件
    init: function(grid) {
        var me = this,
            editPlugin,
            gridPluginsArray = grid.getPlugins();
        if (Ext.isEmpty(me.panelId)) {
            Ext.Msg.alert("系统提示", "插件参数配置错误");
            return false;
        }
        //来源面板id有值，数据面板id无值————则为单列表页面
        if (Ext.getCmp(me.panelId).isXType('grid') && Ext.isEmpty(me.dataPanelId)) {
            me.gridFunction(gridPluginsArray, editPlugin);
        } else if (Ext.getCmp(me.panelId).isXType('form') && Ext.getCmp(me.dataPanelId).isXType('grid')) {
            me.mixFunction();
        } else {
            Ext.Msg.alert("系统提示", "插件参数配置错误");
            return false;
        }
    },
    doSql: function(sql) {
        var count = 0;
        var controlSql = sql;
        var params = {};
        params.sql = controlSql;
        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function(response, opts) {
                if (Ext.decode(response.responseText).success) {
                    count = Ext.decode(response.responseText).data[0].COUNT;
                    return count;
                } else {
                    Ext.Msg.alert("系统提示", Ext.decode(response.responseText).mesg);
                }
            },
            failure: function(response, opts) {
                Ext.Msg.alert("系统提示", "服务器未连接");
            }
        });
    },
    //return count;
    doSql123: function(sql) {
        var count = 0;
        return count;
    },
    //xtype为grid——单列表页面
    gridFunction: function(gridPluginsArray, editPlugin) {},
    // var me = this;
    // Ext.each(gridPluginsArray,function(pluginObj){
    // if("cellediting"===pluginObj.ptype){
    // editPlugin = pluginObj;
    // }
    // if("rowediting"===pluginObj.ptype){
    // editPlugin = pluginObj;
    // }
    // },this);
    // editPlugin.on('edit',function(editPlugin,context){
    // me.singleGridFunction(editPlugin,context.record,context.field,context.rowIdx);
    // },me);
    //混合页面
    singleGridFunction: function(editPlugin, context_record, context_field, context_rowIdx) {
        var me = this;
        var sql = "select ";
        var fieldSql = "";
        var field;
        var symbleFlag = false;
        var fieldsArray = new Array();
        fieldsArray = me.fields.split(",");
        if (fieldsArray.length == 0) {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
        for (j = 0; j < fieldsArray.length; j++) {
            if (j == 0) {
                fieldSql = fieldSql + fieldsArray[j];
            } else {
                fieldSql = fieldSql + ", " + fieldsArray[j];
            }
        }
        sql = sql + fieldSql + " from " + me.tableCode + " where 1=1 ";
        var formula = me.condition;
        var formulaResult = "";
        var lastFieldsValueArray = new Array();
        var newFieldsValueArray = new Array();
        var record = context_record;
        //console.log(context);
        var nowRowNum;
        //console.log(record);
        if (context_field == me.itemIds) {
            nowRowNum = context_rowIdx;
            //当前点击的不是第一行
            if (nowRowNum != 0) {
                //console.log(Ext.getCmp(me.panelId).getStore().getAt(nowRowNum-1));
                //获取目标行关联字段的值
                for (i = 0; i < fieldsArray.length; i++) {
                    lastFieldsValueArray[i] = Ext.getCmp(me.panelId).getStore().getAt(nowRowNum - 1).get(fieldsArray[i]);
                }
                //console.log(lastFieldsValueArray);
                formulaResult = "";
                if (!Ext.isEmpty(formula)) {
                    for (i = 0; i < formula.length; i++) {
                        //console.log(formula.charAt(i));
                        if (formula.charAt(i) == "[") {
                            symbleFlag = true;
                            field = "";
                        } else if (formula.charAt(i) == "]") {
                            symbleFlag = false;
                            //console.log("field:"+field);
                            //console.log("field_name:"+record.get(field));
                            if (Ext.isEmpty(record.get(field))) {
                                value = "''";
                                formulaResult = formulaResult + value.toString();
                            } else {
                                value = "'" + record.get(field) + "'";
                                formulaResult = formulaResult + value.toString();
                            }
                        } else if (!symbleFlag) {
                            formulaResult = formulaResult + formula.charAt(i);
                        } else if (symbleFlag) {
                            field = field + formula.charAt(i);
                        }
                    }
                }
                sql = sql + formulaResult;
                var controlSql = sql;
                //var controlSql = "select uu_id, sys_code from Sys_Program_Log where acct_code = 'zhongyang' and uu_id = '12'";
                var params = {};
                params.sql = controlSql;
                Ext.Ajax.request({
                    url: '/base/sql/excute',
                    jsonData: params,
                    async: false,
                    method: 'POST',
                    success: function(response, opts) {
                        if (Ext.decode(response.responseText).success) {
                            if (Ext.decode(response.responseText).data.length > 1) {
                                Ext.Msg.alert("系统提示", "找到多条记录");
                                record.set(me.itemIds, "");
                                return false;
                            } else if (Ext.decode(response.responseText).data.length == 0) {
                                Ext.Msg.alert("系统提示", "未找到记录");
                                record.set(me.itemIds, "");
                                return false;
                            } else {
                                for (i = 0; i < fieldsArray.length; i++) {
                                    newFieldsValueArray[i] = Ext.decode(response.responseText).data[0][fieldsArray[i].toUpperCase()];
                                }
                            }
                        } else {
                            Ext.Msg.alert("系统提示", Ext.decode(response.responseText).mesg);
                            return false;
                        }
                    },
                    failure: function(response, opts) {
                        Ext.Msg.alert("系统提示", "服务器未连接");
                        return false;
                    }
                });
                if (me.arraryCompare(lastFieldsValueArray, newFieldsValueArray)) {
                    //找到一致记录
                    return true;
                } else {
                    //未找到一致记录
                    record.set(me.itemIds, "");
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return true;
        }
    },
    //混合页面
    mixFunction: function() {
        var me = this;
        var sql = "select ";
        var fieldSql = "";
        var symbleFlag = false;
        var formulaResult = "";
        var formula = me.condition;
        var field;
        var fieldsArray = new Array();
        fieldsArray = me.fields.split(",");
        if (fieldsArray.length == 0) {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
        for (j = 0; j < fieldsArray.length; j++) {
            if (j == 0) {
                fieldSql = fieldSql + fieldsArray[j];
            } else {
                fieldSql = fieldSql + ", " + fieldsArray[j];
            }
        }
        if (Ext.isEmpty(me.itemIds)) {
            return false;
        }
        var item = Ext.getCmp(me.itemIds);
        item.on('blur', function(editPlugin, context) {
            var lastFieldsValueArray = new Array();
            var newFieldsValueArray = new Array();
            var lastRowNum = Ext.getCmp(me.dataPanelId).getStore().data.length;
            //获取数据面板最后一行关联字段的值
            for (i = 0; i < fieldsArray.length; i++) {
                lastFieldsValueArray[i] = Ext.getCmp(me.dataPanelId).getStore().getAt(lastRowNum - 1).get(fieldsArray[i]);
            }
            //console.log(lastFieldsValueArray);
            sql = "select ";
            sql = sql + fieldSql + " from " + me.tableCode + " where 1=1 ";
            formulaResult = "";
            if (!Ext.isEmpty(formula)) {
                for (i = 0; i < formula.length; i++) {
                    //console.log(formula.charAt(i));
                    if (formula.charAt(i) == "[") {
                        symbleFlag = true;
                        field = "";
                    } else if (formula.charAt(i) == "]") {
                        symbleFlag = false;
                        if (Ext.isEmpty(Ext.getCmp(field))) {
                            Ext.Msg.alert('提示', '插件配置错误-匹配条件中未找到对应的控件');
                            Ext.getCmp(me.itemIds).setValue("");
                            return false;
                        } else if (Ext.isEmpty(Ext.getCmp(field).getValue())) {
                            value = "''";
                            formulaResult = formulaResult + value.toString();
                        } else {
                            value = "'" + Ext.getCmp(field).getValue() + "'";
                            formulaResult = formulaResult + value.toString();
                        }
                    } else if (!symbleFlag) {
                        formulaResult = formulaResult + formula.charAt(i);
                    } else if (symbleFlag) {
                        field = field + formula.charAt(i);
                    }
                }
            }
            sql = sql + formulaResult;
            var controlSql = sql;
            //var controlSql = "select uu_id, sys_code from Sys_Program_Log where acct_code = 'zhongyang' and uu_id = '12'";
            var params = {};
            params.sql = controlSql;
            Ext.Ajax.request({
                url: '/base/sql/excute',
                jsonData: params,
                async: false,
                method: 'POST',
                success: function(response, opts) {
                    if (Ext.decode(response.responseText).success) {
                        if (Ext.decode(response.responseText).data.length > 1) {
                            Ext.Msg.alert("系统提示", "找到多条记录");
                            Ext.getCmp(me.itemIds).setValue("");
                            return false;
                        } else if (Ext.decode(response.responseText).data.length == 0) {
                            Ext.Msg.alert("系统提示", "未找到记录");
                            Ext.getCmp(me.itemIds).setValue("");
                            return false;
                        } else {
                            for (i = 0; i < fieldsArray.length; i++) {
                                newFieldsValueArray[i] = Ext.decode(response.responseText).data[0][fieldsArray[i].toUpperCase()];
                            }
                        }
                    } else {
                        Ext.Msg.alert("系统提示", Ext.decode(response.responseText).mesg);
                        return false;
                    }
                },
                failure: function(response, opts) {
                    Ext.Msg.alert("系统提示", "服务器未连接");
                    return false;
                }
            });
            if (me.arraryCompare(lastFieldsValueArray, newFieldsValueArray)) {
                //找到一致记录
                return true;
            } else {
                //未找到一致记录
                Ext.getCmp(me.itemIds).setValue("");
                return false;
            }
        });
    },
    arraryCompare: function(arrary1, arrary2) {
        var compareFlag = true;
        if (arrary1.length != arrary2.length) {
            Ext.Msg.alert("系统提示", "验证模型报错");
            return false;
        }
        for (i = 0; i < arrary1.length; i++) {
            if (arrary1[i] == arrary2[i]) {} else {
                compareFlag = false;
            }
        }
        return compareFlag;
    }
});

Ext.define('Rs.ext.grid.plugin.FieldSameControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fieldsamecontrolf',
    /*requires: [
		//'Rs.ext.button.RsButton'
		'Ext.form.field.Field'
	],*/
    configs: {
        itemIds: '',
        panelId: '',
        checkField: [],
        errorCode: ''
    },
    //初始化插件
    init: function(grid) {
        var me = this;
        me.grid = grid;
    },
    /*me.grid.on('edit',function(editPlugin,context){
			        
			me.gridAttributeSame(me.itemIds,me.checkField,context);
		});*/
    gridAttributeSame: function(context) {
        var me = this,
            itemIds = me.itemIds,
            checkField = me.checkField,
            record = context.record,
            field = context.field;
        rowIndex = context.rowIdx;
        if (field != itemIds) {
            return true;
        }
        if (rowIndex == 0) {
            return true;
        }
        if (Ext.isEmpty(record.get(checkField))) {
            return true;
        }
        var checkValue = me.grid.getStore().getAt(rowIndex - 1).get(checkField);
        if (record.get(checkField).toString() != checkValue.toString()) {
            record.set(checkField, '');
            Ext.Msg.alert('提示', '业务属性不一致');
            return false;
        } else {
            return true;
        }
    }
});

/**
	 * @Rs.ext.grid.plugin.FieldsCompareControlF
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 两个业务属性比较控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldsCompareControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fieldsCompare',
    requires: 'Ext.form.field.Field',
    configs: {
        itemIds: '',
        panelId: '',
        checkField: '',
        controlRule: '',
        errorCode: ''
    },
    init: function(grid) {
        var me = this;
        if (grid.isXType('grid')) {
            me.grid = grid;
        } else /*me.grid.on('edit',function(editPlugin,context){
				me.gridCompareControl(me.itemIds,me.checkField,me.controlRule,context);
			});*/
        {
            if (!Ext.getCmp(me.itemIds) || !Ext.getCmp(me.checkField)) {
                Ext.Msg.alert('提示', '控件配置错误');
                return false;
            }
            Ext.getCmp(me.itemIds).on('blur', function() {
                me.formCompareControl(me.itemIds, me.checkField, me.controlRule);
            });
            Ext.getCmp(me.checkField).on('blur', function() {
                me.formCompareControl(me.itemIds, me.checkField, me.controlRule);
            });
        }
    },
    formCompareControl: function(itemIds, checkField, controlRule) {
        var newValue = Ext.getCmp(itemIds).value;
        var compareValue = Ext.getCmp(checkField).value;
        if (isNaN(newValue) || Ext.isEmpty(newValue)) {
            return false;
        }
        if (isNaN(compareValue) || Ext.isEmpty(compareValue)) {
            return false;
        }
        if ([
            '>',
            '<',
            '>=',
            '<=',
            '==',
            '!=='
        ].includes(controlRule)) {
            if (!this.doStr('parseFloat(' + newValue + ')' + controlRule + 'parseFloat(' + compareValue + ')')) {
                Ext.Msg.alert('提示', '不满足控制规则');
                Ext.getCmp(itemIds).setValue();
                return false;
            } else {
                return true;
            }
        } else {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
    },
    gridCompareControl: function(context) {
        var me = this,
            record = context.record,
            field = context.field,
            itemIds = me.itemIds,
            checkField = me.checkField,
            controlRule = me.controlRule;
        newValue = record.get(itemIds) , compareValue = record.get(checkField);
        if (field != itemIds && field != checkField) {
            return true;
        }
        if (isNaN(newValue) || Ext.isEmpty(newValue)) {
            return false;
        }
        if (isNaN(compareValue) || Ext.isEmpty(compareValue)) {
            return false;
        }
        if ([
            '>',
            '<',
            '>=',
            '<=',
            '==',
            '!=='
        ].includes(controlRule)) {
            if (!this.doStr('parseFloat(' + newValue + ')' + controlRule + 'parseFloat(' + compareValue + ')')) {
                Ext.Msg.alert('提示', '不满足控制规则');
                record.set(itemIds, '');
                return false;
            } else {
                return true;
            }
        } else {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
    },
    doStr: function(fn) {
        var Fn = Function;
        return new Fn("return " + fn)();
    }
});

/**
	 * @Rs.ext.grid.plugin.FieldsDifferentControlB
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 后台业务属性不一致控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldsDifferentControlB', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fieldsDifferentB',
    requires: 'Ext.form.field.Field',
    configs: {
        itemIds: '',
        panelId: '',
        tableCode: '',
        fields: '',
        condition: '',
        errorCode: '',
        tipType: ''
    },
    init: function() {
        var me = this;
        if (Ext.getCmp(me.config.panelId).isXType('grid')) {} else /*
			Ext.getCmp(me.config.panelId).on('edit',function(editPlugin,context){
				me.gridFieldsDifferentControlB(context);
			});
			*/
        {
            var fields = me.config.fields.split(',');
            for (var i = 0; i < fields.length; i++) {
                if (!Ext.getCmp(fields[i])) {
                    Ext.Msg.alert('提示', '控件配置错误');
                    return false;
                } else {
                    Ext.getCmp(fields[i]).on('blur', function(field) {
                        me.formFieldsDifferentControlB(field);
                    });
                }
            }
        }
    },
    formFieldsDifferentControlB: function(field) {
        var me = this;
        var con = '1 = 1';
        var companyCode = (typeof (USERINFO) == "undefined" ? "00" : USERINFO.COMPANYCODE);
        var condition = me.config.condition.split(',');
        var fields = me.config.fields.split(',');
        for (var i = 0; i < condition.length; i++) {
            if (condition[i] == "company_code") {
                con = con + " AND company_code = '" + companyCode + "'";
            } else {
                con = con + " AND " + condition[i];
            }
        }
        for (var j = 0; j < fields.length; j++) {
            if (Ext.isEmpty(Ext.getCmp(fields[j]).getValue())) {
                return true;
            } else {
                con = con + " AND " + fields[j] + " = " + "'" + Ext.getCmp(fields[j]).getValue() + "'";
            }
        }
        var controlSql = "select count(*) AS NUM from " + me.config.tableCode + " where " + con;
        console.log("controlSql:", controlSql);
        var params = {};
        params.sql = controlSql;
        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function(response, opts) {
                if (Ext.decode(response.responseText).success) {
                    if (Ext.decode(response.responseText).data[0].NUM === 0) {
                        return true;
                    } else {
                        Ext.Msg.alert("系统提示", "后台验证不一致未通过");
                        field.setValue('');
                        return false;
                    }
                    
                } else {
                    Ext.Msg.alert("系统提示", Ext.decode(response.responseText).mesg);
                    return false;
                }
            },
            failure: function(response, opts) {
                Ext.Msg.alert("系统提示", "服务器未连接");
                return false;
            }
        });
    },
    gridFieldsDifferentControlB: function(context) {
        var me = this;
        var record = context.record;
        var con = '1 = 1';
        var companyCode = (typeof (USERINFO) == "undefined" ? "00" : USERINFO.COMPANYCODE);
        var condition = me.config.condition.split(',');
        var fields = me.config.fields.split(',');
        for (var i = 0; i < condition.length; i++) {
            if (condition[i] == "company_code") {
                con = con + " AND company_code = '" + companyCode + "'";
            } else {
                con = con + " AND " + condition[i];
            }
        }
        for (var j = 0; j < fields.length; j++) {
            if (fields[j] in record.data) {
                if (Ext.isEmpty(record.get(fields[j]))) {
                    return true;
                } else {
                    con = con + " AND " + fields[j] + " = " + "'" + record.get(fields[j]) + "'";
                }
            }
        }
        var controlSql = "select count(*) AS NUM from " + me.config.tableCode + " where " + con;
        console.log("controlSql:", controlSql);
        var params = {};
        params.sql = controlSql;
        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function(response, opts) {
                if (Ext.decode(response.responseText).success) {
                    if (Ext.decode(response.responseText).data[0].NUM === 0) {
                        return true;
                    } else {
                        Ext.Msg.alert("系统提示", "后台验证不一致未通过");
                        record.set(context.field, '');
                        return false;
                    }
                    
                } else {
                    Ext.Msg.alert("系统提示", Ext.decode(response.responseText).mesg);
                    return false;
                }
            },
            failure: function(response, opts) {
                Ext.Msg.alert("系统提示", "服务器未连接");
                return false;
            }
        });
    }
});

/**
	 * @Rs.ext.grid.plugin.FieldsHeadDetailCalculatePlugin
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 头数值与明细数值计算
	 */
Ext.define('Rs.ext.grid.plugin.FieldsHeadDetailCalculatePlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.headDetailCalculate',
    requires: 'Ext.form.field.Field',
    configs: {
        hPanelID: '',
        dPanelID: '',
        hFields: '',
        dFields: '',
        errorCode: ''
    },
    init: function(grid) {
        var me = this;
        if (!Ext.getCmp(me.config.dPanelID)) {
            Ext.Msg.alert('提示', '明细面板ID配置错误');
            return false;
        }
    },
    /*
		Ext.getCmp(me.config.dPanelID).on('edit',function(editPlugin,context){
			me.headCalculate(context);
		});
		*/
    headCalculate: function() {
        var me = this;
        if (!Ext.getCmp(me.config.hPanelID)) {
            Ext.Msg.alert('提示', '头面板ID配置错误');
        }
        var hFields = me.config.hFields;
        var dFields = me.config.dFields.split(',');
        var headNumber = 0;
        var detailNumber = 0;
        var fieldFlag = false;
        var equation = '';
        for (var i = 0; i < dFields.length; i++) {
            detailNumber = 0;
            fieldFlag = false;
            Ext.getCmp(me.config.dPanelID).getStore().each(function(record, idx) {
                if (dFields[i] in record.data) {
                    fieldFlag = true;
                    detailNumber = parseFloat(detailNumber) + parseFloat(record.get(dFields[i]));
                }
            });
            if (fieldFlag) {
                detailNumber = detailNumber.toFixed(2);
                equation = equation + 'parseFloat(' + detailNumber + ')';
            } else {
                equation = equation + dFields[i];
            }
        }
        detailNumber = me.doStr(equation);
        if (isNaN(detailNumber) || Ext.isEmpty(detailNumber)) {
            Ext.Msg.alert('提示', '明细字段配置错误');
            return false;
        }
        headNumber = detailNumber.toFixed(2);
        if (Ext.getCmp(me.config.hPanelID).isXType('grid')) {
            //列表
            Ext.getCmp(me.config.hPanelID).getStore().each(function(record, idx) {
                if (idx == Ext.getCmp(me.config.hPanelID).getSelectionModel().selectionStartIdx) {
                    record.set(hFields, headNumber);
                    return true;
                }
            });
        } else {
            //卡片
            if (!Ext.getCmp(hFields)) {
                Ext.Msg.alert('提示', '头字段配置错误');
                return false;
            } else {
                Ext.getCmp(hFields).setValue(headNumber);
                return true;
            }
        }
    },
    doStr: function(fn) {
        var Fn = Function;
        return new Fn("return " + fn)();
    }
});

/**
	 * @Rs.ext.grid.plugin.FieldsSumComparePlugin
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 头数值与明细数值合计值
	 */
Ext.define('Rs.ext.grid.plugin.FieldsSumComparePlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.sumCompare',
    requires: 'Ext.form.field.Field',
    configs: {
        hPanelID: '',
        dPanelID: '',
        hFields: '',
        dFields: '',
        formula: '',
        errorCode: ''
    },
    headDetailSumCompareControl: function() {
        var me = this;
        if (!Ext.getCmp(me.config.hPanelID)) {
            Ext.Msg.alert('提示', '头面板ID配置错误');
            return {
                "success": false,
                "panelId": "",
                "errorMsg": [],
                "errArr": []
            };
        }
        if (!Ext.getCmp(me.config.dPanelID)) {
            Ext.Msg.alert('提示', '明细面板ID配置错误');
            return {
                "success": false,
                "panelId": "",
                "errorMsg": [],
                "errArr": []
            };
        }
        var hFields = me.config.hFields.split(',');
        var dFields = me.config.dFields.split(',');
        var headNumber = 0;
        var detailNumber = 0;
        var fieldFlag = false;
        var equation = '';
        //计算头字段数值
        for (var i = 0; i < hFields.length; i++) {
            headNumber = 0;
            fieldFlag = false;
            if (Ext.getCmp(me.config.hPanelID).isXType('grid')) {
                Ext.getCmp(me.config.hPanelID).getStore().each(function(record, idx) {
                    if (idx == Ext.getCmp(me.config.hPanelID).getSelectionModel().selectionStartIdx) {
                        if (hFields[i] in record.data) {
                            fieldFlag = true;
                            headNumber = parseFloat(headNumber) + parseFloat(record.get(hFields[i]));
                        }
                    }
                });
            } else {
                if (Ext.getCmp(me.config.hPanelID).items.items.includes(Ext.getCmp(hFields[i]))) {
                    fieldFlag = true;
                    headNumber = parseFloat(headNumber) + parseFloat(Ext.getCmp(hFields[i]).value);
                }
            }
            if (fieldFlag) {
                headNumber = headNumber.toFixed(2);
                equation = equation + 'parseFloat(' + headNumber + ')';
            } else {
                equation = equation + hFields[i];
            }
        }
        headNumber = me.doStr(equation);
        if (isNaN(headNumber) || Ext.isEmpty(headNumber)) {
            Ext.Msg.alert('提示', '头字段配置错误');
            return {
                "success": false,
                "panelId": "",
                "errorMsg": [],
                "errArr": []
            };
        }
        headNumber = headNumber.toFixed(2);
        //计算明细字段数值
        equation = '';
        //var errArr = [];
        //var errArrRecord = {};
        for (var i = 0; i < dFields.length; i++) {
            detailNumber = 0;
            fieldFlag = false;
            Ext.getCmp(me.config.dPanelID).getStore().each(function(record, idx) {
                if (dFields[i] in record.data) {
                    fieldFlag = true;
                    detailNumber = parseFloat(detailNumber) + parseFloat(record.get(dFields[i]));
                }
            });
            //errArrRecord.uuid = record.get('uuid');
            //errArrRecord.checkField = dFields;
            //console.log(errArrRecord);
            if (fieldFlag) {
                detailNumber = detailNumber.toFixed(2);
                equation = equation + 'parseFloat(' + detailNumber + ')';
            } else {
                equation = equation + dFields[i];
            }
        }
        detailNumber = me.doStr(equation);
        if (isNaN(detailNumber) || Ext.isEmpty(detailNumber)) {
            Ext.Msg.alert('提示', '明细字段配置错误');
            return {
                "success": false,
                "panelId": "",
                "errorMsg": [],
                "errArr": []
            };
        }
        detailNumber = detailNumber.toFixed(2);
        if ([
            '>',
            '<',
            '>=',
            '<=',
            '==',
            '!=='
        ].includes(me.config.formula)) {
            if (!this.doStr('parseFloat(' + headNumber + ')' + me.config.formula + 'parseFloat(' + detailNumber + ')')) {
                return {
                    "success": false,
                    "panelId": me.config.dPanelID,
                    "errorMsg": me.config.errorCode,
                    "errArr": []
                };
            } else {
                return {
                    "success": true,
                    "panelId": "",
                    "errorMsg": [],
                    "errArr": []
                };
            }
        } else {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return {
                "success": false,
                "panelId": "",
                "errorMsg": [],
                "errArr": []
            };
        }
    },
    doStr: function(fn) {
        var Fn = Function;
        return new Fn("return " + fn)();
    }
});

Ext.define('Rs.ext.grid.plugin.FormulaPlu', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.formulaplu',
    //requires:'Ext.button.Button',
    configs: {
        /**
		*@cfg {string} panelId
		*面板id
		*/
        panelID: '',
        /**
		*@cfg {string} formula
		*运算公式
		*/
        formula: '',
        /**
		*@cfg {string} erroCode
		*错误信息码
		*/
        erroCode: '',
        /**
		*@cfg {string} otherCdt
		*附加触发验证条件
		*/
        otherCdt: ''
    },
    //初始化插件
    init: function(grid) {},
    //var me = this,
    //editPlugin;
    //editPlugin = Ext.getCmp("button");
    //editPlugin.on('click',function(editPlugin,context){
    //验证附加触发条件
    //console.log("触发条件:"+me.otherCdt);
    //me.formulaPlu();
    //},me);
    //xtype为grid
    formulaPlu: function(gridPluginsArray, editPlugin) {
        var me = this;
        //console.log("面板id:"+me.panelID);
        //console.log("运算公式:"+me.formula);
        var formulaComponent = new Array();
        formulaComponent = me.formula.split("=");
        //console.log("运算公式左边:"+formulaComponent[0]);
        //console.log("运算公式右边:"+formulaComponent[1]);
        var formula = formulaComponent[0];
        var formula_right = formulaComponent[1];
        var errArr = [];
        var errFlag = true;
        var uuId = Ext.getCmp(me.panelID).getStore().getModel().idProperty;
        Ext.getCmp(me.panelID).getStore().each(function(record) {
            var formulaResult = "";
            var formulaResult_condition = "";
            var symbleFlag = false;
            var symbleFlag_right = false;
            var symbleFlag_condition = false;
            var field = "";
            var field_condition = "";
            var value = 0;
            var fieldArr = [];
            var condition = me.otherCdt;
            if (!Ext.isEmpty(me.otherCdt)) {
                for (i = 0; i < condition.length; i++) {
                    //console.log(formula.charAt(i));
                    if (condition.charAt(i) == "[") {
                        symbleFlag_condition = true;
                        field_condition = "";
                    } else if (condition.charAt(i) == "]") {
                        symbleFlag_condition = false;
                        //console.log("field_condition:"+field_condition);
                        //console.log("field_name:"+record.get(field_condition));
                        if (Ext.isEmpty(record.get(field_condition))) {
                            //Ext.Msg.alert('提示','附加触发验证条件为空值，无法验证');
                            break;
                        } else {
                            formulaResult_condition = formulaResult_condition + "'" + record.get(field_condition).toString() + "'";
                        }
                    }
                    //formulaResult_condition = formulaResult_condition + record.get(field_condition).toString();
                    else if (condition.charAt(i) == "=") {
                        formulaResult_condition = formulaResult_condition + '==';
                    } else if (!symbleFlag_condition) {
                        formulaResult_condition = formulaResult_condition + condition.charAt(i);
                    } else if (symbleFlag_condition) {
                        field_condition = field_condition + condition.charAt(i);
                    }
                }
            } else {
                formulaResult_condition = "1==1";
            }
            if (me.doStr(formulaResult_condition)) {
                if (!Ext.isEmpty(record.get(uuId))) {
                    for (i = 0; i < formula.length; i++) {
                        //console.log(formula.charAt(i));
                        if (formula.charAt(i) == "[") {
                            symbleFlag = true;
                            field = "";
                        } else if (formula.charAt(i) == "]") {
                            symbleFlag = false;
                            //console.log("field:"+field);
                            //console.log("field_name:"+record.get(field));
                            if (Ext.isEmpty(record.get(field)) || record.get(field) == 0) {
                                fieldArr.push(field);
                                value = parseFloat(0);
                                value = value.toFixed(2);
                                formulaResult = formulaResult + value.toString();
                            } else if (isNaN(record.get(field))) {
                                console.log('formulaPlu插件字段存在字符串，无法计算');
                                break;
                            } else {
                                fieldArr.push(field);
                                value = parseFloat(record.get(field));
                                value = value.toFixed(2);
                                formulaResult = formulaResult + value.toString();
                            }
                        }
                        //formulaResult = formulaResult + record.get(field).toString();
                        else if (!symbleFlag) {
                            formulaResult = formulaResult + formula.charAt(i);
                        } else if (symbleFlag) {
                            field = field + formula.charAt(i);
                        }
                    }
                    formulaResult = formulaResult + "==";
                    for (i = 0; i < formula_right.length; i++) {
                        //console.log(formula.charAt(i));
                        if (formula_right.charAt(i) == "[") {
                            symbleFlag_right = true;
                            field = "";
                        } else if (formula_right.charAt(i) == "]") {
                            symbleFlag_right = false;
                            //console.log("field:"+field);
                            //console.log("field_name:"+record.get(field));
                            if (Ext.isEmpty(record.get(field)) || record.get(field) == 0) {
                                fieldArr.push(field);
                                value = parseFloat(0);
                                value = value.toFixed(2);
                                formulaResult = formulaResult + value.toString();
                            } else if (isNaN(record.get(field))) {
                                console.log('formulaPlu插件字段存在字符串，无法计算');
                                break;
                            } else {
                                fieldArr.push(field);
                                value = parseFloat(record.get(field));
                                value = value.toFixed(2);
                                formulaResult = formulaResult + value.toString();
                            }
                        }
                        //formulaResult = formulaResult + record.get(field).toString();
                        else if (!symbleFlag_right) {
                            formulaResult = formulaResult + formula_right.charAt(i);
                        } else if (symbleFlag_right) {
                            field = field + formula_right.charAt(i);
                        }
                    }
                    if (me.doStr(formulaResult)) {} else //console.log("正确");
                    {
                        errFlag = false;
                        var obj = {
                                uuid: record.get(uuId),
                                chkField: fieldArr
                            };
                        errArr.push(obj);
                    }
                }
            }
        });
        //console.log("formulaResult::::"+formulaResult);
        //console.log(record);
        //console.log(me.analysisFormula(formulaComponent[0]).toString(),record);
        var obj = {
                success: errFlag,
                errMsg: me.erroCode,
                panelID: me.panelID,
                errArr: errArr
            };
        console.log(obj);
        return obj;
    },
    //console.log(me.analysisFormula(formulaComponent[0]).toString());
    doStr: function(fn) {
        var Fn = Function;
        return new Fn("return " + fn)();
    }
});

/**
	 * @class Rs.ext.grid.plugin.GridAddNewRecordPlugin
	 * @extends Ext.plugin.Abstract
	 * @author LiGuangqiao
	 * 表格新增插件
	 */
Ext.define('Rs.ext.grid.plugin.GridAddNewRecordPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.addnewrecord',
    requires: 'Ext.button.Button',
    configs: {
        /**
		*@cfg {String} buttonIcon
		*新增按钮图标设置
		*/
        buttonIcon: "",
        /**
		*@cfg {String} buttonStyle
		*新增按钮样式设置
		*/
        buttonStyle: "",
        /**
		*@cfg {String} buttonText
		*新增按钮显示文本
		*/
        buttonText: "",
        /**
		*@cfg {boolean} buttonShow
		*是否切换至按钮新增模式
		*/
        addButtonShow: false,
        /**
		*@cfg {Object} defaultValue
		*新增行对应字段的默认值
		*/
        defaultValue: {},
        /**
		*@cfg {function} addNewRecord
		*新增逻辑函数
		*/
        addNewRecord: function(store, defaultValue) {},
        /**
		*@cfg {function} doCheckMustInputField
		*必输字段校验
		*true 必输字段已全部录入数据
		*false 必输字段中尚有未输字段
		*/
        doCheckMustInputField: function(store, mustInputFields, newRecords, me) {},
        /**
		*@cfg {array} addNewRecord
		*必输字段数组
		*/
        mustInputFields: []
    },
    //初始化插件
    init: function(grid) {
        var me = this;
        me.grid = grid;
        //me.autoAddNewRecord(me.defaultValue);
        if (me.addButtonShow) {
            me.initAddButton(me.defaultValue);
        } else {
            me.afterCheckMustInputFieldAddNewRecord(me.mustInputFields, me.defaultValue);
        }
    },
    //初始化新增按钮
    initAddButton: function(defaultValue) {
        var toolbar, pagingtoolbar,
            isPagingToolbarExist = false,
            me = this,
            grid = me.grid,
            dockedItemsArray = me.grid.getDockedItems();
        Ext.each(dockedItemsArray, function(dockItemObj) {
            if ("pagingtoolbar" === dockItemObj.xtype) {
                toolbar = dockItemObj;
                me.toolbar = toolbar;
                isPagingToolbarExist = true;
                me.isPagingToolbarExist = isPagingToolbarExist;
            }
        }, this);
        if (!(me.isPagingToolbarExist)) {
            Ext.each(dockedItemsArray, function(dockItemObj) {
                if ("toolbar" === dockItemObj.xtype) {
                    toolbar = dockItemObj;
                    me.toolbar = toolbar;
                } else {
                    me.toolbar = toolbar;
                }
            }, this);
        }
        var addbutton = new Ext.Button({
                text: me.buttonText,
                icon: me.buttonIcon,
                style: me.buttonStyle,
                handler: function() {
                    var store = grid.getStore();
                    me.addNewRecord(store, defaultValue);
                }
            });
        me.addbutton = addbutton;
        if (!Ext.isEmpty(me.toolbar)) {
            me.toolbar.add(addbutton);
        }
    },
    /**
	* 新增行逻辑
	* private
	* @method autoAddNewRecord
	* @params {Object} defaultValue 新增默认值
	*/
    addNewRecord: function(store, defaultValue) {
        var temp = {},
            addDefaultValue = Ext.Object.merge(temp, defaultValue);
        store.add(addDefaultValue);
    },
    /**
	* 返回新增按钮
	* private
	* @method getAddButton
	* @return {object} Button 返回新增按钮对象
	*/
    getAddButton: function() {
        var me = this;
        return me.addbutton;
    },
    /**
	* 数据加载自动添加新增行
	* private
	* @method autoAddNewRecord
	* @params {Object} defaultValue 新增默认值
	*/
    autoAddNewRecord: function(defaultValue) {
        var me = this,
            grid = me.grid,
            store = grid.getStore();
        store.on('load', function(store, records, options) {
            me.addNewRecord(store, defaultValue);
        }, me);
    },
    /**
	* 检测必输字段校验
	* private
	* @method doCheckMustInputField
	* @params {Object} mustInputFields 必输字段数组
	* @return {Boolean} true/false 返回必输字段完成标识
	*/
    doCheckMustInputField: function(store, mustInputFields, newRecords, me) {
        var checkFlag = true;
        if (!Ext.isEmpty(mustInputFields)) {
            Ext.each(newRecords, function(record, index, recordArray) {
                var data = record.data,
                    fieldNum = 0;
                for (fieldNum; fieldNum < mustInputFields.length; fieldNum++) {
                    var field = mustInputFields[fieldNum];
                    if (Ext.isEmpty(data[field])) {
                        checkFlag = false;
                        break;
                    }
                }
            }, me);
        } else {
            Ext.each(newRecords, function(record, index, recordArray) {
                var data = record.data;
                for (field in data) {
                    if (Ext.isEmpty(data[field])) {
                        checkFlag = false;
                        break;
                    }
                }
            }, me);
        }
        return checkFlag;
    },
    /**
	* 输完必输字段时自动添加新增行
	* private
	* @method afterCheckMustInputFieldAddNewRecord
	*/
    afterCheckMustInputFieldAddNewRecord: function(mustInputFields, defaultValue) {
        var cellEditPlugin, rowEditPlugin, checkFlag,
            me = this,
            isCellEditExist = false,
            isRowEditExist = false,
            grid = me.grid,
            store = grid.getStore(),
            gridPluginsArray = grid.getPlugins();
        Ext.each(gridPluginsArray, function(pluginObj) {
            if ("cellediting" === pluginObj.ptype) {
                cellEditPlugin = pluginObj;
                me.cellEditPlugin = cellEditPlugin;
                isCellEditExist = true;
            }
            if ("rowediting" === pluginObj.ptype) {
                rowEditPlugin = pluginObj;
                me.rowEditPlugin = rowEditPlugin;
                isRowEditExist = true;
            }
        }, this);
        if (!(isCellEditExist)) {
            me.cellEditPlugin = cellEditPlugin;
        }
        if (!(rowEditPlugin)) {
            me.rowEditPlugin = rowEditPlugin;
        }
        if (!Ext.isEmpty(me.cellEditPlugin)) {
            me.cellEditPlugin.on('edit', function(editPlugin, field) {
                var newRecords = store.getModifiedRecords();
                checkFlag = me.doCheckMustInputField(store, mustInputFields, newRecords, me);
                if (checkFlag) {
                    me.addNewRecord(store, defaultValue);
                }
            }, me);
        }
        if (!Ext.isEmpty(me.rowEditPlugin)) {
            me.rowEditPlugin.on('edit', function(editPlugin, field) {
                var newRecords = store.getModifiedRecords();
                checkFlag = me.doCheckMustInputField(store, mustInputFields, newRecords, me);
                if (checkFlag) {
                    me.addNewRecord(store, defaultValue);
                }
            }, me);
        }
    }
});

Ext.define('Rs.ext.grid.plugin.GridDataCheckRepeatPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.griddatacheckrepeat',
    requires: [],
    // 'Rs.ext.button.RsButton'
    configs: {
        /**
		*@cfg {array} fields
		*校验重复字段数组
		*/
        fields: [],
        /**
		*@cfg {String} panelID
		*面板id
		*/
        panelID: '',
        /**
		*@cfg {array} errCode
		*异常编码
		*/
        errCode: []
    },
    //初始化
    init: function() {},
    checkRepeat: function(panel) {
        var me = this;
        me.panel = panel;
        panelID = me.panelID;
        //异常面板
        fields = me.fields;
        //验证字段
        errCode = me.errCode;
        //异常编码
        errArr = [];
        //异常uuid和字段
        if (fields !== null && !Ext.isEmpty(fields)) {
            var ret = me.checkFieldsConfig(fields);
            if (ret) {
                var retv = me.checkRepeatDo(fields);
                var suc = retv.success;
                errArr = retv.errArr;
                retv = {
                    success: suc,
                    panelID: panelID,
                    errorMsg: errCode,
                    errArr: errArr
                };
                return retv;
            }
        }
    },
    //验重
    checkRepeatDo: function(fields) {
        var me = this,
            panelID = me.panelID,
            errorMsg = {},
            retVlaue = {},
            store = me.panel.getStore(),
            errArr = [],
            checkField = me.fields,
            pagesDataIndex, noRelationStaticDataObj, pageData, relationF;
        var keyIds = store.getModel().idProperty;
        var records = new Ext.util.MixedCollection();
        var isDynamicStore = Ext.getCmp(panelID).getStore().isDynamicStore,
            isCachedStore = Ext.getCmp(panelID).getStore().isCachedStore;
        //缓存store
        if (isDynamicStore || isCachedStore) {
            store = Ext.getCmp(panelID).getStore();
            if (store.isCachedStore) {
                noRelationStaticDataObj = store.noRelationStaticDataObj;
            } else {
                noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
            }
            relationF = false;
            if (Ext.Object.isEmpty(noRelationStaticDataObj)) {
                if (store.isCachedStore) {
                    noRelationStaticDataObj = store.relationStaticDataArry;
                } else {
                    noRelationStaticDataObj = store.cachedStore.relationStaticDataArry;
                }
                relationF = true;
            }
            pagesDataIndex = Object.keys(noRelationStaticDataObj);
            if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
                Ext.each(pagesDataIndex, function(pageDataIndex) {
                    pageData = noRelationStaticDataObj[pageDataIndex];
                    if (relationF) {
                        pageData = pageData.cachedPageData.data;
                    }
                    Ext.each(pageData, function(record, index) {
                        if (me.checkIsValidRec(record, checkField)) {
                            var joinKey = '';
                            Ext.each(fields, function(field, index, fields) {
                                var data = record.get(field);
                                joinKey += '?' + (Ext.isEmpty(data) ? '' : data);
                            }, this);
                            if (!Ext.isEmpty(joinKey) && records.containsKey(joinKey)) {
                                var msgs = errorMsg[joinKey] || [];
                                if (Ext.isEmpty(msgs)) {
                                    var row = (records.get(joinKey))[0] + 1;
                                    msgs.push(row);
                                    var keyValue = {};
                                    keyValue[keyIds] = (records.get(joinKey))[1];
                                    keyValue.checkField = checkField;
                                    errArr.push(keyValue);
                                }
                                msgs.push(index + 1);
                                errorMsg[joinKey] = msgs;
                                var keyValueT = {};
                                keyValueT[keyIds] = record.get(keyIds);
                                keyValueT.checkField = checkField;
                                errArr.push(keyValueT);
                            } else {
                                records.add(joinKey, [
                                    index,
                                    record.get(keyIds)
                                ]);
                            }
                        }
                    });
                });
            }
        } else {
            //普通store
            store.each(function(record, index, store) {
                if (me.checkIsValidRec(record, checkField)) {
                    var joinKey = '';
                    Ext.each(fields, function(field, index, fields) {
                        var data = record.get(field);
                        joinKey += '?' + (Ext.isEmpty(data) ? '' : data);
                    }, this);
                    if (!Ext.isEmpty(joinKey) && records.containsKey(joinKey)) {
                        var msgs = errorMsg[joinKey] || [];
                        if (Ext.isEmpty(msgs)) {
                            var row = (records.get(joinKey))[0] + 1;
                            msgs.push(row);
                            var keyValue = {};
                            keyValue[keyIds] = (records.get(joinKey))[1];
                            keyValue.checkField = checkField;
                            errArr.push(keyValue);
                        }
                        msgs.push(index + 1);
                        errorMsg[joinKey] = msgs;
                        var keyValueT = {};
                        keyValueT[keyIds] = record.get(keyIds);
                        keyValueT.checkField = checkField;
                        errArr.push(keyValueT);
                    } else {
                        records.add(joinKey, [
                            index,
                            record.get(keyIds)
                        ]);
                    }
                }
            }, this);
        }
        if (errArr.length > 0) {
            retVlaue = {
                success: false,
                errArr: errArr
            };
        } else {
            retVlaue = {
                success: true,
                errArr: errArr
            };
        }
        return retVlaue;
    },
    //检查验重字段有效性
    checkFieldsConfig: function(fields) {
        var me = this;
        store = me.panel.getStore();
        var sFields = store.getModel().fields.items;
        var allFields = [];
        if (Ext.isArray(fields)) {
            for (var i = 0; i < sFields.length; i++) {
                allFields[i] = sFields[i].getName();
            }
            for (var k in fields) {
                if (allFields.indexOf(fields[k]) == -1) {
                    // console.log('您的验重字段配置错误，请检查');
                    return false;
                }
            }
        } else {
            // console.log('您的验重字段配置错误，请检查');
            return false;
        }
        return true;
    },
    //检查数据行是否需要验重(当前行是非删除行，检查当前行验重字段是否输入值)
    checkIsValidRec: function(record, modelFieldsNames) {
        var me = this,
            validRawFlag = false,
            validFlag = false;
        if (record.dirty) {
            var modifieds = Object.keys(record.modified);
            Ext.each(modifieds, function(modified) {
                if (!Ext.isEmpty(record.data[modified])) {
                    validRawFlag = true;
                    return false;
                }
            });
        }
        //删除行不验证
        if (record.deleteFlag == 'D') {
            validRawFlag = false;
        } else {
            //原有行需要验证
            if (record.crudState == 'R' || record.crudState == 'U') {
                validRawFlag = true;
            }
        }
        //有效行再验证
        if (validRawFlag) {
            Ext.each(modelFieldsNames, function(modelFieldsName) {
                if (!Ext.isEmpty(record.data[modelFieldsName])) {
                    validFlag = true;
                    return false;
                }
            });
        }
        return validFlag;
    }
});

Ext.define('Rs.ext.grid.plugin.GridDataMustInputPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.griddatamustinput',
    requires: [],
    // 'Rs.ext.button.RsButton'
    configs: {
        /**
		*@cfg {array} fields
		*必输字段数组
		*/
        fields: [],
        /**
		*@cfg {String} panelID
		*面板id
		*/
        panelID: '',
        /**
		*@cfg {String} url
		*其它附加的验证条件，书写格式示例 '([record_man_name]=="小刚" || [record_man_name]=="小华") && ["aa","bb","cc"].includes([serve_type_name])'
		*/
        otherCdt: '',
        /**
		*@cfg {array} url
		*异常编码
		*/
        errCode: []
    },
    //初始化
    init: function() {},
    checkMustInput: function(panel) {
        var me = this;
        me.panel = panel , panelID = me.panelID , //异常面板
        fields = me.fields , //验证字段
        errCode = me.errCode , //异常编码
        errArr = [];
        //异常uuid和字段
        if (fields !== null && !Ext.isEmpty(fields)) {
            var ret = me.checkFieldsConfig(fields);
            if (ret) {
                var retv = me.checkMustInputDo(fields);
                var suc = retv.success;
                errArr = retv.errArr;
                retv = {
                    success: suc,
                    panelID: panelID,
                    errorMsg: errCode,
                    errArr: errArr
                };
                return retv;
            }
        }
    },
    //验证必输
    checkMustInputDo: function(fields) {
        var me = this,
            panelID = me.panelID,
            retVlaue = {},
            store = me.panel.getStore(),
            errUUID = [],
            errArr = [],
            keyIds = store.getModel().idProperty,
            otherCdt = me.otherCdt,
            //其它特定条件
            records = new Ext.util.MixedCollection(),
            pagesDataIndex, noRelationStaticDataObj, pageData, relationF;
        var isDynamicStore = Ext.getCmp(panelID).getStore().isDynamicStore,
            isCachedStore = Ext.getCmp(panelID).getStore().isCachedStore;
        //缓存store
        if (isDynamicStore || isCachedStore) {
            store = Ext.getCmp(panelID).getStore();
            if (store.isCachedStore) {
                noRelationStaticDataObj = store.noRelationStaticDataObj;
            } else {
                noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
            }
            relationF = false;
            if (Ext.Object.isEmpty(noRelationStaticDataObj)) {
                if (store.isCachedStore) {
                    noRelationStaticDataObj = store.relationStaticDataArry;
                } else {
                    noRelationStaticDataObj = store.cachedStore.relationStaticDataArry;
                }
                relationF = true;
            }
            pagesDataIndex = Object.keys(noRelationStaticDataObj);
            if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
                Ext.each(pagesDataIndex, function(pageDataIndex) {
                    pageData = noRelationStaticDataObj[pageDataIndex];
                    if (relationF) {
                        pageData = pageData.cachedPageData.data;
                    }
                    Ext.each(pageData, function(record) {
                        //条件拆分
                        if (me.checkIsValidRec(record)) {
                            Ext.each(fields, function(field, fIndex, fields) {
                                var joinKey = field;
                                var data = record.get(field);
                                if (otherCdt) {
                                    var flag = true;
                                    flag = me.checkComp(record, otherCdt);
                                    if (!flag) {
                                        //不符合附加条件，则可为空
                                        flag = false;
                                    }
                                    if (flag && Ext.isEmpty(data)) {
                                        //满足附加条件时，需必输 保留行号，UUID，空字段，空字段名称
                                        if (errUUID.indexOf(record.get(keyIds)) == -1) {
                                            errUUID.push(record.get(keyIds));
                                            var keyValue = {};
                                            keyValue[keyIds] = record.get(keyIds);
                                            keyValue.checkField = [
                                                joinKey
                                            ];
                                            errArr.push(keyValue);
                                        } else {
                                            for (var p in errArr) {
                                                if (errArr[p][keyIds] == record.get(keyIds)) {
                                                    errArr[p].checkField.push(joinKey);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (Ext.isEmpty(data)) {
                                        //没有附件条件，必输 保留行号，UUID，空字段，空字段名称
                                        if (errUUID.indexOf(record.get(keyIds)) == -1) {
                                            errUUID.push(record.get(keyIds));
                                            var keyValue = {};
                                            keyValue[keyIds] = record.get(keyIds);
                                            keyValue.checkField = [
                                                joinKey
                                            ];
                                            errArr.push(keyValue);
                                        } else {
                                            for (var p in errArr) {
                                                if (errArr[p][keyIds] == record.get(keyIds)) {
                                                    errArr[p].checkField.push(joinKey);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }, this);
                        }
                    });
                });
            }
        } else {
            //普通store
            store.each(function(record, index, store) {
                //条件拆分
                if (me.checkIsValidRec(record)) {
                    Ext.each(fields, function(field, fIndex, fields) {
                        var joinKey = field;
                        var data = record.get(field);
                        if (otherCdt) {
                            var flag = true;
                            flag = me.checkComp(record, otherCdt);
                            if (!flag) {
                                //不符合附加条件，则可为空
                                flag = false;
                            }
                            if (flag && Ext.isEmpty(data)) {
                                //满足附加条件时，需必输 保留行号，UUID，空字段，空字段名称
                                if (errUUID.indexOf(record.get(keyIds)) == -1) {
                                    errUUID.push(record.get(keyIds));
                                    var keyValue = {};
                                    keyValue[keyIds] = record.get(keyIds);
                                    keyValue.checkField = [
                                        joinKey
                                    ];
                                    errArr.push(keyValue);
                                } else {
                                    for (var p in errArr) {
                                        if (errArr[p][keyIds] == record.get(keyIds)) {
                                            errArr[p].checkField.push(joinKey);
                                            break;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (Ext.isEmpty(data)) {
                                //没有附件条件，必输 保留行号，UUID，空字段，空字段名称
                                if (errUUID.indexOf(record.get(keyIds)) == -1) {
                                    errUUID.push(record.get(keyIds));
                                    var keyValue = {};
                                    keyValue[keyIds] = record.get(keyIds);
                                    keyValue.checkField = [
                                        joinKey
                                    ];
                                    errArr.push(keyValue);
                                } else {
                                    for (var p in errArr) {
                                        if (errArr[p][keyIds] == record.get(keyIds)) {
                                            errArr[p].checkField.push(joinKey);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }, this);
                }
            });
        }
        if (errArr.length > 0) {
            retVlaue = {
                success: false,
                errArr: errArr
            };
        } else {
            retVlaue = {
                success: true,
                errArr: errArr
            };
        }
        return retVlaue;
    },
    //检查必输字段有效性
    checkFieldsConfig: function(fields) {
        var me = this,
            store = me.panel.getStore(),
            sFields = store.getModel().fields.items,
            allFields = [],
            myDataIndex = [];
        if (Ext.isArray(fields)) {
            for (var i = 0; i < sFields.length; i++) {
                allFields[i] = sFields[i].getName();
            }
            for (var k in fields) {
                if (allFields.indexOf(fields[k]) == -1) {
                    //console.log('您的必输字段配置错误，请检查');
                    return false;
                }
            }
        } else {
            //console.log('您的必输字段配置错误，请检查');
            return false;
        }
        if (me.panel.isXType('grid')) {
            Ext.each(me.panel.getColumns(), function(column) {
                if (!Ext.isEmpty(column.dataIndex)) {
                    myDataIndex.push(column.dataIndex);
                }
            });
        } else {
            myDataIndex = allFields;
        }
        me.myDataIndex = myDataIndex;
        //所有显示字段dataIndex
        return true;
    },
    //检查数据行是否需要验证必输(当前行是非删除行)
    checkIsValidRec: function(record) {
        var me = this,
            validFlag = false;
        if (record.dirty) {
            var modifieds = Object.keys(record.modified);
            Ext.each(modifieds, function(modified) {
                if (!Ext.isEmpty(record.data[modified])) {
                    validFlag = true;
                    return false;
                }
            });
        }
        //删除行不验证
        if (record.deleteFlag == 'D') {
            validFlag = false;
        } else {
            //原有行需要验证
            if (record.crudState == 'R' || record.crudState == 'U') {
                validFlag = true;
            }
        }
        return validFlag;
    },
    //字符串作为可执行代码运行
    doStr: function(fn) {
        var Fn = Function;
        //一个变量指向Function，防止有些前端编译工具报错
        return new Fn("return " + fn)();
    },
    //是否符合附加条件 1 =; 2 !=; 3 >; 4 <; 5 >=; 6 <=; 7 in ; 8 not in
    checkComp: function(record, otherCdt) {
        var re = this.strReplace(otherCdt, []);
        var sd = this.strFeArr;
        for (var i = 0; i < sd.length; i++) {
            otherCdt = otherCdt.replaceAll("[" + sd[i] + "]", '"' + record.get(sd[i]) + '"');
        }
        var retv = this.doStr(otherCdt);
        return retv;
    },
    strReplace: function(str, strFeArr) {
        strFeArr = strFeArr || [];
        var sr = str.substring(str.indexOf("[") + 1, str.indexOf("]"));
        if (str.indexOf("[") == -1 || str.indexOf("]") == -1) {
            return 1;
        }
        if (this.myDataIndex.indexOf(sr) == -1) {
            var ix = str.indexOf("]");
            var s2 = str.substring(ix + 1);
            return this.strReplace(s2, this.strFeArr);
        } else {
            var ix = str.indexOf("]");
            var s2 = str.substring(ix + 1);
            strFeArr.push(sr);
            this.strFeArr = strFeArr;
            return this.strReplace(s2, this.strFeArr);
        }
    }
});

/**
	 * @Rs.ext.grid.plugin.GridDataToolTipPlugin
	 * @extends Ext.plugin.Abstract
	 * @author LiGuangqiao
	 * 单元格数据放大镜
	 */
Ext.define('Rs.ext.grid.plugin.GridDataToolTipPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.datatooltip',
    requires: 'Ext.tip.ToolTip',
    configs: {
        fontSize: undefined,
        color: '',
        fontWeight: undefined
    },
    init: function(grid) {
        var me = this;
        me.grid = grid;
        me.grid.on('afterrender', function() {
            me.initDataToolTip(me.fontSize, me.fontWeight, me.color);
        });
    },
    initDataToolTip: function(size, weight, color) {
        var me = this,
            grid = me.grid,
            view = grid.getView(),
            tip = Ext.create('Ext.tip.ToolTip', {
                // The overall target element.
                target: view.el,
                // Each grid row causes its own separate show and hide.
                delegate: '.x-grid-cell-inner ',
                // Moving within the row should not hide the tip.
                trackMouse: true,
                // Render immediately so that tip.body can be referenced prior to the first show.
                renderTo: Ext.getBody(),
                listeners: {
                    // Change content dynamically depending on which element triggered the show.
                    beforeshow: function updateTipBody(tip) {
                        //console.log(tip.triggerElement.innerText);
                        //console.log(view.getRecord(tip.triggerElement));
                        tip.update('<p style="font-size:' + size + 'px;font-weight:' + weight + ';color:' + color + ';">' + tip.triggerElement.innerText + '</p>');
                    }
                }
            });
    }
});

/**
	 * @Rs.ext.grid.plugin.deleteHeadControlF
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 删除头记录检查明细状态控制插件
	 */
Ext.define('Rs.ext.grid.plugin.deleteHeadControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.deleteHead',
    requires: 'Ext.button.Button',
    configs: {
        itemIds: '',
        relatePanelId: '',
        checkFields: '',
        errorCode: ''
    },
    deleteHeadControl: function() {
        var me = this;
        var passFlag = true;
        var panelIds = me.config.relatePanelId.split(',');
        for (var i = 0; i < panelIds.length; i++) {
            if (Ext.getCmp(panelIds[i]).getStore().getCount() < 1 || Ext.getCmp(panelIds[i]).getStore().data.items[0].phantom) {
                
                continue;
            } else {
                passFlag = false;
                if (!Ext.isEmpty(me.config.errorCode)) {
                    Rs.Msg.messageAlert({
                        stateCode: me.config.errorCode
                    });
                }
                break;
            }
        }
        return passFlag;
    }
});

Ext.define('Rs.ext.grid.plugin.GridDeleteRecordPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.deleterecord',
    requires: 'Ext.button.Button',
    configs: {
        /**
		*@cfg {Object} style
		*删除按钮样式
		*/
        style: {},
        /**
		*@cfg {function} beforeDeleteRecord
		*删除前逻辑函数
		*true 自定义校验通过继续执行删除
		*false 自定义校验未通过停止删除
		*/
        beforeDeleteRecord: function(grid) {},
        /**
		*@cfg {function} deleteSuccess
		*删除成功逻辑函数
		*/
        deleteSuccess: function(grid, response) {},
        /**
		*@cfg {function} deleteFailure
		*删除失败逻辑函数
		*/
        deleteFailure: function(grid, response) {}
    },
    //初始化插件
    init: function(grid) {
        var me = this;
        me.grid = grid;
        me.initAddButton();
    },
    //初始化删除按钮
    initAddButton: function() {
        var me = this;
        grid = me.grid;
        toolbar;
        dockedItemsArray = me.grid.getDockedItems();
        addbutton = new Ext.Button({
            text: ' 删除 ',
            iconCls: 'x-fa fa-trash',
            style: me.style,
            handler: function() {
                me.beforeDelete();
            }
        });
        Ext.each(dockedItemsArray, function(dockItemObj) {
            if ("pagingtoolbar" === dockItemObj.xtype) {
                toolbar = dockItemObj;
                console.log(dockItemObj);
                me.toolbar = toolbar;
            }
        }, this);
        if (Ext.isEmpty(toolbar)) {
            Ext.each(dockedItemsArray, function(dockItemObj) {
                if ("toolbar" === dockItemObj.xtype) {
                    toolbar = dockItemObj;
                    me.toolbar = toolbar;
                }
            }, this);
        }
        me.addbutton = addbutton;
        me.toolbar.insert(13, addbutton);
    },
    //删除前置验证
    beforeDelete: function() {
        var me = this;
        grid = me.grid;
        store = grid.getStore();
        if (grid.getSelection().length == 0) {
            Rs.Msg.messageAlert({
                title: '提示',
                message: "提示：请先选择要删除的数据行 !"
            });
            return false;
        }
        var modifyRecords = grid.getStore().getModifiedRecords();
        //是否有修改新增行
        if (!Ext.isEmpty(modifyRecords)) {
            if (!(modifyRecords.length == 1 && modifyRecords[0].crudState == 'C' && modifyRecords[0].dirty == false)) {
                Rs.Msg.messageAlert({
                    title: '提示',
                    message: '您有数据尚未保存，是否继续删除操作？',
                    buttons: Ext.MessageBox.OKCANCEL,
                    buttonText: {
                        ok: '删除',
                        cancel: '不删除'
                    }
                }, function(buttonId) {
                    if (buttonId === 'ok') {
                        me.doDeleteAction(grid);
                    } else {
                        return false;
                    }
                });
            } else {
                me.confirmDelete();
            }
        } else {
            me.confirmDelete();
        }
    },
    //删除前确认提示
    confirmDelete: function() {
        var me = this;
        Rs.Msg.messageAlert({
            title: '提示',
            message: '您确定要删除选中的记录吗？',
            buttons: Ext.MessageBox.OKCANCEL,
            buttonText: {
                ok: '删除',
                cancel: '不删除'
            }
        }, function(buttonId) {
            if (buttonId == 'ok') {
                me.doDeleteAction(grid);
            } else {
                return false;
            }
        });
    },
    //删除操作
    doDeleteAction: function(grid) {
        var me = this;
        url = grid.getStore().model.proxy.url;
        store = grid.getStore();
        requestData = new Array();
        params = {};
        selectionRecords = grid.getSelection();
        //删除前自定义方法执行
        var deleteFlag = Ext.isEmpty(me.beforeDeleteRecord) ? true : me.beforeDeleteRecord(grid);
        if (!deleteFlag) {
            return false;
        }
        params.COMPANYCODE = typeof (USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
        Ext.Array.each(selectionRecords, function(record, index, countriesItSelf) {
            if (record.crudState != 'C') {
                requestData.push(record.data);
            }
        });
        //删除新增行
        if (Ext.isEmpty(requestData)) {
            store.reload();
            return;
        }
        //删除数据请求
        Ext.Ajax.request({
            url: url,
            async: false,
            params: params,
            jsonData: JSON.stringify(requestData),
            method: 'DELETE',
            dataType: "json",
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    if (!Ext.isEmpty(me.deleteSuccess)) {
                        me.deleteSuccess(grid, response);
                    } else {
                        store.reload();
                        Rs.Msg.messageAlert({
                            title: '提示',
                            message: obj.mesg
                        });
                    }
                } else {
                    if (!Ext.isEmpty(me.deleteFailure)) {
                        me.deleteFailure(grid, response);
                    } else {
                        Rs.Msg.messageAlert({
                            title: '提示',
                            message: obj.mesg,
                            model: true
                        });
                    }
                }
            },
            failure: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (!Ext.isEmpty(me.deleteFailure)) {
                    me.deleteFailure(grid, response);
                } else {
                    Rs.Msg.messageAlert({
                        title: '提示',
                        message: obj.message,
                        model: true
                    });
                }
                return false;
            }
        });
    }
});

Ext.define('Rs.ext.grid.plugin.GridSaveRecordPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.saverecord',
    requires: [
        'Rs.ext.button.RsButton'
    ],
    configs: {
        /**
		*@cfg {Object} style
		*保存按钮样式
		*/
        style: {},
        /**
		*@cfg {object} mustInputFields
		*必输字段数组
		*/
        mustInputFields: {},
        /**
		*@cfg {array} checkRepeatFields
		*校验重复字段数组
		*/
        checkRepeatFields: [],
        /**
		*@cfg {String} url
		*请求路径
		*/
        url: '',
        /**
		*@cfg {function} cunstomCheckRule
		*自定义验证
		*true 自定义校验通过继续执行保存
		*false 自定义校验未通过停止保存
		*/
        cunstomCheckRule: function(grid) {},
        /**
		*@cfg {function} saveFailure
		*保存失败函数
		*/
        saveFailure: function(grid, response) {},
        /**
		*@cfg {function} saveFailure
		*删除失败函数
		*/
        deleteFailure: function(grid, response) {},
        /**
		*@cfg {function} insertFailure
		*新增失败函数
		*/
        insertFailure: function(grid, response) {},
        /**
		*@cfg {function} insertFailure
		*保存成功函数
		*/
        saveSuccess: function(grid, response) {}
    },
    //初始化插件
    init: function(grid) {
        var me = this;
        me.grid = grid;
        me.initAddButton();
        if (me.mustInputFields !== null) {
            me.afterCheckMustInputFieldChangColor(me.mustInputFields);
        }
        me.addNewRecord();
    },
    //初始化保存按钮
    initAddButton: function() {
        var me = this,
            grid = me.grid,
            toolbar,
            dockedItemsArray = me.grid.getDockedItems();
        var style = {},
            //background:'#fff',
            //background:'-webkit-linear-gradient(top, #fff, #f9f9f9 48%, #e2e2e2 52%, #e7e7e7)'
            style = Ext.Object.merge(style, me.style),
            addbutton = Ext.create('Rs.ext.button.RsButton', {
                text: ' 保存 ',
                iconCls: 'saveAction-button-item',
                style: style,
                iconAlign: "left",
                handler: function() {
                    me.doSave();
                }
            });
        Ext.each(dockedItemsArray, function(dockItemObj) {
            if ("pagingtoolbar" === dockItemObj.xtype) {
                toolbar = dockItemObj;
                me.toolbar = toolbar;
            }
        }, this);
        if (!Ext.isEmpty(me.toolbar) && me.toolbar.xtype == 'pagingtoolbar') {
            //if(!Ext.isEmpty(toolbar.xtype) && toolbar.xtype == 'pagingtoolbar'){
            me.addbutton = addbutton;
            var leftSpace = {
                    xtype: 'tbspacer',
                    flex: 1
                };
            var rightSpace = {
                    xtype: 'tbspacer',
                    flex: 1
                };
            me.toolbar.insert(11, leftSpace);
            me.toolbar.insert(12, addbutton);
        } else {
            Ext.each(dockedItemsArray, function(dockItemObj) {
                if ("toolbar" === dockItemObj.xtype) {
                    toolbar = dockItemObj;
                    me.toolbar = toolbar;
                }
            }, this);
            me.addbutton = addbutton;
            me.toolbar.add(addbutton);
        }
    },
    //保存
    doSave: function() {
        var me = this,
            grid = me.grid,
            store = grid.getStore(),
            errorMsgs = "",
            errorFlag = true,
            errorResponse = {},
            checkFiedls = me.getNeedCheckFiedls();
        me.checkFiedls = checkFiedls , errorFlag = me.checkModifieData(store, checkFiedls);
        if (errorFlag) {
            Rs.Msg.messageAlert({
                title: '提示',
                message: '数据没有发生变化，不需要保存'
            });
            return false;
        }
        //校验必输
        if (!Ext.isEmpty(me.mustInputFields)) {
            errorMsgs = me.checkMustInputField(me.mustInputFields, store);
            if (!Ext.isEmpty(errorMsgs)) {
                Rs.Msg.messageAlert({
                    title: '提示',
                    message: errorMsgs.join('<br/>')
                });
                return;
            }
        }
        //校验重复
        if (!Ext.isEmpty(me.checkRepeatFields)) {
            errorMsgs = me.checkRepeatFieldsF(me.checkRepeatFields);
            if (!Ext.isEmpty(errorMsgs)) {
                Rs.Msg.messageAlert({
                    title: '提示',
                    message: errorMsgs.join('<br/>')
                });
                return;
            }
        }
        //执行自定义验证
        if (!Ext.isEmpty(me.cunstomCheckRule)) {
            errorFlag = me.cunstomCheckRule(grid);
            if (!errorFlag) {
                return false;
            }
        }
        //删除操作
        errorFlag = me.doDeleteAction(grid);
        if (!errorFlag) {
            return false;
        }
        //insert操作
        errorFlag = me.doInsertAction(grid);
        if (!errorFlag) {
            return false;
        }
        //update操作
        errorFlag = me.doUpdateAction(grid);
        if (!errorFlag) {
            return false;
        }
        //删除操作的数据行
        Ext.each(store.getModifiedRecords(), function(modifiedRecord) {
            store.remove(modifiedRecord);
        }, this);
        if (!Ext.isEmpty(me.needDeleteRecords)) {
            store.remove(me.needDeleteRecords);
        }
        //保存后自定义方法
        if (!Ext.isEmpty(me.saveSuccess)) {
            errorFlag = me.saveSuccess(grid);
            if (!errorFlag) {
                return false;
            }
        }
        store.reload();
        return;
    },
    //验证是否存在修改或新增删除的数据
    checkModifieData: function(store, checkFiedls) {
        var me = this,
            modifiedRecords = store.getModifiedRecords(),
            modifiedFlag = false,
            newRecord = [],
            emptyCount = 0;
        store.each(function(record) {
            if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
                emptyCount += 1;
            }
        }, this);
        if (emptyCount > 0) {
            return false;
        }
        if (Ext.isEmpty(modifiedRecords)) {
            return true;
        } else {
            Ext.each(modifiedRecords, function(modifiedRecord) {
                if (emptyCount > 0) {
                    return false;
                }
                //modifiedFlag = me.checkIsEmptyRecord(modifiedRecord);
                modifiedFlag = me.checkIsEmptyRecordPlus(modifiedRecord, checkFiedls);
                if (!modifiedFlag) {
                    emptyCount += 1;
                    return false;
                }
            }, this);
            if (modifiedFlag) {
                return true;
            } else {
                return false;
            }
        }
    },
    // 必输字段校验
    checkMustInputField: function(mustInputFields, store) {
        var me = this,
            errorsMsg = [],
            errorrows = {},
            modifiedFlag = false,
            modifyRecords = store.getModifiedRecords(),
            modifyData = new Array(),
            mustInputFields = me.mustInputFields,
            columns = me.getColumnsAttribute(),
            modelFieldsName = columns.fiedNameS,
            otherColumnsCount = columns.otherColumnsCount;
        Ext.each(modifyRecords, function(modifiedRecord) {
            modifiedFlag = me.checkIsEmptyRecordPlus(modifiedRecord, me.checkFiedls);
            if (!modifiedFlag) {
                modifyData.push(modifiedRecord);
            }
        }, this);
        Ext.each(modifyData, function(record, index, modifyRecords) {
            data = record.data;
            for (var field in mustInputFields) {
                if (Ext.isEmpty(data[field])) {
                    //如果主键没有输入  增加对number控件的支持，number无法直接使用trim
                    if (!errorrows[field]) {
                        errorrows[field] = [];
                    }
                    var row = this.grid.store.indexOf(record) + 1;
                    var col = modelFieldsName.indexOf(field);
                    me.grid.view.getCell(row - 1, col + otherColumnsCount).style.backgroundColor = '#ffdfd7';
                    errorrows[field].push(row);
                }
            }
        }, this);
        for (var property in errorrows) {
            if (!Ext.isEmpty(errorrows[property])) {
                var message = "第" + errorrows[property].sort(function(v1, v2) {
                        if (v1 > v2) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }).join('、') + "行" + mustInputFields[property] + "不能为空";
                errorsMsg.push(message);
            }
        }
        return errorsMsg;
    },
    //校验重复字段
    checkRepeatFieldsF: function(checkRepeatFields) {
        var me = this,
            errorMsg = {},
            modifyRecords = [],
            store = me.grid.getStore(),
            errors = [],
            columns = me.getColumnsAttribute(),
            modelFieldsName = columns.fiedNameS,
            otherColumnsCount = columns.otherColumnsCount,
            columsCount = columns.columsCount;
        var records = new Ext.util.MixedCollection();
        store.each(function(record, index, store) {
            if (!me.checkIsEmptyRecordPlus(record, me.checkFiedls)) {
                var joinKey = '';
                if (Ext.isArray(checkRepeatFields)) {
                    Ext.each(checkRepeatFields, function(field, index, checkRepeatFields) {
                        var data = record.get(field);
                        joinKey += '?' + (Ext.isEmpty(data) ? '' : data);
                    }, this);
                    if (!Ext.isEmpty(joinKey) && records.containsKey(joinKey)) {
                        var msgs = errorMsg[joinKey] || [];
                        if (Ext.isEmpty(msgs)) {
                            var row = records.get(joinKey) + 1;
                            msgs.push(row);
                        }
                        msgs.push(index + 1);
                        errorMsg[joinKey] = msgs;
                    } else {
                        records.add(joinKey, index);
                    }
                } else {
                    errors.push('您的验重配置错误，请检查！');
                }
            }
        }, this);
        store.each(function(record, index, store) {
            for (var i = 0; i < columsCount - 1; i++) {
                me.grid.view.getCell(record, i).style.backgroundColor = '';
            }
        });
        for (var p in errorMsg) {
            var rows = errorMsg[p].sort(function(v1, v2) {
                    if (v1 > v2) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
            Ext.each(checkRepeatFields, function(field) {
                var col = modelFieldsName.indexOf(field);
                for (var i = 0; i < rows.length; i++) {
                    me.grid.view.getCell(rows[i] - 1, col + otherColumnsCount).style.backgroundColor = '#ffdfd7';
                }
            });
            var msg = '第' + rows.join('、') + "行数据重复！";
            errors.push(msg);
        }
        return errors;
    },
    //监听单元格edit事件，必输字段输入后去掉背景色
    afterCheckMustInputFieldChangColor: function(mustInputFields) {
        var editPlugin,
            me = this,
            gridPluginsArray = me.grid.getPlugins();
        Ext.each(gridPluginsArray, function(pluginObj) {
            if ("cellediting" === pluginObj.ptype) {
                editPlugin = pluginObj;
                var gridEditPlugin = editPlugin;
            }
            if ("rowediting" === pluginObj.ptype) {
                editPlugin = pluginObj;
                var gridEditPlugin = editPlugin;
            }
        }, this);
        if (!Ext.isEmpty(me.editPlugin)) {
            gridEditPlugin.on('validateedit', function(editPlugin, context) {
                var mustInputCol = [],
                    data = context.record.data,
                    otherCol = 0,
                    columns = me.getColumnsAttribute(),
                    modelFieldsName = columns.fiedNameS,
                    otherColumnsCount = columns.otherColumnsCount;
                for (var field in mustInputFields) {
                    if (!data[field] || Ext.isEmpty(data[field] + "")) {
                        var col = modelFieldsName.indexOf(field) + otherColumnsCount;
                        if (me.grid.view.getCell(context.record, col).style.backgroundColor == '#ffdfd7' || me.grid.view.getCell(context.record, col).style.backgroundColor == 'rgb(255, 223, 215)') {
                            mustInputCol.push(col);
                        }
                    }
                }
                context.mustInputCol = mustInputCol;
            }, me);
            gridEditPlugin.on('edit', function(editPlugin, context) {
                if (!Ext.isEmpty(context.mustInputCol)) {
                    Ext.each(context.mustInputCol, function(col) {
                        me.grid.view.getCell(context.record, col).style.backgroundColor = '#ffdfd7';
                    });
                }
                if (!Ext.isEmpty(context.cell.style.backgroundColor)) {
                    if (!Ext.isEmpty(context.value)) {
                        context.cell.style.backgroundColor = '';
                    }
                }
                if (!Ext.isEmpty(context.record.deleteFlag)) {
                    context.row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src = '../../../resources/images/del_press.png';
                }
            }, me);
        }
    },
    //执行insert操作
    doInsertAction: function(grid) {
        var me = this,
            store = grid.getStore(),
            url = store.proxy.url,
            params = {},
            requestData = new Array(),
            newRecords = store.getNewRecords(),
            imptyFlag = false,
            errorFlag = true,
            needInsertRecords = new Array();
        Ext.each(newRecords, function(newRecord) {
            imptyFlag = me.checkIsEmptyRecordPlus(newRecord, me.checkFiedls);
            if (!imptyFlag) {
                needInsertRecords.push(newRecord);
                requestData.push(newRecord.data);
            }
        }, this);
        if (Ext.isEmpty(requestData)) {
            return true;
        }
        me.needInsertRecords = needInsertRecords;
        params.COMPANYCODE = typeof (USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
        params.personId = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERID;
        params.personCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERCODE;
        params.personName = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERNAME;
        if (!Ext.isEmpty(me.url)) {
            url = me.url;
        }
        var storage = Ext.util.LocalStorage.get('rslocal');
        token = 'Bearer ' + storage.getItem("token");
        Ext.Ajax.request({
            url: url,
            async: false,
            params: params,
            jsonData: JSON.stringify(requestData),
            method: 'POST',
            headers: {
                Authorization: token
            },
            dataType: "json",
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    errorFlag = true;
                } else {
                    if (!Ext.isEmpty(me.insertFailure)) {
                        me.insertFailure(me.grid, response);
                    } else {
                        Rs.Msg.messageAlert({
                            title: '提示',
                            message: obj.message,
                            modal: true,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                    errorFlag = false;
                }
            },
            failure: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (!Ext.isEmpty(me.insertFailure)) {
                    me.insertFailure(me.grid, response);
                } else {
                    Rs.Msg.messageAlert({
                        title: '提示',
                        message: obj.message,
                        modal: true,
                        buttons: Ext.MessageBox.OK
                    });
                }
                errorFlag = false;
            }
        });
        return errorFlag;
    },
    //执行update操作
    doUpdateAction: function(grid) {
        var me = this,
            store = grid.getStore(),
            url = store.proxy.url,
            params = {},
            requestData = new Array(),
            modifiedRecords = store.getModifiedRecords(),
            errorFlag = true,
            needSaveRecords = new Array();
        Ext.each(modifiedRecords, function(modifiedRecord) {
            if (!Ext.isEmpty(modifiedRecord.deleteFlag) && modifiedRecord.deleteFlag == 'D') {} else if (modifiedRecord.crudState == 'U') {
                var fiedNameS = modifiedRecord.modified,
                    updateData = {};
                updateData[store.model.idProperty] = modifiedRecord.id;
                for (var i = 0; i < Object.keys(fiedNameS).length; i++) {
                    var fieldName = Object.keys(fiedNameS)[i];
                    updateData[fieldName] = modifiedRecord.data[fieldName];
                }
                requestData.push(updateData);
                needSaveRecords.push(modifiedRecord);
            }
        }, this);
        if (Ext.isEmpty(requestData)) {
            return true;
        }
        me.needSaveRecords = needSaveRecords;
        params.COMPANYCODE = typeof (USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
        params.personId = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERID;
        params.personCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERCODE;
        params.personName = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERNAME;
        if (!Ext.isEmpty(me.url)) {
            url = me.url;
        }
        var storage = Ext.util.LocalStorage.get('rslocal');
        token = 'Bearer ' + storage.getItem("token");
        Ext.Ajax.request({
            url: url,
            async: false,
            params: params,
            jsonData: JSON.stringify(requestData),
            method: 'PUT',
            headers: {
                Authorization: token
            },
            dataType: "json",
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    errorFlag = true;
                } else {
                    if (!Ext.isEmpty(me.saveFailure)) {
                        me.saveFailure(me.grid, response);
                    } else {
                        Rs.Msg.messageAlert({
                            title: '提示',
                            message: obj.message,
                            modal: true,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                    errorFlag = false;
                }
            },
            failure: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (!Ext.isEmpty(me.saveFailure)) {
                    me.saveFailure(me.grid, response);
                } else {
                    Rs.Msg.messageAlert({
                        title: '提示',
                        message: obj.message,
                        modal: true,
                        buttons: Ext.MessageBox.OK
                    });
                }
                errorFlag = false;
            }
        });
        return errorFlag;
    },
    //执行Delete操作
    doDeleteAction: function(grid) {
        var me = this,
            store = grid.getStore(),
            url = store.proxy.url,
            params = {},
            requestData = new Array(),
            errorFlag = true,
            needDeleteRecords = new Array();
        store.each(function(record) {
            if (!Ext.isEmpty(record.deleteFlag) && record.deleteFlag == 'D') {
                requestData.push(record.data);
                needDeleteRecords.push(record);
            }
        }, this);
        if (Ext.isEmpty(requestData)) {
            return true;
        }
        me.needDeleteRecords = needDeleteRecords;
        params.COMPANYCODE = typeof (USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
        if (!Ext.isEmpty(me.url)) {
            url = me.url;
        }
        var storage = Ext.util.LocalStorage.get('rslocal');
        token = 'Bearer ' + storage.getItem("token");
        Ext.Ajax.request({
            url: url,
            async: false,
            params: params,
            jsonData: JSON.stringify(requestData),
            method: 'DELETE',
            dataType: "json",
            headers: {
                Authorization: token
            },
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    errorFlag = true;
                } else {
                    if (!Ext.isEmpty(me.deleteFailure)) {
                        me.deleteFailure(me.grid, response);
                    } else {
                        Rs.Msg.messageAlert({
                            title: '提示',
                            message: obj.message,
                            modal: true,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                    errorFlag = false;
                }
            },
            failure: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (!Ext.isEmpty(me.deleteFailure)) {
                    me.deleteFailure(me.grid, response);
                } else {
                    Rs.Msg.messageAlert({
                        title: '提示',
                        message: obj.message,
                        modal: true,
                        buttons: Ext.MessageBox.OK
                    });
                }
                errorFlag = false;
            }
        });
        return errorFlag;
    },
    //验证某一行是否为修改行
    checkIsEmptyRecord: function(record) {
        var emptyFlag = true,
            data = Ext.Object.getValues(record.data);
        if (record.crudState == 'U') {
            emptyFlag = false;
            return emptyFlag;
        }
        for (var i = 1; i < data.length; i++) {
            if (!Ext.isEmpty(data[i])) {
                emptyFlag = false;
                return emptyFlag;
            }
        }
        return emptyFlag;
    },
    //获取colums中dataindex，工具列条数，显示列数
    getColumnsAttribute: function() {
        var me = this,
            gridcolumns = me.grid.getColumns(),
            columns = {},
            modelFieldsName = new Array(),
            otherCol = 0,
            columsCount = 0;
        Ext.each(gridcolumns, function(column) {
            if (column.xtype != 'checkcolumn' && column.xtype != 'rownumberer' && column.xtype != 'actioncolumn' && !column.hidden) {
                modelFieldsName.push(column.dataIndex);
            }
            if (column.xtype == 'checkcolumn' || column.xtype == 'rownumberer' || column.xtype == 'actioncolumn') {
                otherCol += 1;
            }
            if (!column.hidden) {
                columsCount += 1;
            }
        });
        columns.fiedNameS = modelFieldsName;
        columns.otherColumnsCount = otherCol;
        columns.columsCount = columsCount;
        return columns;
    },
    checkIsEmptyRecordPlus: function(record, modelFieldsNames) {
        var me = this,
            emptyFlag = true;
        if (record.crudState == 'U') {
            emptyFlag = false;
            return emptyFlag;
        }
        Ext.each(modelFieldsNames, function(modelFieldsName) {
            if (!Ext.isEmpty(record.data[modelFieldsName])) {
                emptyFlag = false;
                return emptyFlag;
            }
        });
        return emptyFlag;
    },
    getNeedCheckFiedls: function() {
        var me = this,
            columns = me.getColumnsAttribute(),
            modelFieldsNames = columns.fiedNameS;
        if (Ext.isEmpty(me.grid.getStore().defaultFieldValue)) {
            return modelFieldsNames;
        }
        defaultFields = Object.keys(me.grid.getStore().defaultFieldValue);
        Ext.each(defaultFields, function(defaultField) {
            var col = modelFieldsNames.indexOf(defaultField);
            modelFieldsNames.splice(col, 1);
        });
        return modelFieldsNames;
    },
    addNewRecord: function() {
        var me = this,
            store = me.grid.getStore();
        store.on('load', function(store, records, options) {
            if (store.data.length == 0) {
                if (Ext.isEmpty(store.defaultFieldValue)) {
                    store.add({});
                } else {
                    var addData = JSON.parse(JSON.stringify(store.defaultFieldValue));
                    store.add(addData);
                }
            }
        }, me);
    }
});

Ext.define('Rs.ext.grid.plugin.RelateStateControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.relatestatecontrolf',
    //requires:'Ext.button.Button',
    configs: {
        /**
		*@cfg {string} panelId
		*关联控件id
		*/
        itemIds: '',
        /**
		*@cfg {string} panelId
		*关联面板ID
		*/
        relatePanelId: '',
        /**
		*@cfg {string} checkFields
		*关联字段
		*/
        relateFields: '',
        /**
		*@cfg {string} targetValues
		*业务字段
		*/
        checkFields: '',
        /**
		*@cfg {string} targetValues
		*目标值
		*/
        targetValues: '',
        /**
		*@cfg {string} controlRule
		*空值规则
		*/
        controlRule: '',
        /**
         *@cfg {string} allRowEnable
         *defaultValue:false
         *是否控制该行全部数据列
         */
        allRowEnable: false,
        /**
		*@cfg {string} erroCode
		*错误信息码
		*/
        erroCode: ''
    },
    //初始化插件
    init: function(grid) {
        var me = this,
            editPlugin,
            gridPluginsArray = grid.getPlugins();
        //console.log(grid.xtype);
        if (grid.xtype == 'gridpanel') {
            me.gridFunction(gridPluginsArray, editPlugin);
        }
    },
    //xtype为grid
    gridFunction: function(gridPluginsArray, editPlugin) {},
    // var me = this;
    // Ext.each(gridPluginsArray,function(pluginObj){
    // if("cellediting"===pluginObj.ptype){
    // editPlugin = pluginObj;
    // }
    // if("rowediting"===pluginObj.ptype){
    // editPlugin = pluginObj;
    // }
    // },this);
    // editPlugin.on('beforeedit',function(editPlugin,context){
    // return me.relateStateControl(editPlugin,context.record,context.field);
    // },me);
    relateStateControl: function(editPlugin, record, field) {
        var me = this;
        var returnFlag = false;
        //var record = context.record;
        //var field = context.field;
        var itemIdArray = new Array();
        itemIdArray = me.itemIds.split(",");
        var fieldArray = new Array();
        fieldArray = field.split(",");
        var checkFieldsArray = new Array();
        checkFieldsArray = me.checkFields.split(",");
        var targetValuesArray = new Array();
        targetValuesArray = me.targetValues.split(",");
        var controlRuleArray = new Array();
        controlRuleArray = me.controlRule.split(",");
        var relateFieldsArray = new Array();
        relateFieldsArray = me.relateFields.split(",");
        //console.log(relateFieldsArray);
        if (targetValuesArray.length != checkFieldsArray.length) {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
        if (targetValuesArray.length != controlRuleArray.length) {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
        console.log(fieldArray);
        var clickFieldFlag = false;
        if (me.allRowEnable) {
            clickFieldFlag = true;
        } else {
            for (j = 0; j < itemIdArray.length; j++) {
                for (i = 0; i < fieldArray.length; i++) {
                    if (fieldArray[i] == itemIdArray[j]) {
                        clickFieldFlag = true;
                    }
                }
            }
        }
        if (clickFieldFlag) {
            for (j = 0; j < targetValuesArray.length; j++) {
                //获取目标行关联字段的值
                var relateFieldsValueArray = new Array();
                for (i = 0; i < relateFieldsArray.length; i++) {
                    relateFieldsValueArray[i] = record.get(relateFieldsArray[i]);
                }
                //如果是新增行，则返回false
                var newRecordFlag = true;
                for (i = 0; i < relateFieldsValueArray.length; i++) {
                    if (!isNaN(relateFieldsValueArray[i]) || !Ext.isEmpty(relateFieldsValueArray[i])) {
                        newRecordFlag = false;
                    }
                }
                if (newRecordFlag) {
                    return true;
                }
                var findFlag;
                var value;
                //符合关联条件的记录数
                var count = 0;
                //业务字段的值
                var checkValue;
                //console.log(Ext.getCmp(me.relatePanelId).getStore());
                Ext.getCmp(me.relatePanelId).getStore().each(function(record) {
                    //console.log(record);
                    //console.log(record.get("vehicle_name"));
                    findFlag = true;
                    for (z = 0; z < relateFieldsArray.length; z++) {
                        if (record.get(relateFieldsArray[z]) != undefined) {
                            value = record.get(relateFieldsArray[z]).toString();
                            if (value != relateFieldsValueArray[z]) {
                                findFlag = false;
                            }
                        } else {
                            findFlag = false;
                        }
                    }
                    //if(record.crudState==='D'){
                    //	deleteRecordsData.push(record.data);
                    //}
                    if (findFlag) {
                        //console.log(record);
                        //console.log(record.get("SYS_CODE"));
                        checkValue = record.get(checkFieldsArray[j]).toString();
                        count = count + 1;
                    }
                });
                //console.log(1);
                if (count == 0) {
                    Ext.Msg.alert('提示', '未找到关联的记录，请重新定义关联字段');
                    return false;
                } else if (count > 1) {
                    return false;
                    Ext.Msg.alert('提示', '找到多个关联的记录，请重新定义关联字段');
                }
                //console.log(count);
                //var checkValue = record.get(checkFieldsArray[j]);
                var targetValue = targetValuesArray[j].toString();
                var controlRule = controlRuleArray[j];
                //console.log(checkValue);
                //console.log(targetValue);
                //console.log(controlRule);
                if (controlRule == '>') {
                    if (checkValue > targetValue) {
                        returnFlag = true;
                    }
                } else if (controlRule == '<') {
                    if (checkValue < targetValue) {
                        returnFlag = true;
                    }
                } else if (controlRule == '>=') {
                    if (checkValue >= targetValue) {
                        returnFlag = true;
                    }
                } else if (controlRule == '<=') {
                    if (checkValue <= targetValue) {
                        returnFlag = true;
                    }
                } else if (controlRule == '=') {
                    if (checkValue == targetValue) {
                        returnFlag = true;
                    }
                } else if (controlRule == '<>' || controlRule == '!=') {
                    if (checkValue != targetValue) {
                        returnFlag = true;
                    }
                } else {}
            }
            //Ext.Msg.alert('提示','控制规则配置错误');
            if (returnFlag) {
                if (!Ext.isEmpty(me.erroCode)) {
                    Rs.Msg.messageAlert({
                        stateCode: me.erroCode
                    });
                }
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
});

Ext.define('Rs.ext.grid.plugin.RowDenormaliserPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.row-denormaliser-plugin',
    init: function(grid) {
        grid.on('afterrender', function(thisGrid) {
            var fieldsArray = [],
                oldColumnArray = [],
                newColumnArray = [],
                tempColumnArray = [],
                columnModelConfig = {},
                t = {};
            var data = [
                    {
                        dataIndex: "nodeType",
                        text: "wff",
                        itemId: "wtf"
                    },
                    {
                        dataIndex: "seqNo",
                        text: "qqq",
                        itemId: "qqq"
                    }
                ];
            //获取原有的列和模型字段
            Ext.each(thisGrid.getStore().getModel().getFields(), function(obj, index, itself) {
                var tempField = {};
                if (obj.name !== "id") {
                    Ext.Object.each(obj, function(key, value, myself) {
                        tempField[key] = value;
                    });
                    fieldsArray.push(tempField);
                }
            });
            Ext.each(thisGrid.getColumns(), function(column) {
                var tempColumn = {};
                Ext.Object.each(column.getInitialConfig(), function(key, value, myself) {
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
            Ext.each(data, function(dataObj, index, itself) {
                var newColumn = {};
                Ext.Object.merge(newColumn, columnModelConfig);
                Ext.Object.merge(newColumn, dataObj);
                Ext.Object.each(dataObj, function(key, value, myself) {
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
            newColumnArray = Ext.Array.merge(tempColumnArray, oldColumnArray);
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

Ext.define('Rs.ext.panel.plugin.SaveDraftPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.savedraftplugin',
    requires: [
        'Ext.toolbar.Toolbar',
        'Rs.ext.button.RsButton'
    ],
    configs: {
        /**
		*@cfg {Array} panelIds
		*面板id数组
		*/
        panelIds: [],
        /**
		*@cfg {String} buttonText
		*按钮文字
		*/
        buttonText: '',
        /**
		*@cfg {String} buttonIcon
		*按钮图标样式
		*/
        buttonIcon: '',
        /**
		*@cfg {Object} buttonStyle
		*按钮样式
		*/
        buttonStyle: {},
        /**
		*@cfg {String} url
		*请求路径
		*/
        url: '',
        /**
		*@cfg {String} personCodeField
		*人员编码字段
		*/
        personCodeField: '',
        /**
		*@cfg {String} personNameField
		*人员姓名字段
		*/
        personNameField: '',
        /**
		*@cfg {Boolean} autoLoad
		*自动重新查询（存在新增或删除数据最好是重新查询）
		*/
        autoLoad: true,
        /**
		*@cfg {Array} needLoadPanels
		*需要重新load的面板的store(不填为默认所有面板的store)		
		*/
        needLoadPanels: [],
        /**
		*@cfg {Object} needReplaceFields
		*保存后不刷新时，需要替换的每个面板的字段
		*/
        needReplaceFields: {},
        /**
		*@cfg {function} executeSuccess
		*执行前函数
		*/
        beforeExecute: function(thisButton) {},
        /**
		*@cfg {function} executeSuccess
		*执行成功函数
		*/
        executeSuccess: function(thisButton, response) {},
        /**
		*@cfg {function} executeFauild
		*执行失败函数
		*/
        executeFailures: function(thisButton, response) {}
    },
    //初始化插件
    init: function(bar) {
        var me = this;
        me.initAddButton(bar);
    },
    //初始化保存按钮
    initAddButton: function(bar) {
        var me = this,
            style = {},
            style = Ext.Object.merge(style, me.buttonStyle);
        if (Ext.isEmpty(me.buttonIcon)) {
            me.buttonIcon = 'saveAction-button-item';
        }
        if (Ext.isEmpty(me.buttonText)) {
            me.buttonText = '保存草稿';
        }
        var addbutton = Ext.create('Rs.ext.button.RsButton', {
                text: me.buttonText,
                iconCls: me.buttonIcon,
                style: style,
                iconAlign: "left",
                handler: function() {
                    me.beforeSave();
                }
            });
        if (Ext.isEmpty(me.autoLoad)) {
            me.autoLoad = true;
        }
        if (bar.xtype == 'rs-pagingtoolbar') {
            bar.insert(3, addbutton);
        } else {
            bar.add(addbutton);
        }
    },
    //保存前    ----执行了beforeExcuete
    beforeSave: function() {
        var me = this;
        //逻辑执行前函数
        if (!Ext.isEmpty(me.beforeExecute)) {
            if (!me.beforeExecute(me)) {
                return false;
            }
        }
        me.doSave();
    },
    //保存
    doSave: function() {
        var me = this,
            params = {},
            panels = new Array();
        //验证是否有修改数据
        if (!me.checkPanelsModified(me.panelIds)) {
            return false;
        }
        //整合数据
        Ext.each(me.panelIds, function(panelId) {
            panel = Ext.getCmp(panelId);
            store = Ext.getStore(panel.store);
            panels.push(me.integratedData(panelId, store));
        });
        var first = me.url.indexOf("auto/");
        var last = me.url.indexOf("/crud");
        params.pagCode = me.url.substring(first + 5, last);
        params.funCode = me.id;
        params.panels = panels;
        params.draftFlag = true;
        //Ajax请求
        returnData = me.doExecuteAction(params);
        if (returnData.errorFlag) {
            return false;
        }
        //重新加载
        if (me.autoLoad) {
            if (!Ext.isEmpty(me.needLoadPanels)) {
                Ext.each(me.needLoadPanels, function(panelId) {
                    var panel = Ext.getCmp(panelId),
                        store = Ext.getStore(panel.store);
                    if (store.isDynamicStore || store.isCachedStore) {
                        if (!Ext.isEmpty(store.dynamicStore)) {
                            store.dynamicStore.cachedDataAllClear();
                        }
                    }
                    if (store.isCachedStore) {
                        store.getDynamicStore().forceChangeStore = true;
                        store.loadPage(store.currentPage);
                    } else {
                        store.reload();
                    }
                    if (panel.isXType('grid')) {
                        panel.setSelection();
                    }
                });
            } else {
                Ext.each(me.panelIds, function(panelId) {
                    panel = Ext.getCmp(panelId);
                    store = Ext.getStore(panel.store);
                    if (store.isDynamicStore || store.isCachedStore) {
                        if (!Ext.isEmpty(store.dynamicStore)) {
                            store.dynamicStore.cachedDataAllClear();
                        }
                    }
                    if (store.isCachedStore) {
                        store.getDynamicStore().forceChangeStore = true;
                        store.loadPage(store.currentPage);
                    } else {
                        store.reload();
                    }
                    if (panel.isXType('grid')) {
                        panel.setSelection();
                    }
                });
            }
        } else //store.reload();
        {
            me.replaceIdToal(params, returnData.responseData);
        }
        return;
    },
    //验证是否存在修改或新增删除的数据
    checkModifieData: function(store, panel) {
        var me = this,
            updateRecords = store.getUpdatedRecords(),
            newRecords = store.getNewRecords(),
            dirtyFlag, modifieds, deleteRecords;
        if (store.isDynamicStore || store.isCachedStore) {
            dirtyFlag = me.checkCaCheStoreModified(store);
        } else {
            if (updateRecords.length > 0) {
                if (panel.xtype == 'gridpanel') {
                    return true;
                } else {
                    Ext.each(updateRecords, function(updateRecord) {
                        modifieds = Object.keys(updateRecord.modified);
                        Ext.each(modifieds, function(modified) {
                            if (modified != store.model.idProperty && updateRecord.data[modified] != updateRecord.modified[modified]) {
                                if (updateRecord.data[modified] == null && updateRecord.modified[modified] == 'undefined') {} else {
                                    dirtyFlag = true;
                                    return false;
                                }
                            }
                        });
                        if (dirtyFlag) {
                            return false;
                        }
                    });
                    if (dirtyFlag) {
                        return true;
                    }
                }
            }
            Ext.each(newRecords, function(newRecord) {
                if (newRecord.dirty) {
                    modifieds = Object.keys(newRecord.modified);
                    Ext.each(modifieds, function(modified) {
                        if (!Ext.isEmpty(newRecord.data[modified])) {
                            dirtyFlag = true;
                        }
                    });
                }
            });
            if (dirtyFlag) {
                return true;
            }
            store.each(function(record) {
                if (record.deleteFlag == 'D') {
                    dirtyFlag = true;
                }
            }, this);
        }
        if (dirtyFlag) {
            return true;
        }
        return false;
    },
    //校验数据是否有更改(上下帧面板)
    checkCaCheStoreModified: function(store) {
        var me = this,
            dirtyFlag, pageData, pagesDataIndex, relationDataIndex, relationPagesData, noRelationStaticDataObj, relationStaticDataArry;
        if (store.isCachedStore) {
            noRelationStaticDataObj = store.noRelationStaticDataObj;
        } else {
            noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
        }
        pagesDataIndex = Object.keys(noRelationStaticDataObj);
        if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
            Ext.each(pagesDataIndex, function(pageDataIndex) {
                pageData = noRelationStaticDataObj[pageDataIndex];
                if (pageDataIndex == store.currentPage) {
                    newRecordsP = me.getNewRecordsData(store);
                    deleteRecordsP = me.getDeleteRecordsData(store);
                    updateRecordsP = me.getUpdateRecordsData(store);
                    if (!Ext.isEmpty(newRecordsP.recordData) || !Ext.isEmpty(deleteRecordsP.recordData) || !Ext.isEmpty(updateRecordsP.recordData)) {
                        dirtyFlag = true;
                    }
                    if (dirtyFlag) {
                        return false;
                    }
                } else {
                    Ext.each(pageData, function(record) {
                        if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                            dirtyFlag = true;
                        } else if (record.crudState == 'U') {
                            if (!Ext.isEmpty(record.modified)) {
                                modifieds = Object.keys(record.modified);
                                Ext.each(modifieds, function(modified) {
                                    if (Ext.isEmpty(record.modified[modified]) && Ext.isEmpty(record.data[modified])) {} else {
                                        if (record.data[modified] == null && record.modified[modified] == 'undefined') {} else {
                                            dirtyFlag = true;
                                            return false;
                                        }
                                    }
                                });
                            }
                        }
                        if (record.phantom) {
                            if (!Ext.isEmpty(record.modified)) {
                                modifieds = Object.keys(record.modified);
                                Ext.each(modifieds, function(modified) {
                                    if (!Ext.isEmpty(record.data[modified])) {
                                        dirtyFlag = true;
                                        return false;
                                    }
                                });
                            }
                        }
                        if (dirtyFlag) {
                            return false;
                        }
                    });
                    if (dirtyFlag) {
                        return false;
                    }
                }
            });
            if (dirtyFlag) {
                return true;
            }
        } else {
            if (store.isCachedStore) {
                relationStaticDataArry = store.relationStaticDataArry;
            } else {
                relationStaticDataArry = store.cachedStore.relationStaticDataArry;
            }
            relationDataIndex = Object.keys(relationStaticDataArry);
            Ext.each(relationDataIndex, function(cachaedPageDataIndex) {
                relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
                Ext.each(relationPagesData.cachedPageData.data, function(record) {
                    if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                        dirtyFlag = true;
                    } else if (record.crudState == 'U') {
                        if (!Ext.isEmpty(record.modified)) {
                            modifieds = Object.keys(record.modified);
                            Ext.each(modifieds, function(modified) {
                                if (Ext.isEmpty(record.modified[modified]) && Ext.isEmpty(record.data[modified])) {} else {
                                    if (modified != store.model.idProperty && record.data[modified] != record.modified[modified]) {
                                        if (record.data[modified] == null && record.modified[modified] == 'undefined') {} else {
                                            dirtyFlag = true;
                                            return false;
                                        }
                                    }
                                }
                            });
                        }
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.modified)) {
                            modifieds = Object.keys(record.modified);
                            Ext.each(modifieds, function(modified) {
                                if (!Ext.isEmpty(record.data[modified])) {
                                    dirtyFlag = true;
                                    return false;
                                }
                            });
                            if (dirtyFlag) {
                                dirtyFlag = true;
                            }
                        }
                    }
                    if (dirtyFlag) {
                        return false;
                    }
                });
                if (dirtyFlag) {
                    return false;
                }
            });
            if (dirtyFlag) {
                return true;
            }
        }
    },
    //检验所有panel的更改
    checkPanelsModified: function(panelIds) {
        var me = this,
            panel, modifiedFlag;
        Ext.each(panelIds, function(panelId) {
            panel = Ext.getCmp(panelId);
            store = Ext.getStore(panel.store);
            modifiedFlag = me.checkModifieData(store, panel);
            if (modifiedFlag) {
                return false;
            }
        });
        if (modifiedFlag) {
            return true;
        } else {
            Rs.Msg.messageAlert({
                title: '提示',
                message: '数据没有发生变化，不需要保存'
            });
            return false;
        }
    },
    //整合数据
    integratedData: function(panelId, store) {
        var me = this,
            panel = {},
            panelData = {},
            rePanelData = {};
        me.comCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.COMPANYCODE;
        me.userCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.ACCTCODE , me.userName = typeof (USERINFO) == 'undefined' ? '' : USERINFO.ACCTNAME;
        if (Ext.isEmpty(me.userCode)) {
            me.userCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERCODE;
            me.userName = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERNAME;
        }
        if (!Ext.isEmpty(me.personCodeField) || !Ext.isEmpty(me.personNameField)) {
            Ext.each(store.model.getFields(), function(fields) {
                if (fields.name == 'COM_CODE') {
                    me.comFlag = true;
                }
                if (fields.name == me.personCodeField) {
                    me.personFlag = true;
                }
            });
        } else {
            Ext.each(store.model.getFields(), function(fields) {
                if (fields.name == 'COM_CODE') {
                    me.comFlag = true;
                }
                if (fields.name == 'UPD_CODE') {
                    me.updFlag = true;
                }
            });
        }
        if (store.isDynamicStore || store.isCachedStore) {
            rePanelData = me.getAllModifiedRecordsData(store);
            panelData.newRecords = rePanelData.newRecords;
            panelData.deleteRecords = rePanelData.deleteRecords;
            panelData.updateRecords = rePanelData.updateRecords;
        } else {
            panelData.newRecords = this.getNewRecordsData(store);
            panelData.deleteRecords = this.getDeleteRecordsData(store);
            panelData.updateRecords = this.getUpdateRecordsData(store);
        }
        panel.gridCode = panelId;
        panel.panelData = panelData;
        if (!Ext.isEmpty(Ext.getCmp(panelId).relationGridPanelId) || !Ext.isEmpty(Ext.getCmp(panelId).moreRelationGridObj)) {
            panel.relationData = me.dealRelationData(Ext.getCmp(panelId));
        }
        return panel;
    },
    //处理关联数据
    dealRelationData: function(panel) {
        var relationData = {},
            relData = {};
        if (!Ext.isEmpty(panel.relationGridPanelId)) {
            //relData.relationCode = panel.relationGridPanelId;
            if (panel.isArrayItemObj(panel.relationGridQueryFieldArray)) {
                //relData.relationFields = panel.relationGridQueryFieldArray;
                relData[panel.relationGridPanelId] = panel.relationGridQueryFieldArray;
            } else {
                var field = {},
                    querFieldArray = [];
                Ext.each(panel.relationGridQueryFieldArray, function(querField) {
                    field.upField = querField;
                    field.downField = querField;
                    querFieldArray.push(field);
                });
                //relData.relationFields = querFieldArray;
                relData[panel.relationGridPanelId] = querFieldArray;
            }
        }
        //relationData.push(relData);
        if (!Ext.isEmpty(panel.moreRelationGridObj)) {
            Ext.each(Ext.Object.getValues(panel.moreRelationGridObj), function(relation) {
                if (panel.isArrayItemObj(relation.relationGridQueryFieldArray)) {
                    relData[relation.relationGridPanelId] = relation.relationGridQueryFieldArray;
                } else {
                    var field = {},
                        querFieldArray = [];
                    Ext.each(relation.relationGridQueryFieldArray, function(querField) {
                        field.upField = querField;
                        field.downField = querField;
                        querFieldArray.push(field);
                    });
                    //relData.relationCode = relation.relationGridPanelId;
                    //relData.relationFields = relation.relationGridQueryFieldArray;
                    relData[relation.relationGridPanelId] = querFieldArray;
                }
            });
        }
        //relationData.push(relData);
        return relData;
    },
    //获取新增行数据
    getNewRecordsData: function(store) {
        var me = this,
            newRecords = store.getNewRecords(),
            reNewRecords = {},
            dirtyFlag,
            newRecordsData = new Array();
        Ext.each(newRecords, function(newRecord) {
            if (newRecord.dirty) {
                modifieds = Object.keys(newRecord.modified);
                Ext.each(modifieds, function(modified) {
                    if (!Ext.isEmpty(newRecord.data[modified])) {
                        dirtyFlag = true;
                        return false;
                    }
                });
                if (dirtyFlag) {
                    var newRecData = newRecord.data;
                    newRecData.DRA_FLAG = 'Y';
                    if (me.comFlag) {
                        newRecData.COM_CODE = me.comCode;
                    }
                    if (me.updFlag) {
                        newRecData.UPD_CODE = me.userCode;
                        newRecData.UPD_NAME = me.userName;
                    }
                    if (me.personFlag) {
                        newRecData[me.personCodeField] = me.userCode;
                        newRecData[me.personNameField] = me.userName;
                    }
                    newRecordsData.push(newRecData);
                }
            }
        });
        reNewRecords.recordData = newRecordsData;
        return reNewRecords;
    },
    //获取删除行数据
    getDeleteRecordsData: function(store) {
        var me = this,
            deleteRecords = {},
            deleteRecordsData = new Array();
        store.each(function(record) {
            if (record.deleteFlag == 'D') {
                var deleRecData = record.data;
                deleRecData.DRA_FLAG = 'Y';
                deleteRecordsData.push(deleRecData);
            }
        });
        deleteRecords.recordData = deleteRecordsData;
        return deleteRecords;
    },
    //获取修改行数据
    getUpdateRecordsData: function(store) {
        var me = this,
            updateRecords = store.getUpdatedRecords(),
            reUpdateRecords = {},
            fiedNameS,
            modifieds = new Array(),
            modifiedData = {},
            recordsData = new Array();
        Ext.each(updateRecords, function(record) {
            fiedNameS = Object.keys(record.modified);
            modifiedData = {};
            Ext.each(fiedNameS, function(fiedName) {
                if (Ext.isEmpty(record.modified[fiedName]) && Ext.isEmpty(record.data[fiedName])) {} else {
                    modifiedData[fiedName] = record.data[fiedName];
                }
            });
            if (!Ext.Object.isEmpty(modifiedData)) {
                modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
                modifiedData.DRA_FLAG = 'Y';
                var upRecData = record.data;
                upRecData.DRA_FLAG = 'Y';
                if (me.updFlag) {
                    upRecData.UPD_CODE = me.userCode;
                    upRecData.UPD_NAME = me.userName;
                    modifiedData.UPD_CODE = me.userCode;
                    modifiedData.UPD_NAME = me.userName;
                }
                if (me.personFlag) {
                    upRecData[me.personCodeField] = me.userCode;
                    upRecData[me.personNameField] = me.userName;
                    modifiedData[me.personCodeField] = me.userCode;
                    modifiedData[me.personNameField] = me.userName;
                }
                modifieds.push(modifiedData);
                recordsData.push(upRecData);
            }
        });
        reUpdateRecords.modifieds = modifieds;
        reUpdateRecords.recordData = recordsData;
        return reUpdateRecords;
    },
    //上下帧关联面板获得数据
    getAllModifiedRecordsData: function(store) {
        var me = this,
            noRelationStaticDataObj, relationStaticDataArry, pagesData, pagesDataIndex, relationPagesData, relationDataIndex,
            newRecords = {},
            dirtyFlag = false,
            updateRecords = {},
            deleteRecords = {},
            newRecordsP = {},
            updateRecordsP = {},
            deleteRecordsP = {},
            returnOjbect = {},
            newRecordsData = new Array(),
            modifiedsData = new Array(),
            recordsData = new Array(),
            deleteRecordsData = new Array();
        if (store.isCachedStore) {
            noRelationStaticDataObj = store.noRelationStaticDataObj;
        } else {
            noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
        }
        pagesDataIndex = Object.keys(noRelationStaticDataObj);
        if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
            Ext.each(pagesDataIndex, function(pageDataIndex) {
                pageData = noRelationStaticDataObj[pageDataIndex];
                if (pageDataIndex == store.currentPage) {
                    newRecordsP = me.getNewRecordsData(store);
                    deleteRecordsP = me.getDeleteRecordsData(store);
                    updateRecordsP = me.getUpdateRecordsData(store);
                } else {
                    Ext.each(pageData, function(record) {
                        if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                            var deleRecData = record.data;
                            deleRecData.DRA_FLAG = 'Y';
                            deleteRecordsData.push(deleRecData);
                        } else if (record.crudState == 'U') {
                            fiedNameS = Object.keys(record.modified);
                            modifiedData = {};
                            Ext.each(fiedNameS, function(fiedName) {
                                modifiedData[fiedName] = record.data[fiedName];
                            });
                            modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
                            modifiedData.DRA_FLAG = 'Y';
                            var upRecData = record.data;
                            upRecData.DRA_FLAG = 'Y';
                            if (me.updFlag) {
                                upRecData.UPD_CODE = me.userCode;
                                upRecData.UPD_NAME = me.userName;
                                modifiedData.UPD_CODE = me.userCode;
                                modifiedData.UPD_NAME = me.userName;
                            }
                            if (me.personFlag) {
                                upRecData[me.personCodeField] = me.userCode;
                                upRecData[me.personNameField] = me.userName;
                                modifiedData[me.personCodeField] = me.userCode;
                                modifiedData[me.personNameField] = me.userName;
                            }
                            modifiedsData.push(modifiedData);
                            recordsData.push(upRecData);
                        }
                        if (record.phantom) {
                            if (!Ext.isEmpty(record.modified)) {
                                modifieds = Object.keys(record.modified);
                                Ext.each(modifieds, function(modified) {
                                    if (!Ext.isEmpty(record.data[modified])) {
                                        dirtyFlag = true;
                                        return false;
                                    }
                                });
                                if (dirtyFlag) {
                                    var newRecData = record.data;
                                    newRecData.DRA_FLAG = 'Y';
                                    if (me.comFlag) {
                                        newRecData.COM_CODE = me.comCode;
                                    }
                                    if (me.updFlag) {
                                        newRecData.UPD_CODE = me.userCode;
                                        newRecData.UPD_NAME = me.userName;
                                    }
                                    if (me.personFlag) {
                                        newRecData[me.personCodeField] = me.userCode;
                                        newRecData[me.personNameField] = me.userName;
                                    }
                                    newRecordsData.push(newRecData);
                                }
                            }
                        }
                    });
                }
            });
            updateRecords.modifieds = modifiedsData;
            updateRecords.recordData = recordsData;
            deleteRecords.recordData = deleteRecordsData;
            newRecords.recordData = newRecordsData;
            updateRecords = Ext.Object.merge(updateRecords, updateRecordsP) , deleteRecords = Ext.Object.merge(deleteRecords, deleteRecordsP) , newRecords = Ext.Object.merge(newRecords, newRecordsP) , returnOjbect.newRecords = newRecords;
            returnOjbect.deleteRecords = deleteRecords;
            returnOjbect.updateRecords = updateRecords;
            return returnOjbect;
        } else {
            if (store.isCachedStore) {
                relationStaticDataArry = store.relationStaticDataArry;
            } else {
                relationStaticDataArry = store.cachedStore.relationStaticDataArry;
            }
            relationDataIndex = Object.keys(relationStaticDataArry);
            Ext.each(relationDataIndex, function(cachaedPageDataIndex) {
                relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
                Ext.each(relationPagesData.cachedPageData.data, function(record) {
                    if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                        var deleRecData = record.data;
                        deleRecData.DRA_FLAG = 'Y';
                        deleteRecordsData.push(deleRecData);
                    } else if (record.crudState == 'U') {
                        fiedNameS = Object.keys(record.modified);
                        modifiedData = {};
                        Ext.each(fiedNameS, function(fiedName) {
                            modifiedData[fiedName] = record.data[fiedName];
                        });
                        modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
                        modifiedData.DRA_FLAG = 'Y';
                        var upRecData = record.data;
                        upRecData.DRA_FLAG = 'Y';
                        if (me.updFlag) {
                            upRecData.UPD_CODE = me.userCode;
                            upRecData.UPD_NAME = me.userName;
                            modifiedData.UPD_CODE = me.userCode;
                            modifiedData.UPD_NAME = me.userName;
                        }
                        if (me.personFlag) {
                            upRecData[me.personCodeField] = me.userCode;
                            upRecData[me.personNameField] = me.userName;
                            modifiedData[me.personCodeField] = me.userCode;
                            modifiedData[me.personNameField] = me.userName;
                        }
                        modifiedsData.push(modifiedData);
                        recordsData.push(upRecData);
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.modified)) {
                            modifieds = Object.keys(record.modified);
                            Ext.each(modifieds, function(modified) {
                                if (!Ext.isEmpty(record.data[modified])) {
                                    dirtyFlag = true;
                                    return false;
                                }
                            });
                            if (dirtyFlag) {
                                var newRecData = record.data;
                                newRecData.FUU_ID = relationPagesData.queryRecord.id;
                                newRecData.DRA_FLAG = 'Y';
                                if (me.comFlag) {
                                    newRecData.COM_CODE = me.comCode;
                                }
                                if (me.updFlag) {
                                    newRecData.UPD_CODE = me.userCode;
                                    newRecData.UPD_NAME = me.userName;
                                }
                                if (me.personFlag) {
                                    newRecData[me.personCodeField] = me.userCode;
                                    newRecData[me.personNameField] = me.userName;
                                }
                                newRecordsData.push(newRecData);
                            }
                        }
                    }
                });
            });
            updateRecords.modifieds = modifiedsData;
            updateRecords.recordData = recordsData;
            deleteRecords.recordData = deleteRecordsData;
            newRecords.recordData = newRecordsData;
            updateRecords = Ext.Object.merge(updateRecords, updateRecordsP) , deleteRecords = Ext.Object.merge(deleteRecords, deleteRecordsP) , newRecords = Ext.Object.merge(newRecords, newRecordsP) , returnOjbect.newRecords = newRecords;
            returnOjbect.deleteRecords = deleteRecords;
            returnOjbect.updateRecords = updateRecords;
            return returnOjbect;
        }
    },
    //执行操作
    doExecuteAction: function(params) {
        var me = this,
            url = me.url,
            errorFlag = false,
            returnData = {},
            errorMsg;
        Ext.Ajax.request({
            url: url,
            async: false,
            jsonData: JSON.stringify(params),
            method: 'POST',
            dataType: "json",
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    if (!Ext.isEmpty(me.executeSuccess)) {
                        me.executeSuccess(me, response);
                    } else {
                        errorFlag = false;
                    }
                } else {
                    if (!Ext.isEmpty(me.executeFailures)) {
                        me.executeFailures(me, response);
                    } else {
                        Rs.Marker.mark(obj.data);
                    }
                    //Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
                    errorFlag = true;
                }
            },
            failure: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (!Ext.isEmpty(me.executeFailures)) {
                    me.executeFailures(me, response);
                } else {
                    Rs.Marker.mark(obj.data);
                }
                //Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
                errorFlag = true;
            }
        });
        returnData.errorFlag = errorFlag;
        return returnData;
    },
    //替换总体
    replaceIdToal: function(params, responseData) {
        var me = this;
        Ext.each(params.panels, function(panel) {
            var panelId = panel.gridCode;
            var replacePanel = Ext.getCmp(panelId);
            var replaceStroe = replacePanel.getStore();
            if (!Ext.isEmpty(me.needReplaceFields)) {
                if (!Ext.isEmpty(me.needReplaceFields[panelId])) {
                    var replaceString = me.needReplaceFields[panelId];
                    replaceString = replaceString.substr(1);
                    replaceString = replaceString.substring(0, replaceString.length - 1);
                    var replaceFields = replaceString.split(',');
                } else {
                    var replaceFields = null;
                }
            } else {
                var replaceFields = null;
            }
            if (replaceStroe.isDynamicStore || replaceStroe.isCachedStore) {
                me.replaceIdC(replaceStroe, responseData.data[panelId], replaceFields);
            } else {
                me.replaceIdN(replaceStroe, responseData.data[panelId], replaceFields);
            }
        });
    },
    //普通替换
    replaceIdN: function(replaceStroe, responseData) {
        replaceStroe.each(function(record) {
            if (record.deleteFlag == 'D') {
                replaceStroe.remove(record);
            }
        });
        Ext.each(responseData, function(replaceData) {
            var replaceKey = Ext.Object.getKeys(replaceData);
            var record = replaceStroe.getById(replaceKey);
            record.set(replaceStroe.model.idProperty, replaceData[replaceKey][replaceStroe.model.idProperty]);
            Ext.each(replaceFields, function(field) {
                if (!Ext.isEmpty(replaceData[replaceKey][field])) {
                    record.set(field, replaceData[replaceKey][field]);
                }
            });
            record.id = replaceData[replaceKey][replaceStroe.model.idProperty];
        });
        replaceStroe.commitChanges();
    },
    //缓存面板替换
    replaceIdC: function(replaceStroe, responseData) {
        //if(Ext.isEmpty(responseData)){
        //	return ;
        //}
        var noRelationStaticDataObj, pagesDataIndex, pageData, relationStaticDataArry, relationDataIndex, relationPagesData;
        if (replaceStroe.isCachedStore) {
            noRelationStaticDataObj = replaceStroe.noRelationStaticDataObj;
        } else {
            noRelationStaticDataObj = replaceStroe.cachedStore.noRelationStaticDataObj;
        }
        pagesDataIndex = Object.keys(noRelationStaticDataObj);
        if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
            Ext.each(pagesDataIndex, function(pageDataIndex) {
                pageData = noRelationStaticDataObj[pageDataIndex];
                Ext.each(pageData, function(record) {
                    if (record.deleteFlag == 'D') {
                        replaceStroe.remove(record);
                    }
                    if (Ext.isEmpty(responseData)) {
                        return;
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.data[replaceStroe.model.idProperty])) {
                            if (!Ext.isEmpty(record.get('HUU_ID'))) {
                                record.set('HUU_ID', responseData[record.id].HUU_ID);
                            }
                            Ext.each(replaceFields, function(field) {
                                if (!Ext.isEmpty(responseData[record.id][field])) {
                                    record.set(field, responseData[record.id][field]);
                                }
                            });
                            record.set(replaceStroe.model.idProperty, responseData[record.id].UU_ID);
                            record.id = record.data[replaceStroe.model.idProperty];
                        }
                    }
                });
            });
        } else {
            if (replaceStroe.isCachedStore) {
                relationStaticDataArry = replaceStroe.relationStaticDataArry;
            } else {
                relationStaticDataArry = replaceStroe.cachedStore.relationStaticDataArry;
            }
            relationDataIndex = Object.keys(relationStaticDataArry);
            Ext.each(relationDataIndex, function(cachaedPageDataIndex) {
                relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
                Ext.each(relationPagesData.cachedPageData.data, function(record) {
                    if (record.deleteFlag == 'D') {
                        replaceStroe.remove(record);
                    }
                    if (Ext.isEmpty(responseData)) {
                        return;
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.data[replaceStroe.model.idProperty])) {
                            if (!Ext.isEmpty(record.get('HUU_ID'))) {
                                record.set('HUU_ID', responseData[record.id].HUU_ID);
                            }
                            Ext.each(replaceFields, function(field) {
                                if (!Ext.isEmpty(responseData[record.id][field])) {
                                    record.set(field, responseData[record.id][field]);
                                }
                            });
                            record.set(replaceStroe.model.idProperty, responseData[record.id].UU_ID);
                            record.id = record.data[replaceStroe.model.idProperty];
                        }
                    }
                });
            });
        }
        replaceStroe.commitChanges();
    }
});

Ext.define('Rs.ext.panel.plugin.SavePlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.saveplugin',
    requires: [
        'Ext.toolbar.Toolbar',
        'Rs.ext.button.RsButton'
    ],
    configs: {
        /**
		*@cfg {Array} panelIds
		*面板id数组
		*/
        panelIds: [],
        /**
		*@cfg {String} buttonText
		*按钮文字
		*/
        buttonText: '',
        /**
		*@cfg {String} buttonIcon
		*按钮图标样式
		*/
        buttonIcon: '',
        /**
		*@cfg {Object} buttonStyle
		*按钮样式
		*/
        buttonStyle: {},
        /**
		*@cfg {String} url
		*请求路径
		*/
        url: '',
        /**
		*@cfg {String} personCodeField
		*人员编码字段
		*/
        personCodeField: '',
        /**
		*@cfg {String} personNameField
		*人员姓名字段
		*/
        personNameField: '',
        /**
		*@cfg {Boolean} autoLoad
		*自动重新查询（存在新增或删除数据最好是重新查询）
		*/
        autoLoad: true,
        /**
		*@cfg {Array} needLoadPanels
		*需要重新load的面板的store(不填为默认所有面板的store)		
		*/
        needLoadPanels: [],
        /**
		*@cfg {Object} needReplaceFields
		*保存后不刷新时，需要替换的每个面板的字段
		*/
        needReplaceFields: {},
        /**
		*@cfg {function} executeSuccess
		*执行前函数
		*/
        beforeExecute: function(thisButton) {},
        /**
		*@cfg {function} executeSuccess
		*执行成功函数
		*/
        executeSuccess: function(thisButton, response) {},
        /**
		*@cfg {function} executeFauild
		*执行失败函数
		*/
        executeFailures: function(thisButton, response) {}
    },
    //初始化插件
    init: function(bar) {
        var me = this;
        //me.panel = panel;
        me.initAddButton(bar);
        Ext.defer(me.initAddPlugins, 100, me);
    },
    //初始化保存按钮
    initAddButton: function(bar) {
        var me = this,
            toolbar,
            //dockedItemsArray = me.panel.getDockedItems(),
            style = {},
            style = Ext.Object.merge(style, me.buttonStyle);
        if (Ext.isEmpty(me.buttonIcon)) {
            me.buttonIcon = 'saveAction-button-item';
        }
        if (Ext.isEmpty(me.buttonText)) {
            me.buttonText = '保存';
        }
        var addbutton = Ext.create('Rs.ext.button.RsButton', {
                text: me.buttonText,
                iconCls: me.buttonIcon,
                style: style,
                iconAlign: "left",
                handler: function() {
                    me.beforeSave();
                }
            });
        if (Ext.isEmpty(me.autoLoad)) {
            me.autoLoad = true;
        }
        if (bar.xtype == 'rs-pagingtoolbar') {
            bar.insert(2, addbutton);
        } else {
            bar.add(addbutton);
        }
    },
    /*Ext.each(dockedItemsArray,function(dockItemObj){
			if("pagingtoolbar"==dockItemObj.xtype || 'rs-pagingtoolbar'==dockItemObj.xtype){
				toolbar = dockItemObj;
				me.toolbar = toolbar;
			}
		},this);*/
    /*if(!Ext.isEmpty(me.toolbar) && (me.toolbar.xtype == 'pagingtoolbar' || me.toolbar.xtype == 'rs-pagingtoolbar')){
			me.addbutton = addbutton;
			me.toolbar.insert(2,addbutton);
			/*var leftSpace = {xtype: 'tbspacer',
							 flex: 1};
			var rightSpace = {xtype: 'tbspacer',
							 flex: 1};
			me.toolbar.insert(11,leftSpace);
			me.toolbar.insert(12,addbutton);*/
    /*}else{
			Ext.each(dockedItemsArray,function(dockItemObj){
				if("toolbar"==dockItemObj.xtype){
					toolbar = dockItemObj;
					me.toolbar = toolbar;
				}
			},this)
			me.toolbar.add(addbutton);
		}*/
    //保存前    ----执行了beforeExcuete
    beforeSave: function() {
        var me = this;
        //逻辑执行前函数
        if (!Ext.isEmpty(me.beforeExecute)) {
            if (!me.beforeExecute(me)) {
                return false;
            }
        }
        me.doSave();
    },
    //保存
    doSave: function() {
        var me = this,
            params = {},
            panels = new Array();
        //store = Ext.getStore(me.grid.store);
        //验证是否有修改数据
        if (!me.checkPanelsModified(me.panelIds)) {
            return false;
        }
        //必输、验重、多字段等
        if (!me.checkDatas()) {
            return false;
        }
        //me.checkModifieData(Ext.getStore(me.panel.store),me.panel);
        //panels.push(me.integratedData(me.grid.id,store));
        //整合数据
        Ext.each(me.panelIds, function(panelId) {
            panel = Ext.getCmp(panelId);
            store = Ext.getStore(panel.store);
            panels.push(me.integratedData(panelId, store));
        });
        var first = me.url.indexOf("auto/");
        var last = me.url.indexOf("/crud");
        params.pagCode = me.url.substring(first + 5, last);
        //params.pagCode = 'tik100';
        params.funCode = me.id;
        params.panels = panels;
        //NewRecordsData = me.getNewRecordsData(Ext.getStore(me.grid.store));
        //panelData = me.adjustData('insert',NewRecordsData,store);
        //params[me.grid.id] = panelData;
        //params.push(panelData);
        //console.log(JSON.stringify(params));
        //me.checkModifieData(Ext.getStore(me.panel.store),me.panel);
        //Ajax请求
        returnData = me.doExecuteAction(params);
        if (returnData.errorFlag) {
            return false;
        }
        //重新加载
        if (me.autoLoad) {
            if (!Ext.isEmpty(me.needLoadPanels)) {
                Ext.each(me.needLoadPanels, function(panelId) {
                    var panel = Ext.getCmp(panelId),
                        store = Ext.getStore(panel.store);
                    if (store.isDynamicStore || store.isCachedStore) {
                        if (!Ext.isEmpty(store.dynamicStore)) {
                            store.dynamicStore.cachedDataAllClear();
                        }
                    }
                    if (store.isCachedStore) {
                        //store.each(function (record) {
                        //	if (record.deleteFlag == 'D') {
                        //		store.remove(record);
                        //	}
                        //})
                        //store.commitChanges();
                        store.getDynamicStore().forceChangeStore = true;
                        store.loadPage(store.currentPage);
                    } else {
                        store.reload();
                    }
                    if (panel.isXType('grid')) {
                        panel.setSelection();
                    }
                });
            } else {
                Ext.each(me.panelIds, function(panelId) {
                    panel = Ext.getCmp(panelId);
                    store = Ext.getStore(panel.store);
                    if (store.isDynamicStore || store.isCachedStore) {
                        if (!Ext.isEmpty(store.dynamicStore)) {
                            store.dynamicStore.cachedDataAllClear();
                        }
                    }
                    if (store.isCachedStore) {
                        /*store.each(function (record) {
							if (record.deleteFlag == 'D') {
								store.remove(record);
							}
						})
						//store.commitChanges();*/
                        store.getDynamicStore().forceChangeStore = true;
                        store.loadPage(store.currentPage);
                    } else {
                        store.reload();
                    }
                    if (panel.isXType('grid')) {
                        panel.setSelection();
                    }
                });
            }
        } else //store.reload();
        {
            me.replaceIdToal(params, returnData.responseData);
        }
        return;
    },
    //验证是否存在修改或新增删除的数据
    checkModifieData: function(store, panel) {
        var me = this,
            updateRecords = store.getUpdatedRecords(),
            newRecords = store.getNewRecords(),
            dirtyFlag, modifieds, deleteRecords;
        if (store.isDynamicStore || store.isCachedStore) {
            dirtyFlag = me.checkCaCheStoreModified(store);
        } else {
            if (updateRecords.length > 0) {
                if (panel.xtype == 'gridpanel') {
                    return true;
                } else {
                    Ext.each(updateRecords, function(updateRecord) {
                        modifieds = Object.keys(updateRecord.modified);
                        Ext.each(modifieds, function(modified) {
                            if (modified != store.model.idProperty && updateRecord.data[modified] != updateRecord.modified[modified]) {
                                if (updateRecord.data[modified] == null && updateRecord.modified[modified] == 'undefined') {} else {
                                    dirtyFlag = true;
                                    return false;
                                }
                            }
                        });
                        if (dirtyFlag) {
                            return false;
                        }
                    });
                    if (dirtyFlag) {
                        return true;
                    }
                }
            }
            Ext.each(newRecords, function(newRecord) {
                if (newRecord.dirty) {
                    modifieds = Object.keys(newRecord.modified);
                    Ext.each(modifieds, function(modified) {
                        if (!Ext.isEmpty(newRecord.data[modified])) {
                            dirtyFlag = true;
                        }
                    });
                }
            });
            if (dirtyFlag) {
                return true;
            }
            store.each(function(record) {
                if (record.deleteFlag == 'D') {
                    dirtyFlag = true;
                }
            }, this);
        }
        if (dirtyFlag) {
            return true;
        }
        return false;
    },
    //校验数据是否有更改(上下帧面板)
    checkCaCheStoreModified: function(store) {
        var me = this,
            dirtyFlag, pageData, pagesDataIndex, relationDataIndex, relationPagesData, noRelationStaticDataObj, relationStaticDataArry;
        if (store.isCachedStore) {
            noRelationStaticDataObj = store.noRelationStaticDataObj;
        } else {
            noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
        }
        pagesDataIndex = Object.keys(noRelationStaticDataObj);
        if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
            Ext.each(pagesDataIndex, function(pageDataIndex) {
                pageData = noRelationStaticDataObj[pageDataIndex];
                if (pageDataIndex == store.currentPage) {
                    newRecordsP = me.getNewRecordsData(store);
                    deleteRecordsP = me.getDeleteRecordsData(store);
                    updateRecordsP = me.getUpdateRecordsData(store);
                    justModeP = me.getJustModeRecordsData(store);
                    if (!Ext.isEmpty(newRecordsP.recordData) || !Ext.isEmpty(deleteRecordsP.recordData) || !Ext.isEmpty(updateRecordsP.recordData) || !Ext.isEmpty(justModeP.recordData)) {
                        dirtyFlag = true;
                    }
                    if (dirtyFlag) {
                        return false;
                    }
                } else {
                    Ext.each(pageData, function(record) {
                        if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                            dirtyFlag = true;
                        } else if (record.crudState == 'U') {
                            if (!Ext.isEmpty(record.modified)) {
                                modifieds = Object.keys(record.modified);
                                Ext.each(modifieds, function(modified) {
                                    if (Ext.isEmpty(record.modified[modified]) && Ext.isEmpty(record.data[modified])) {} else {
                                        if (modified != store.model.idProperty && record.data[modified] != record.modified[modified]) {
                                            if (record.data[modified] == null && record.modified[modified] == 'undefined') {} else {
                                                dirtyFlag = true;
                                                return false;
                                            }
                                        }
                                    }
                                });
                            }
                        }
                        /*if(record.data[modified] ==null && record.modified[modified] =='undefined'){
											
										}else{
											dirtyFlag=true;
											return false;
										}*/
                        //dirtyFlag=true;
                        if (record.phantom) {
                            if (!Ext.isEmpty(record.modified)) {
                                modifieds = Object.keys(record.modified);
                                Ext.each(modifieds, function(modified) {
                                    if (!Ext.isEmpty(record.data[modified])) {
                                        dirtyFlag = true;
                                        return false;
                                    }
                                });
                            }
                        }
                        /*if(dirtyFlag){
								newRecordsData.push(record.data);
							}*/
                        if (dirtyFlag) {
                            return false;
                        }
                    });
                    if (dirtyFlag) {
                        return false;
                    }
                }
            });
            if (dirtyFlag) {
                return true;
            }
        } else {
            if (store.isCachedStore) {
                relationStaticDataArry = store.relationStaticDataArry;
            } else {
                relationStaticDataArry = store.cachedStore.relationStaticDataArry;
            }
            relationDataIndex = Object.keys(relationStaticDataArry);
            Ext.each(relationDataIndex, function(cachaedPageDataIndex) {
                relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
                Ext.each(relationPagesData.cachedPageData.data, function(record) {
                    if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                        dirtyFlag = true;
                    } else if (record.crudState == 'U') {
                        if (!Ext.isEmpty(record.modified)) {
                            modifieds = Object.keys(record.modified);
                            Ext.each(modifieds, function(modified) {
                                if (Ext.isEmpty(record.modified[modified]) && Ext.isEmpty(record.data[modified])) {} else {
                                    if (modified != store.model.idProperty && record.data[modified] != record.modified[modified]) {
                                        if (record.data[modified] == null && record.modified[modified] == 'undefined') {} else {
                                            dirtyFlag = true;
                                            return false;
                                        }
                                    }
                                }
                            });
                        }
                    }
                    //dirtyFlag=true;
                    //return false;
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.modified)) {
                            modifieds = Object.keys(record.modified);
                            Ext.each(modifieds, function(modified) {
                                if (!Ext.isEmpty(record.data[modified])) {
                                    dirtyFlag = true;
                                    return false;
                                }
                            });
                            if (dirtyFlag) {
                                dirtyFlag = true;
                            }
                        }
                    }
                    if (dirtyFlag) {
                        return false;
                    }
                });
                if (dirtyFlag) {
                    return false;
                }
            });
            if (dirtyFlag) {
                return true;
            }
        }
    },
    //检验所有panel的更改
    checkPanelsModified: function(panelIds) {
        var me = this,
            panel, modifiedFlag;
        Ext.each(panelIds, function(panelId) {
            panel = Ext.getCmp(panelId);
            store = Ext.getStore(panel.store);
            modifiedFlag = me.checkModifieData(store, panel);
            if (modifiedFlag) {
                return false;
            }
        });
        if (modifiedFlag) {
            return true;
        } else {
            Rs.Msg.messageAlert({
                title: '提示',
                message: '数据没有发生变化，不需要保存'
            });
            return false;
        }
    },
    //整合数据
    integratedData: function(panelId, store) {
        var me = this,
            panel = {},
            panelData = {},
            rePanelData = {};
        me.comCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.COMPANYCODE;
        me.userCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.ACCTCODE , me.userName = typeof (USERINFO) == 'undefined' ? '' : USERINFO.ACCTNAME;
        if (Ext.isEmpty(me.userCode)) {
            me.userCode = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERCODE;
            me.userName = typeof (USERINFO) == 'undefined' ? '' : USERINFO.USERNAME;
        }
        /*Ext.each(store.model.getFields(),function(fields){
			if(fields.name == 'COM_CODE'){
				me.comFlag = true;
			}else if(fields.name == 'UPD_CODE'){
				me.updFlag = true;
			}
		});*/
        if (!Ext.isEmpty(me.personCodeField) || !Ext.isEmpty(me.personNameField)) {
            Ext.each(store.model.getFields(), function(fields) {
                if (fields.name == 'COM_CODE') {
                    me.comFlag = true;
                }
                if (fields.name == me.personCodeField) {
                    me.personFlag = true;
                }
            });
        } else {
            Ext.each(store.model.getFields(), function(fields) {
                if (fields.name == 'COM_CODE') {
                    me.comFlag = true;
                }
                if (fields.name == 'UPD_CODE') {
                    me.updFlag = true;
                }
            });
        }
        if (store.isDynamicStore || store.isCachedStore) {
            rePanelData = me.getAllModifiedRecordsData(store);
            panelData.newRecords = rePanelData.newRecords;
            panelData.deleteRecords = rePanelData.deleteRecords;
            panelData.updateRecords = rePanelData.updateRecords;
            panelData.justMode = rePanelData.justMode;
        } else {
            panelData.newRecords = this.getNewRecordsData(store);
            panelData.deleteRecords = this.getDeleteRecordsData(store);
            panelData.updateRecords = this.getUpdateRecordsData(store);
            panelData.justMode = this.getJustModeRecordsData(store);
        }
        panel.gridCode = panelId;
        panel.panelData = panelData;
        if (!Ext.isEmpty(Ext.getCmp(panelId).relationGridPanelId) || !Ext.isEmpty(Ext.getCmp(panelId).moreRelationGridObj)) {
            panel.relationData = me.dealRelationData(Ext.getCmp(panelId));
        }
        return panel;
    },
    //处理关联数据
    dealRelationData: function(panel) {
        var relationData = {},
            relData = {};
        if (!Ext.isEmpty(panel.relationGridPanelId)) {
            //relData.relationCode = panel.relationGridPanelId;
            if (panel.isArrayItemObj(panel.relationGridQueryFieldArray)) {
                //relData.relationFields = panel.relationGridQueryFieldArray;
                relData[panel.relationGridPanelId] = panel.relationGridQueryFieldArray;
            } else {
                var field = {},
                    querFieldArray = [];
                Ext.each(panel.relationGridQueryFieldArray, function(querField) {
                    field.upField = querField;
                    field.downField = querField;
                    querFieldArray.push(field);
                });
                //relData.relationFields = querFieldArray;
                relData[panel.relationGridPanelId] = querFieldArray;
            }
        }
        //relationData.push(relData);
        if (!Ext.isEmpty(panel.moreRelationGridObj)) {
            Ext.each(Ext.Object.getValues(panel.moreRelationGridObj), function(relation) {
                if (panel.isArrayItemObj(relation.relationGridQueryFieldArray)) {
                    relData[relation.relationGridPanelId] = relation.relationGridQueryFieldArray;
                } else {
                    var field = {},
                        querFieldArray = [];
                    Ext.each(relation.relationGridQueryFieldArray, function(querField) {
                        field.upField = querField;
                        field.downField = querField;
                        querFieldArray.push(field);
                    });
                    //relData.relationCode = relation.relationGridPanelId;
                    //relData.relationFields = relation.relationGridQueryFieldArray;
                    relData[relation.relationGridPanelId] = querFieldArray;
                }
            });
        }
        //relationData.push(relData);
        return relData;
    },
    //获取新增行数据
    getNewRecordsData: function(store) {
        var me = this,
            newRecords = store.getNewRecords(),
            reNewRecords = {},
            dirtyFlag,
            newRecordsData = new Array();
        Ext.each(newRecords, function(newRecord) {
            if (newRecord.dirty) {
                modifieds = Object.keys(newRecord.modified);
                Ext.each(modifieds, function(modified) {
                    if (!Ext.isEmpty(newRecord.data[modified])) {
                        dirtyFlag = true;
                        return false;
                    }
                });
                if (dirtyFlag) {
                    if (me.comFlag) {
                        newRecord.data.COM_CODE = me.comCode;
                    }
                    if (me.updFlag) {
                        newRecord.data.UPD_CODE = me.userCode;
                        newRecord.data.UPD_NAME = me.userName;
                    }
                    if (me.personFlag) {
                        newRecord.data[me.personCodeField] = me.userCode;
                        newRecord.data[me.personNameField] = me.userName;
                    }
                    newRecordsData.push(newRecord.data);
                }
            }
        });
        reNewRecords.recordData = newRecordsData;
        return reNewRecords;
    },
    //获取删除行数据
    getDeleteRecordsData: function(store) {
        var me = this,
            deleteRecords = {},
            deleteRecordsData = new Array();
        store.each(function(record) {
            if (record.deleteFlag == 'D') {
                deleteRecordsData.push(record.data);
            }
        });
        deleteRecords.recordData = deleteRecordsData;
        return deleteRecords;
    },
    //获取调用模型的数据
    getJustModeRecordsData: function(store) {
        var me = this,
            updateRecords = store.getUpdatedRecords(),
            reJustModeRecords = {},
            fiedNameS,
            recordsData = new Array();
        Ext.each(updateRecords, function(record) {
            fiedNameS = Object.keys(record.modified);
            if (fiedNameS.length == 1 && record.data.CHE_FLAG == 'Y') {
                recordsData.push(record.data);
            }
        });
        reJustModeRecords.recordData = recordsData;
        return reJustModeRecords;
    },
    //获取修改行数据
    getUpdateRecordsData: function(store) {
        var me = this,
            updateRecords = store.getUpdatedRecords(),
            reUpdateRecords = {},
            fiedNameS,
            modifieds = new Array(),
            modifiedData = {},
            recordsData = new Array();
        Ext.each(updateRecords, function(record) {
            fiedNameS = Object.keys(record.modified);
            modifiedData = {};
            if (fiedNameS.length == 1 && record.data.CHE_FLAG == 'Y') {} else {
                Ext.each(fiedNameS, function(fiedName) {
                    if (Ext.isEmpty(record.modified[fiedName]) && Ext.isEmpty(record.data[fiedName])) {} else {
                        modifiedData[fiedName] = record.data[fiedName];
                    }
                });
            }
            if (!Ext.Object.isEmpty(modifiedData)) {
                modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
                if (me.updFlag) {
                    record.data.UPD_CODE = me.userCode;
                    record.data.UPD_NAME = me.userName;
                    modifiedData.UPD_CODE = me.userCode;
                    modifiedData.UPD_NAME = me.userName;
                }
                if (me.personFlag) {
                    record.data[me.personCodeField] = me.userCode;
                    record.data[me.personNameField] = me.userName;
                    modifiedData[me.personCodeField] = me.userCode;
                    modifiedData[me.personNameField] = me.userName;
                }
                modifieds.push(modifiedData);
                recordsData.push(record.data);
            }
        });
        reUpdateRecords.modifieds = modifieds;
        reUpdateRecords.recordData = recordsData;
        return reUpdateRecords;
    },
    //上下帧关联面板获得数据
    getAllModifiedRecordsData: function(store) {
        var me = this,
            noRelationStaticDataObj, relationStaticDataArry, pagesData, pagesDataIndex, relationPagesData, relationDataIndex,
            newRecords = {},
            dirtyFlag = false,
            updateRecords = {},
            deleteRecords = {},
            newRecordsP = {},
            updateRecordsP = {},
            deleteRecordsP = {},
            justMode = {},
            justModeP = {},
            returnOjbect = {},
            newRecordsData = new Array(),
            modifiedsData = new Array(),
            recordsData = new Array(),
            deleteRecordsData = new Array();
        justModeRecordData = new Array();
        if (store.isCachedStore) {
            noRelationStaticDataObj = store.noRelationStaticDataObj;
        } else {
            noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
        }
        pagesDataIndex = Object.keys(noRelationStaticDataObj);
        if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
            Ext.each(pagesDataIndex, function(pageDataIndex) {
                pageData = noRelationStaticDataObj[pageDataIndex];
                if (pageDataIndex == store.currentPage) {
                    newRecordsP = me.getNewRecordsData(store);
                    deleteRecordsP = me.getDeleteRecordsData(store);
                    updateRecordsP = me.getUpdateRecordsData(store);
                    justModeP = me.getJustModeRecordsData(store);
                } else {
                    Ext.each(pageData, function(record) {
                        if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                            deleteRecordsData.push(record.data);
                        } else if (record.crudState == 'U') {
                            fiedNameS = Object.keys(record.modified);
                            modifiedData = {};
                            if (fiedNameS.length == 1 && record.data.CHE_FLAG == 'Y') {
                                justModeRecordData.push(record.data);
                            } else {
                                Ext.each(fiedNameS, function(fiedName) {
                                    modifiedData[fiedName] = record.data[fiedName];
                                });
                                modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
                                if (me.updFlag) {
                                    record.data.UPD_CODE = me.userCode;
                                    record.data.UPD_NAME = me.userName;
                                    modifiedData.UPD_CODE = me.userCode;
                                    modifiedData.UPD_NAME = me.userName;
                                }
                                if (me.personFlag) {
                                    record.data[me.personCodeField] = me.userCode;
                                    record.data[me.personNameField] = me.userName;
                                    modifiedData[me.personCodeField] = me.userCode;
                                    modifiedData[me.personNameField] = me.userName;
                                }
                                modifiedsData.push(modifiedData);
                                recordsData.push(record.data);
                            }
                        }
                        if (record.phantom) {
                            if (!Ext.isEmpty(record.modified)) {
                                modifieds = Object.keys(record.modified);
                                Ext.each(modifieds, function(modified) {
                                    if (!Ext.isEmpty(record.data[modified])) {
                                        dirtyFlag = true;
                                        return false;
                                    }
                                });
                                if (dirtyFlag) {
                                    if (me.comFlag) {
                                        record.data.COM_CODE = me.comCode;
                                    }
                                    if (me.updFlag) {
                                        record.data.UPD_CODE = me.userCode;
                                        record.data.UPD_NAME = me.userName;
                                    }
                                    if (me.personFlag) {
                                        record.data[me.personCodeField] = me.userCode;
                                        record.data[me.personNameField] = me.userName;
                                    }
                                    newRecordsData.push(record.data);
                                }
                            }
                        }
                    });
                }
            });
            updateRecords.modifieds = modifiedsData;
            updateRecords.recordData = recordsData;
            deleteRecords.recordData = deleteRecordsData;
            justMode.recordData = justModeRecordData;
            newRecords.recordData = newRecordsData;
            updateRecords = Ext.Object.merge(updateRecords, updateRecordsP) , justMode = Ext.Object.merge(justMode, justModeP) , deleteRecords = Ext.Object.merge(deleteRecords, deleteRecordsP) , newRecords = Ext.Object.merge(newRecords, newRecordsP) , returnOjbect.newRecords = newRecords;
            returnOjbect.deleteRecords = deleteRecords;
            returnOjbect.updateRecords = updateRecords;
            returnOjbect.justMode = justMode;
            return returnOjbect;
        } else {
            if (store.isCachedStore) {
                relationStaticDataArry = store.relationStaticDataArry;
            } else {
                relationStaticDataArry = store.cachedStore.relationStaticDataArry;
            }
            relationDataIndex = Object.keys(relationStaticDataArry);
            Ext.each(relationDataIndex, function(cachaedPageDataIndex) {
                relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
                Ext.each(relationPagesData.cachedPageData.data, function(record) {
                    if (record.crudState == 'R' && record.deleteFlag != 'D') {} else if (record.deleteFlag == 'D') {
                        deleteRecordsData.push(record.data);
                    } else if (record.crudState == 'U') {
                        fiedNameS = Object.keys(record.modified);
                        modifiedData = {};
                        if (fiedNameS.length == 1 && record.data.CHE_FLAG == 'Y') {
                            justModeRecordData.push(record.data);
                        } else {
                            Ext.each(fiedNameS, function(fiedName) {
                                modifiedData[fiedName] = record.data[fiedName];
                            });
                            modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
                            if (me.updFlag) {
                                record.data.UPD_CODE = me.userCode;
                                record.data.UPD_NAME = me.userName;
                                modifiedData.UPD_CODE = me.userCode;
                                modifiedData.UPD_NAME = me.userName;
                            }
                            if (me.personFlag) {
                                record.data[me.personCodeField] = me.userCode;
                                record.data[me.personNameField] = me.userName;
                                modifiedData[me.personCodeField] = me.userCode;
                                modifiedData[me.personNameField] = me.userName;
                            }
                            modifiedsData.push(modifiedData);
                            recordsData.push(record.data);
                        }
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.modified)) {
                            modifieds = Object.keys(record.modified);
                            Ext.each(modifieds, function(modified) {
                                if (!Ext.isEmpty(record.data[modified])) {
                                    dirtyFlag = true;
                                    return false;
                                }
                            });
                            if (dirtyFlag) {
                                var newRecordData = record.data;
                                newRecordData.FUU_ID = relationPagesData.queryRecord.id;
                                if (me.comFlag) {
                                    newRecordData.COM_CODE = me.comCode;
                                }
                                if (me.updFlag) {
                                    newRecordData.UPD_CODE = me.userCode;
                                    newRecordData.UPD_NAME = me.userName;
                                }
                                if (me.personFlag) {
                                    newRecordData[me.personCodeField] = me.userCode;
                                    newRecordData[me.personNameField] = me.userName;
                                }
                                newRecordsData.push(newRecordData);
                            }
                        }
                    }
                });
            });
            //newRecordsData.push(record.data);
            updateRecords.modifieds = modifiedsData;
            updateRecords.recordData = recordsData;
            deleteRecords.recordData = deleteRecordsData;
            newRecords.recordData = newRecordsData;
            justMode.recordData = justModeRecordData;
            updateRecords = Ext.Object.merge(updateRecords, updateRecordsP) , deleteRecords = Ext.Object.merge(deleteRecords, deleteRecordsP) , newRecords = Ext.Object.merge(newRecords, newRecordsP) , justMode = Ext.Object.merge(justMode, justModeP) , returnOjbect.newRecords = newRecords;
            returnOjbect.deleteRecords = deleteRecords;
            returnOjbect.updateRecords = updateRecords;
            returnOjbect.justMode = justMode;
            return returnOjbect;
        }
    },
    //执行操作
    doExecuteAction: function(params) {
        var me = this,
            url = me.url,
            errorFlag = false,
            returnData = {},
            errorMsg;
        //var storage = Ext.util.LocalStorage.get('rslocal');
        //token = 'Bearer '+storage.getItem("token");
        token = typeof (TOKEN) == 'undefined' ? '' : TOKEN;
        Ext.Ajax.request({
            url: url,
            async: false,
            headers: {
                Authorization: token
            },
            jsonData: JSON.stringify(params),
            method: 'POST',
            dataType: "json",
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                returnData.responseData = obj;
                if (obj.success) {
                    if (!Ext.isEmpty(me.executeSuccess)) {
                        errorFlag = me.executeSuccess(me, response);
                    } else {
                        errorFlag = false;
                    }
                } else {
                    if (!Ext.isEmpty(me.executeFailures)) {
                        me.executeFailures(me, response);
                    } else {
                        //Rs.Marker.mark(obj.data);
                        Rs.Msg.messageAlert({
                            title: '提示',
                            message: obj.data,
                            buttons: Ext.MessageBox.OK
                        });
                    }
                    errorFlag = true;
                }
            },
            failure: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                if (!Ext.isEmpty(me.executeFailures)) {
                    errorFlag = me.executeFailures(me, response);
                } else {
                    Rs.Marker.mark(obj.data);
                }
                //Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
                errorFlag = true;
            }
        });
        returnData.errorFlag = errorFlag;
        return returnData;
    },
    //验证插件总体调用
    checkDatas: function() {
        var me = this,
            panelData = new Array(),
            errorMsg,
            errorData = {},
            panel;
        window.RsPanelErrorMsg = [];
        Ext.each(me.panelIds, function(panelId) {
            panel = Ext.getCmp(panelId);
            Rs.Marker.unmark(panel);
            errorMsg = me.checkPanelData(panel);
            if (!Ext.isEmpty(errorMsg) && errorMsg.success == false) {
                panelData.push(errorMsg);
            }
        });
        if (!Ext.isEmpty(panelData)) {
            errorData.panelData = panelData;
            window.RsPanelErrorMsg = panelData;
            Rs.Marker.mark(panelData);
        }
        if (!Ext.Object.isEmpty(errorData)) {
            return false;
        } else {
            return true;
        }
    },
    //console.log(errorData);
    //验证插件分面板调用
    checkPanelData: function(panel) {
        var me = this,
            panelPlugins = panel.plugins,
            errorMsg,
            error = new Array(),
            errorData = {},
            errorMsgArray = new Array(),
            errorArrArray = new Array(),
            checkPlugins = new Array();
        Ext.each(panelPlugins, function(panelPlugin) {
            if ("griddatamustinput" == panelPlugin.ptype || 'griddatacheckrepeat' == panelPlugin.ptype || 'sumCompare' == panelPlugin.ptype || 'formulaPlu' == panelPlugin.ptype) {
                checkPlugins.push(panelPlugin);
            }
        }, this);
        Ext.each(checkPlugins, function(checkPlugin) {
            errorMsg = {};
            if ("griddatamustinput" == checkPlugin.ptype) {
                errorMsg = checkPlugin.checkMustInput(panel);
            } else if ("griddatacheckrepeat" == checkPlugin.ptype) {
                errorMsg = checkPlugin.checkRepeat(panel);
            } else if ("sumCompare" == checkPlugin.ptype) {
                errorMsg = checkPlugin.headDetailSumCompareControl();
            } else if ("formulaPlu" == checkPlugin.ptype) {
                errorMsg = checkPlugin.formulaPlu();
            }
            if (!Ext.isEmpty(errorMsg) && errorMsg.success == false) {
                error.push(errorMsg);
                //errorArrArray.push(errorMsg.errArr);
                Ext.each(errArr, function(errAr) {
                    errorArrArray.push(errAr);
                });
                errorMsgArray.push(errorMsg.errorMsg);
                errorData.panelId = errorMsg.panelID;
            }
        }, this);
        if (errorArrArray.length > 0) {
            errorData.success = false;
        } else {
            errorData.success = true;
        }
        errorData.errArr = errorArrArray;
        errorData.errorMsg = errorMsgArray;
        //Rs.Marker.mark(error[1]);
        //console.log(error);
        return errorData;
    },
    //添加控制插件
    initAddPlugins: function() {
        var me = this;
        Ext.each(me.panelIds, function(panelid) {
            panel = Ext.getCmp(panelid.toString());
            if (!Ext.isEmpty(panel) && panel.isXType('grid')) {
                me.addControlPlugins(panel);
            }
        });
    },
    //获取所有控制插件
    addControlPlugins: function(panel) {
        var me = this,
            panelPlugins = panel.plugins,
            editPlugin,
            editControlPlugins = new Array();
        Ext.each(panelPlugins, function(panelPlugin) {
            if ("fieldscompare" == panelPlugin.ptype || "statecontrolf" == panelPlugin.ptype || "relatestatecontrolf" == panelPlugin.ptype || "fielddiffentcontrolf" == panelPlugin.ptype || "fieldsamecontrolf" == panelPlugin.ptype || "fieldsdifferentb" == panelPlugin.ptype || "fieldsamecontrolb" == panelPlugin.ptype || "calculateassign" == panelPlugin.ptype || "headdetailcalculate" == panelPlugin.ptype) {
                editControlPlugins.push(panelPlugin);
            }
            if ("cellediting" === panelPlugin.ptype) {
                editPlugin = panelPlugin;
            }
            if ("rowediting" === panelPlugin.ptype) {
                editPlugin = panelPlugin;
            }
        }, this);
        if (!Ext.isEmpty(editPlugin)) {
            editPlugin.on('edit', function(editPlugin, context) {
                me.doControPlugis(editControlPlugins, context);
            }, me);
            editPlugin.on('beforeedit', function(editPlugin, context) {
                var returnFlag = true;
                Ext.each(editControlPlugins, function(controlPlugin) {
                    returnFlag = true;
                    if ("statecontrolf" == controlPlugin.ptype) {
                        returnFlag = controlPlugin.gridStateControl(editPlugin, context.record, context.field);
                    }
                    if ("relatestatecontrolf" == controlPlugin.ptype) {
                        returnFlag = controlPlugin.relateStateControl(editPlugin, context.record, context.field);
                    }
                    if (!returnFlag) {
                        return false;
                    }
                });
                if (!returnFlag) {
                    return false;
                }
            }, me);
        }
    },
    //控制插件执行
    doControPlugis: function(editControlPlugins, context) {
        var returnFlag = true;
        Ext.each(editControlPlugins, function(controlPlugin) {
            returnFlag = true;
            if ("fieldscompare" == controlPlugin.ptype) {
                returnFlag = controlPlugin.gridCompareControl(context);
            }
            if ("fielddiffentcontrolf" == controlPlugin.ptype) {
                returnFlag = controlPlugin.gridAttributeUnsame(context);
            }
            if ("fieldsamecontrolf" == controlPlugin.ptype) {
                returnFlag = controlPlugin.gridAttributeSame(context);
            }
            if ("fieldsdifferentb" == controlPlugin.ptype) {
                returnFlag = controlPlugin.gridFieldsDifferentControlB(context);
            }
            if ("fieldsamecontrolb" == controlPlugin.ptype) {
                returnFlag = controlPlugin.singleGridFunction('', context.record, context.field, context.rowIdx);
            }
            if ("calculateassign" == controlPlugin.ptype) {
                returnFlag = controlPlugin.gridCalculate(context);
            }
            if ("headdetailcalculate" == controlPlugin.ptype) {
                returnFlag = controlPlugin.headCalculate(context);
            }
            if (!returnFlag) {
                return false;
            }
        });
        if (!returnFlag) {
            return false;
        }
    },
    //替换总体
    replaceIdToal: function(params, responseData) {
        var me = this;
        Ext.each(params.panels, function(panel) {
            var panelId = panel.gridCode;
            var replacePanel = Ext.getCmp(panelId);
            var replaceStroe = replacePanel.getStore();
            if (!Ext.isEmpty(me.needReplaceFields)) {
                if (!Ext.isEmpty(me.needReplaceFields[panelId])) {
                    var replaceString = me.needReplaceFields[panelId];
                    replaceString = replaceString.substr(1);
                    replaceString = replaceString.substring(0, replaceString.length - 1);
                    var replaceFields = replaceString.split(',');
                } else {
                    var replaceFields = null;
                }
            } else {
                var replaceFields = null;
            }
            if (replaceStroe.isDynamicStore || replaceStroe.isCachedStore) {
                me.replaceIdC(replaceStroe, responseData.data[panelId], replaceFields);
            } else {
                me.replaceIdN(replaceStroe, responseData.data[panelId], replaceFields);
            }
        });
    },
    //普通替换
    replaceIdN: function(replaceStroe, responseData, replaceFields) {
        replaceStroe.each(function(record) {
            if (record.deleteFlag == 'D') {
                replaceStroe.remove(record);
            }
        });
        Ext.each(responseData, function(replaceData) {
            var replaceKey = Ext.Object.getKeys(replaceData);
            var record = replaceStroe.getById(replaceKey);
            record.set(replaceStroe.model.idProperty, replaceData[replaceKey][replaceStroe.model.idProperty]);
            Ext.each(replaceFields, function(field) {
                if (!Ext.isEmpty(replaceData[replaceKey][field])) {
                    record.set(field, replaceData[replaceKey][field]);
                }
            });
            record.id = replaceData[replaceKey][replaceStroe.model.idProperty];
        });
        replaceStroe.commitChanges();
    },
    //缓存面板替换
    replaceIdC: function(replaceStroe, responseData, replaceFields) {
        var noRelationStaticDataObj, pagesDataIndex, pageData, relationStaticDataArry, relationDataIndex, relationPagesData;
        if (replaceStroe.isCachedStore) {
            noRelationStaticDataObj = replaceStroe.noRelationStaticDataObj;
        } else {
            noRelationStaticDataObj = replaceStroe.cachedStore.noRelationStaticDataObj;
        }
        pagesDataIndex = Object.keys(noRelationStaticDataObj);
        if (!Ext.Object.isEmpty(noRelationStaticDataObj)) {
            Ext.each(pagesDataIndex, function(pageDataIndex) {
                pageData = noRelationStaticDataObj[pageDataIndex];
                Ext.each(pageData, function(record) {
                    if (record.deleteFlag == 'D') {
                        replaceStroe.remove(record);
                    }
                    if (Ext.isEmpty(responseData)) {
                        return;
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.data[replaceStroe.model.idProperty])) {
                            if (!Ext.isEmpty(record.get('HUU_ID'))) {
                                record.set('HUU_ID', responseData[record.id].HUU_ID);
                            }
                            Ext.each(replaceFields, function(field) {
                                if (!Ext.isEmpty(responseData[record.id][field])) {
                                    record.set(field, responseData[record.id][field]);
                                }
                            });
                            record.set(replaceStroe.model.idProperty, responseData[record.id].UU_ID);
                            record.id = record.data[replaceStroe.model.idProperty];
                        }
                    }
                });
            });
        } else //record.data[replaceStroe.model.idProperty]='111111';
        {
            if (replaceStroe.isCachedStore) {
                relationStaticDataArry = replaceStroe.relationStaticDataArry;
            } else {
                relationStaticDataArry = replaceStroe.cachedStore.relationStaticDataArry;
            }
            relationDataIndex = Object.keys(relationStaticDataArry);
            Ext.each(relationDataIndex, function(cachaedPageDataIndex) {
                relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
                Ext.each(relationPagesData.cachedPageData.data, function(record) {
                    if (record.deleteFlag == 'D') {
                        replaceStroe.remove(record);
                    }
                    if (Ext.isEmpty(responseData)) {
                        return;
                    }
                    if (record.phantom) {
                        if (!Ext.isEmpty(record.data[replaceStroe.model.idProperty])) {
                            if (!Ext.isEmpty(record.get('HUU_ID'))) {
                                record.set('HUU_ID', responseData[record.id].HUU_ID);
                            }
                            Ext.each(replaceFields, function(field) {
                                if (!Ext.isEmpty(responseData[record.id][field])) {
                                    record.set(field, responseData[record.id][field]);
                                }
                            });
                            record.set(replaceStroe.model.idProperty, responseData[record.id].UU_ID);
                            record.id = record.data[replaceStroe.model.idProperty];
                        }
                    }
                });
            });
        }
        //record.data[replaceStroe.model.idProperty]='111111';
        replaceStroe.commitChanges();
    }
});

Ext.define('Rs.ext.grid.plugin.StateControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.statecontrolf',
    //requires:'Ext.button.Button',
    configs: {
        /**
		*@cfg {string} panelId
		*控件id
		*/
        itemIds: '',
        /**
		*@cfg {string} panelId
		*面板id
		*/
        panelId: '',
        /**
		*@cfg {string} checkFields
		*业务字段
		*/
        checkFields: '',
        /**
		*@cfg {string} targetValues
		*目标值
		*/
        targetValues: '',
        /**
		*@cfg {string} controlRule
		*空值规则
		*/
        controlRule: '',
        /**
         *@cfg {string} allRowEnable
         *defaultValue:false
         *是否控制该行全部数据列
         */
        allRowEnable: false,
        /**
		*@cfg {string} erroCode
		*错误信息码
		*/
        erroCode: ''
    },
    //初始化插件
    init: function(grid) {
        var me = this,
            editPlugin,
            gridPluginsArray = grid.getPlugins();
        if (grid.isXType('grid')) {
            me.gridFunction(gridPluginsArray, editPlugin);
        } else {
            me.grid = grid;
            me.grid.on('afterrender', function(editPlugin, context) {
                //判断已经渲染该控件
                var itemIdArray = new Array();
                itemIdArray = me.itemIds.split(",");
                var checkFieldsArray = new Array();
                checkFieldsArray = me.checkFields.split(",");
                var targetValuesArray = new Array();
                targetValuesArray = me.targetValues.split(",");
                var controlRuleArray = new Array();
                controlRuleArray = me.controlRule.split(",");
                if (itemIdArray.length != checkFieldsArray.length) {
                    Ext.Msg.alert('提示', '控制规则配置错误');
                    return false;
                }
                if (targetValuesArray.length != controlRuleArray.length) {
                    Ext.Msg.alert('提示', '控制规则配置错误');
                    return false;
                }
                if (itemIdArray.length != targetValuesArray.length) {
                    Ext.Msg.alert('提示', '控制规则配置错误');
                    return false;
                }
                for (j = 0; j < itemIdArray.length; j++) {
                    me.panelFunction(itemIdArray[j], me.panelId, checkFieldsArray[j], targetValuesArray[j], controlRuleArray[j]);
                }
            });
        }
    },
    panelFunction: function(itemId, panelId, checkFields, targetValues, controlRule) {
        var me = this;
        //console.log(Ext.getCmp(checkFields).getValue());
        var checkValue = Ext.getCmp(checkFields).getValue().toString();
        var targetValue = targetValues.toString();
        if (controlRule == '>') {
            if (checkValue > targetValue) {
                Ext.getCmp(itemId).setReadOnly(true);
            } else {
                Ext.getCmp(itemId).setReadOnly(false);
            }
        } else if (controlRule == '<') {
            if (checkValue < targetValue) {
                Ext.getCmp(itemId).setReadOnly(true);
            } else {
                Ext.getCmp(itemId).setReadOnly(false);
            }
        } else if (controlRule == '>=') {
            if (checkValue >= targetValue) {
                Ext.getCmp(itemId).setReadOnly(true);
            } else {
                Ext.getCmp(itemId).setReadOnly(false);
            }
        } else if (controlRule == '<=') {
            if (checkValue <= targetValue) {
                Ext.getCmp(itemId).setReadOnly(true);
            } else {
                Ext.getCmp(itemId).setReadOnly(false);
            }
        } else if (controlRule == '=') {
            if (checkValue == targetValue) {
                Ext.getCmp(itemId).setReadOnly(true);
            } else {
                Ext.getCmp(itemId).setReadOnly(false);
            }
        } else if (controlRule == '<>' || controlRule == '!=') {
            if (checkValue != targetValue) {
                Ext.getCmp(itemId).setReadOnly(true);
            } else {
                Ext.getCmp(itemId).setReadOnly(false);
            }
        } else {
            Ext.Msg.alert('提示', '控制规则配置错误');
        }
    },
    gridStateControl: function(editPlugin, record, field) {
        var me = this;
        var returnFlag = false;
        //var field = context.field;
        var itemIdArray = new Array();
        itemIdArray = me.itemIds.split(",");
        var fieldArray = new Array();
        fieldArray = field.split(",");
        var checkFieldsArray = new Array();
        checkFieldsArray = me.checkFields.split(",");
        var targetValuesArray = new Array();
        targetValuesArray = me.targetValues.split(",");
        var controlRuleArray = new Array();
        controlRuleArray = me.controlRule.split(",");
        if (targetValuesArray.length != checkFieldsArray.length) {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
        if (targetValuesArray.length != controlRuleArray.length) {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return false;
        }
        var clickFieldFlag = false;
        if (me.allRowEnable) {
            clickFieldFlag = true;
        } else {
            for (j = 0; j < itemIdArray.length; j++) {
                for (i = 0; i < fieldArray.length; i++) {
                    if (fieldArray[i] == itemIdArray[j]) {
                        clickFieldFlag = true;
                    }
                }
            }
        }
        if (clickFieldFlag) {
            for (j = 0; j < checkFieldsArray.length; j++) {
                if (Ext.isEmpty(record.get(checkFieldsArray[j]))) {
                    return true;
                }
                //console.log(record.get(checkFieldsArray[j]));
                var checkValue = record.get(checkFieldsArray[j]).toString();
                var targetValue = targetValuesArray[j].toString();
                var controlRule = controlRuleArray[j];
                if (controlRule == '>') {
                    if (checkValue > targetValue) {
                        returnFlag = true;
                    }
                }
                //return false;
                else if (controlRule == '<') {
                    if (checkValue < targetValue) {
                        returnFlag = true;
                    }
                }
                //return false;
                else if (controlRule == '>=') {
                    if (checkValue >= targetValue) {
                        returnFlag = true;
                    }
                }
                //return false;
                else if (controlRule == '<=') {
                    if (checkValue <= targetValue) {
                        returnFlag = true;
                    }
                }
                //return false;
                else if (controlRule == '=') {
                    if (checkValue == targetValue) {
                        //console.log(1);
                        returnFlag = true;
                    }
                }
                //return false;
                else if (controlRule == '<>' || controlRule == '!=') {
                    if (checkValue != targetValue) {
                        returnFlag = true;
                    }
                } else //return false;
                {
                    Ext.Msg.alert('提示', '控制规则配置错误');
                }
            }
        }
        if (returnFlag) {
            if (!Ext.isEmpty(me.erroCode)) {
                Rs.Msg.messageAlert({
                    stateCode: me.erroCode
                });
            }
            return false;
        } else {
            return true;
        }
    },
    //xtype为grid
    gridFunction: function(gridPluginsArray, editPlugin) {}
});
// var me = this;
// Ext.each(gridPluginsArray,function(pluginObj){
// if("cellediting"===pluginObj.ptype){
// editPlugin = pluginObj;
// }
// if("rowediting"===pluginObj.ptype){
// editPlugin = pluginObj;
// }
// },this);
// editPlugin.on('beforeedit',function(editPlugin,context){
// return me.gridStateControl(editPlugin,context.record,context.field);
// },me);

Ext.define('Rs.ext.telescope.store.TeleStore', function() {
    return {
        extend: 'Ext.data.Store',
        proxy: {
            type: 'ajax',
            url: '/base/telescope/read',
            reader: {
                type: 'json',
                rootProperty: 'data.list',
                totalProperty: 'data.total'
            }
        }
    };
});

Ext.define('Rs.ext.telescope.model.Base', {
    extend: 'Ext.data.Model',
    schema: {
        namespace: 'Rs.ext.telescope.model'
    }
});

Ext.define('Rs.ext.telescope.model.Head', {
    extend: 'Rs.ext.telescope.model.Base',
    fields: [
        {
            name: 'prog_code',
            mapping: 'progCode',
            type: 'string'
        },
        {
            name: 'prog_name',
            mapping: 'progName',
            type: 'string'
        }
    ]
});

Ext.define('Rs.ext.telescope.model.Detail', {
    extend: 'Rs.ext.telescope.model.Base',
    fields: [
        {
            name: 'seq_no',
            mapping: 'seqNo',
            type: 'int'
        },
        {
            name: 'prog_code',
            mapping: 'progCode',
            type: 'string'
        },
        {
            name: 'field_name',
            mapping: 'fieldName',
            type: 'string'
        },
        {
            name: 'is_hidden',
            mapping: 'isHidden',
            type: 'string'
        },
        {
            name: 'desc_zh',
            mapping: 'descZh',
            type: 'string'
        },
        {
            name: 'desc_en',
            mapping: 'descEn',
            type: 'string'
        }
    ]
});

Ext.define('Rs.ext.telescope.model.Criteria', {
    extend: 'Rs.ext.telescope.model.Base',
    fields: [
        {
            name: 'seq_no',
            mapping: 'seqNo',
            type: 'int'
        },
        {
            name: 'prog_code',
            mapping: 'progCode',
            type: 'string'
        },
        {
            name: 'field_name',
            mapping: 'fieldName',
            type: 'string'
        },
        {
            name: 'desc_zh',
            mapping: 'descZh',
            type: 'string'
        },
        {
            name: 'desc_en',
            mapping: 'descEn',
            type: 'string'
        }
    ]
});

Ext.define('Rs.ext.telescope.model.Meta', {
    extend: 'Rs.ext.telescope.model.Base',
    requires: [
        'Rs.ext.telescope.model.Head',
        'Rs.ext.telescope.model.Detail',
        'Rs.ext.telescope.model.Criteria'
    ],
    fields: [
        {
            name: 'prog_code',
            mapping: 'progCode',
            type: 'string'
        }
    ],
    hasOne: [
        'Head'
    ],
    hasMany: [
        'Detail',
        'Criteria'
    ]
});

Ext.define('Rs.ext.telescope.store.TeleMetaStore', function() {
    return {
        extend: 'Ext.data.Store',
        model: 'Rs.ext.telescope.model.Meta',
        proxy: {
            type: 'ajax',
            url: '/base/telescope/meta',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    };
});

Ext.define('Rs.ext.telescope.view.TelescopeForm', {
    extend: 'Ext.form.Panel',
    layout: 'column',
    defaults: {
        margin: 4,
        minWidth: 100
    },
    mixins: [
        'Ext.util.StoreHolder'
    ],
    bodyPadding: 4,
    collapsible: true,
    titleCollapse: true,
    //animCollapse: false,
    onSpecialkey: function(field, e) {
        console.log('onEnterKey', this, field);
        var me = this;
        if (e.getKey() == e.ENTER) {
            me.doQuery();
        }
    },
    dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'bottom',
            items: [
                {
                    xtype: 'tbfill'
                },
                {
                    xtype: 'button',
                    itemId: 'reset',
                    text: '重置'
                },
                '-',
                {
                    xtype: 'button',
                    itemId: 'query',
                    text: '查询'
                }
            ]
        }
    ],
    initComponent: function() {
        this.callParent(arguments);
        var me = this,
            toolbar = me.getDockedItems('toolbar')[0],
            reset = toolbar.child('#reset'),
            query = toolbar.child('#query');
        reset.handler = me.reset.bind(me, reset);
        query.handler = me.doQuery.bind(me, query);
    },
    setFields: function(fields) {
        var me = this;
        me.suspendLayout = true;
        me.removeAll();
        var toolbar = me.getDockedItems('toolbar')[0];
        if (Ext.isArray(fields) && fields.length) {
            Ext.each(fields, function(field, idx) {
                fields[idx] = field = Ext.create(Ext.apply(field, {
                    xtype: 'textfield',
                    columnWidth: 0.25
                }));
                me.mon(field, 'specialkey', me.onSpecialkey, me);
            });
            toolbar.show();
        } else {
            toolbar.hide();
        }
        me.suspendLayout = false;
        this.add(fields);
    },
    doQuery: function(btn) {
        var me = this,
            store = me.getStore(),
            values = me.getValues();
        me.fireEvent('query', values);
        store.loadPage(1);
    }
});

Ext.define('Rs.ext.telescope.view.TelescopeGrid', {
    extend: 'Ext.grid.Panel',
    forceFit: true,
    dockedItems: [
        {
            xtype: 'pagingtoolbar',
            displayInfo: false,
            dock: 'bottom',
            items: [
                {
                    xtype: 'tbfill'
                },
                {
                    xtype: 'button',
                    itemId: 'clear',
                    text: '清空'
                },
                '-',
                {
                    xtype: 'button',
                    itemId: 'close',
                    text: '关闭'
                },
                '-',
                {
                    xtype: 'button',
                    itemId: 'ok',
                    text: '确定'
                }
            ]
        }
    ]
});

Ext.define('Rs.ext.telescope.view.TelescopePanel', {
    extend: 'Ext.container.Container',
    xtype: 'rs-telescope-panel',
    requires: [
        'Rs.ext.telescope.store.TeleStore',
        'Rs.ext.telescope.store.TeleMetaStore',
        'Rs.ext.telescope.view.TelescopeForm',
        'Rs.ext.telescope.view.TelescopeGrid'
    ],
    mixins: [
        'Ext.util.StoreHolder'
    ],
    minHeight: 240,
    minWidth: 380,
    height: 320,
    width: 480,
    resizable: {
        pinned: true,
        handles: 'nw se'
    },
    layout: 'border',
    config: {
        progCode: '',
        gridConfig: {}
    },
    privates: {
        conditions: ''
    },
    setConditions: function(conditions) {
        var me = this;
        me.conditions = conditions;
    },
    createStore: function(details) {
        var me = this,
            store,
            fields = [];
        details.each(function(detail) {
            var name = detail.get('field_name'),
                alias = name.split('.').pop();
            fields.push({
                name: name,
                mapping: alias.toUpperCase()
            });
        });
        store = Ext.create('Rs.ext.telescope.store.TeleStore', {
            fields: fields
        });
        me.setStore(store);
        return store;
    },
    createColumns: function(details) {
        var me = this,
            columns = [];
        details.each(function(detail) {
            columns.push({
                minWidth: 100,
                text: detail.get('desc_zh'),
                dataIndex: detail.get('field_name'),
                hidden: detail.get('is_hidden') == 'Y'
            });
        });
        columns = me.initColumns(columns);
        return columns;
    },
    initColumns: function(columns) {
        var me = this;
        columns = [].concat(me.mergeColumns(columns) || []);
        me.afterMergeColumns(columns);
        return columns;
    },
    //列合并策略
    mergeColumns: function(columns) {
        var me = this,
            cols = [],
            mappings = {},
            gridConfig = me.gridConfig || {};
        if (Ext.isArray(gridConfig.columns)) {
            Ext.each(columns, function(col) {
                mappings[col.dataIndex] = col;
            });
            Ext.each(gridConfig.columns, function(col) {
                var idx = col.dataIndex;
                cols.push(Ext.apply(mappings[idx], col));
            });
        } else {
            cols = columns;
        }
        //获取显示的列,用于hash记录
        console.log(cols.length, 'columns===>', cols);
        return cols;
    },
    afterMergeColumns: function(cols) {
        var me = this,
            displayCols = [];
        Ext.each(cols, function(col) {
            var idx = col.dataIndex;
            if (!col.hidden && idx) {
                displayCols.push(idx);
            }
        });
        console.log('displayCols:', displayCols);
        me.displayColumns = displayCols;
    },
    createFields: function(criterias) {
        var me = this,
            fields = [];
        criterias.each(function(criteria) {
            var fieldName = me.handlerSpecialKey(criteria.get('field_name'));
            //console.log(fieldName);
            fields.push({
                name: fieldName,
                emptyText: criteria.get('desc_zh')
            });
        });
        return fields;
    },
    //对特殊字段名的处理如decode(vehicle_name, 'P', '飞机', 'T', '火车', 'S', '轮船') as vehicle_name 
    handlerSpecialKey: function(val) {
        var pattern = ' AS ',
            idx = val.toUpperCase().lastIndexOf(pattern);
        if (idx != -1) {
            val = val.substring(idx + pattern.length);
        }
        return val.trim();
    },
    /*
		var queryItem ={
			
		};
		var specialCode = {
			AS:" AS ",
			as:" as "
		}
		if(value.lastIndexOf(specialCode.AS)!=-1){
			var tempAS = value.split(specialCode.AS);
			queryItem.fieldName = tempAS[0].trim();
			queryItem.itemId = tempAS[1].trim();
			return queryItem;
		}
		else if(value.lastIndexOf(specialCode.as)!=-1){
			var tempas = value.split(specialCode.as);
			queryItem.fieldName = tempas[0].trim();
			queryItem.itemId = tempas[1].trim();
			return queryItem;
		}
		else{
			queryItem.fieldName = value;
			queryItem.itemId = value;
			return queryItem;
		}
		*/
    createSelModel: function() {
        var me = this,
            selModel = me.multiSelect ? {
                mode: 'MULTI',
                checkOnly: false,
                selType: 'checkboxmodel'
            } : {
                mode: 'SINGLE',
                selType: 'rowmodel'
            };
        console.log('multiSelect====>', selModel);
        return selModel;
    },
    createGrid: function(store, columns) {
        var me = this,
            selModel = me.createSelModel();
        var grid = Ext.create('Rs.ext.telescope.view.TelescopeGrid', {
                store: store,
                columns: columns,
                region: 'center',
                selModel: selModel
            });
        me.initGrid(grid);
        return grid;
    },
    initGrid: function(grid) {
        var me = this,
            pagingtbar = grid.getDockedItems('pagingtoolbar')[0],
            ok = pagingtbar.child('#ok'),
            clear = pagingtbar.child('#clear'),
            close = pagingtbar.child('#close');
        ok.setHidden(me.multiSelect ? false : true);
        me.relayEvents(ok, [
            'click'
        ], 'pagingtbar-ok-');
        me.relayEvents(clear, [
            'click'
        ], 'pagingtbar-clear-');
        me.relayEvents(close, [
            'click'
        ], 'pagingtbar-close-');
    },
    createForm: function(store, fields) {
        var me = this,
            form = Ext.create('Rs.ext.telescope.view.TelescopeForm', {
                region: 'north',
                animCollapse: false
            });
        form.setStore(store);
        form.setFields(fields);
        form = me.initForm(form);
        return form;
    },
    initForm: function(form) {
        var me = this;
        form.on('query', me.onFormQuery, me);
        return form;
    },
    onFormQuery: function(values) {
        var me = this,
            fields = [];
        Ext.iterate(values, function(key, value) {
            if (!Ext.isEmpty(value)) {
                fields.push(key + " like '" + value + "%'");
            }
        });
        me.setConditions(fields.join(' and '));
    },
    resetForm: function() {
        var me = this;
        me.form.reset();
    },
    initComponent: function() {
        this.callParent(arguments);
        var me = this,
            progCode = me.progCode;
        var meta = me.meta = Ext.create('Rs.ext.telescope.store.TeleMetaStore', {
                prog_code: progCode
            });
        meta.load({
            params: {
                prog_code: progCode
            },
            callback: function(records) {
                var model = meta.first();
                //grid
                var store, columns, grid;
                var details = model.details();
                if (!Ext.isEmpty(details)) {
                    store = me.createStore(details);
                    columns = me.createColumns(details);
                    grid = me.createGrid(store, columns);
                    me.relayEvents(store, [
                        'load'
                    ], 'store-');
                    me.relayEvents(grid, [
                        'deselect',
                        'beforeselect',
                        'select'
                    ], 'grid-');
                }
                //form
                var form, fields,
                    head = model.getHead(),
                    criterias = model.criterias();
                if (!Ext.isEmpty(criterias)) {
                    fields = me.createFields(criterias);
                }
                console.log('fields:', fields);
                form = me.createForm(store, fields);
                if (!Ext.isEmpty(head)) {
                    form.setTitle(head.get('prog_name') || '');
                }
                me.grid = grid;
                me.form = form;
                me.add([
                    grid,
                    form
                ]);
                store.loadPage(1);
                me.show();
            }
        });
    },
    refresh: function() {
        var me = this,
            store = me.getStore();
        if (store && !store.isLoading()) {
            store.loadPage(1);
        }
    },
    getStoreListeners: function(store) {
        var me = this;
        return {
            beforeload: me.onBeforeload
        };
    },
    onBeforeload: function(store, operation) {
        var me = this,
            conditions = me.conditions,
            params = operation.getParams();
        conditions = Ext.valueFrom(conditions, ' 1 = 1 ');
        conditions = me.buildProgCondtion(conditions);
        operation.setParams(Ext.apply({}, {
            prog_code: me.progCode,
            prog_condition: conditions
        }, params));
    },
    buildProgCondtion: Ext.identityFn
});

Ext.define('Rs.ext.telescope.Telescope', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.telescope',
    requires: [
        'Rs.ext.telescope.view.TelescopePanel'
    ],
    isTelescope: true,
    matchFieldWidth: false,
    config: {
        /**
		 * @cfg {String} progCode
		 * 望远镜编码
		 */
        progCode: null,
        /**
		 * @cfg {Function} buildProgCondtion
		 * 望远镜动态条件处理
		 */
        buildProgCondtion: Ext.identityFn,
        /**
		 * @cfg {String} displayField
		 * 望远镜的显示字段
		 */
        displayField: '',
        /**
		 * @cfg {String} valueField
		 * 望远镜的反填值字段
		 */
        valueField: '',
        /**
		 * @cfg {Boolean} multiSelect
		 * 是否允许多选 (默认为false, 即单选望远镜)
		 */
        multiSelect: false,
        /**
		 * @cfg {String} separator
		 * 多选望远镜的分割字符串, 默认为: ,
		 */
        separator: ',',
        /**
		 * @cfg {Object} gridConfig
		 * 望远镜的grid面板配置
		 */
        gridConfig: {},
        /**
		 * @cfg {Object} panelConfig
		 * 望远镜的弹出面板配置
		 */
        panelConfig: {},
        /**
		 * @cfg {Boolean} forceSelection
		 * true:  限制望远镜的值来源于列表 (默认值)
		 * false: 允许用户手动输入望远镜的值
		 */
        forceSelection: true,
        /**
		 * @cfg {Boolean} recordPreSelection
		 * true: 默认高亮上一次选中值(默认值)
		 * false: 取消高亮
		 */
        recordPreSelection: false,
        /**
		 * @cfg {Boolean} autoBackfill
		 * true: 当查询结果只有一条时, 自动将该值反填到单选望远镜
		 * false: 取消自动反填(默认值)
		 */
        autoBackfill: false
    },
    selection: [],
    previousValue: [],
    internelId: 'telescope-model-id',
    setSelection: function(models) {
        var me = this,
            selection = [];
        Ext.each(models, function(model) {
            model.isModel && selection.push(model);
        });
        me.selection = selection;
    },
    getSelection: function() {
        var me = this;
        return me.selection;
    },
    initComponent: function() {
        var me = this;
        me.callParent();
        me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);
        me.cached = Ext.create('Ext.util.Collection', {
            keyFn: function(record) {
                return record[me.internelId];
            }
        });
    },
    //Override
    setValue: function(value, isModel) {
        var me = this,
            values = [],
            displays = [],
            selection = [],
            sp = me.separator;
        if (Ext.isArray(value)) {
            var models = value;
            Ext.each(models, function(model) {
                if (Ext.isObject(model) && model.isModel) {
                    selection.push(model);
                }
                model = me.doBeforeSetValue(model);
                values.push(model[0]);
                displays.push(model[1]);
            });
            me.setSelection(selection);
            me.callParent([
                values.join(sp)
            ]);
            me.setRawValue(displays.join(sp));
        } else {
            value = Ext.isEmpty(value) ? [] : [
                value
            ];
            return me.setValue(value, isModel);
        }
        me.previousValue = value;
    },
    doBeforeSetValue: function(model) {
        var me = this;
        if (Ext.isObject(model) && model.isModel) {
            var vf = me.valueField,
                df = me.displayField;
            return [
                model.get(vf),
                model.get(df)
            ];
        } else {
            return [
                model,
                model
            ];
        }
    },
    //Override
    getValue: function() {
        var me = this;
        return me.value;
    },
    /**
	 * onFocusLeave主要用于支持可编辑望远镜.
	 * 通过对已选记录和文本框的原始值,来设置望远镜的编辑状态
	 */
    onFocusLeave: function(e) {
        var me = this,
            value = me.getValue(),
            raw = me.getRawValue();
        me.doQueryTask.cancel();
        if (me.mutated) {
            if (me.forceSelection) {
                me.setValue(me.previousValue);
            } else {
                me.setValue(raw);
            }
            me.mutated = false;
        }
        if (Ext.isEmpty(raw) && !Ext.isEmpty(value)) {
            me.setValue(raw);
        }
        me.callParent(arguments);
    },
    createPicker: function() {
        var me = this,
            picker;
        picker = Ext.create(Ext.apply({
            id: me.id + '-picker',
            hidden: true,
            floating: true
        }, //draggable: true
        {
            xtype: 'rs-telescope-panel',
            pickerField: me,
            progCode: me.progCode,
            gridConfig: me.gridConfig,
            multiSelect: me.multiSelect,
            buildProgCondtion: me.buildProgCondtion.bind(me)
        }, me.panelConfig));
        picker.on({
            scope: me,
            'grid-select': me.onSelect,
            'grid-deselect': me.onDeselect,
            'store-load': me.onStoreLoad,
            'pagingtbar-ok-click': me.onOk,
            'pagingtbar-clear-click': me.onClear,
            'pagingtbar-close-click': me.onClose
        });
        if (!me.multiSelect) {
            picker.on('grid-select', me.onSingleSelect, me);
        }
        return picker;
    },
    //hash策略
    identifier: function(model) {
        var me = this,
            picker = me.picker,
            identifier = [];
        Ext.each(picker.displayColumns, function(name) {
            identifier.push(model.get(name));
        });
        return identifier.join();
    },
    onSelect: function(selModel, model) {
        var me = this,
            cached = me.cached,
            id = me.identifier(model);
        if (!cached.containsKey(id)) {
            model[me.internelId] = id;
            cached.add(model);
        }
    },
    onDeselect: function(selModel, model) {
        var me = this,
            cached = me.cached,
            id = me.identifier(model);
        if (cached.containsKey(id)) {
            model[me.internelId] = id;
            cached.remove(model);
        }
    },
    onOk: function() {
        var me = this,
            cached = me.cached,
            records = cached.getRange();
        if (me.fireEvent('ok', me, records) != false) {
            me.setValue(records, true);
            me.collapse();
        }
    },
    onClear: function() {
        var me = this;
        me.setValue([], true);
        me.cached.removeAll();
        me.highlightSelection([]);
        if (!me.forceSelection) {
            me.focus();
        }
        me.fireEvent('clear', me);
    },
    onClose: function() {
        var me = this;
        if (me.fireEvent('close', me) != false) {
            me.collapse();
        }
    },
    onStoreLoad: function(store, records) {
        var me = this,
            selection = [],
            cached = me.cached,
            rawValue = me.getRawValue();
        if (me.recordPreSelection) {
            Ext.each(records, function(record) {
                var id = me.identifier(record);
                if (cached.containsKey(id)) {
                    record[me.internelId] = id;
                    selection.push(record);
                }
            });
            if (!Ext.isEmpty(selection)) {
                me.syncSelection(selection);
                me.highlightSelection(selection);
            }
        }
        if (me.autoBackfill && !me.multiSelect && me.forceSelection) {
            //如果返回结果只有一条记录,则直接反填.
            //(当且仅当该望远镜为可自动反填,不允许手动输入的单选望远镜.)
            if (records && records.length == 1) {
                if (!me.expandFromTrigger && !Ext.isEmpty(rawValue)) {
                    me.setValue(store.first(), true);
                    me.collapse();
                }
            }
        }
    },
    syncSelection: function(selection) {
        var me = this,
            cached = me.cached;
        cached.add(selection);
        me.setSelection(cached.getRange());
    },
    highlightSelection: function(selection) {
        var me = this,
            grid = me.picker.grid;
        if (Ext.isEmpty(selection)) {
            selection = false;
        }
        if (grid && grid.rendered) {
            grid.suspendEvent('select', 'deselect');
            grid.setSelection(selection);
            grid.resumeEvent('select', 'deselect');
        }
    },
    //单选模式
    onSingleSelect: function(selModel, record) {
        var me = this,
            valueField = me.valueField,
            displayField = me.displayField;
        if (me.fireEvent('beforeselect', me, record) != false) {
            me.fireEvent('select', me, record, selModel);
            me.lastDisplayValue = record.get(displayField);
            me.setValue(record, true);
            me.collapse();
        }
    },
    onCollapse: function() {
        var me = this;
        me.expandFromTrigger = false;
        me.callParent(arguments);
        var picker = me.picker;
        picker.resetForm();
    },
    onExpand: function() {
        var me = this,
            cached = me.cached,
            selection = me.selection;
        cached.removeAll().add(selection);
        me.callParent(arguments);
    },
    onTriggerClick: function() {
        var me = this,
            picker = me.picker;
        me.expandFromTrigger = true;
        if (picker) {
            picker.setConditions('');
            picker.refresh();
        }
        me.callParent(arguments);
    },
    onFieldMutation: function(e) {
        var me = this;
        me.callParent([
            e
        ]);
        if (e.type == 'keyup') {
            me.mutated = true;
            if (!me.readOnly && me.editable) {
                me.doQueryTask.delay(500);
            }
        }
    },
    doRawQuery: function() {
        var me = this,
            rawValue = me.getRawValue();
        me.doQuery(rawValue, false, true);
    },
    doQuery: function(rawValue) {
        var me = this,
            picker,
            vf = me.valueField,
            df = me.displayField,
            conditions,
            fields = [];
        me.expand();
        picker = me.picker;
        if (!Ext.isEmpty(rawValue)) {
            Ext.each([
                vf,
                df
            ], function(field) {
                fields.push(field + " like '" + rawValue + "%'");
            });
            conditions = '(' + fields.join(' or ') + ')';
        }
        picker.setConditions(conditions);
        picker.refresh();
    }
});

Ext.define('Rs.ext.toolbar.FormPaging', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'formpagingtoolbar',
    alternateClassName: 'Ext.FormPagingToolbar',
    requires: [
        'Ext.toolbar.TextItem'
    ],
    displayInfo: true,
    prependButtons: true,
    initComponent: function() {
        var me = this,
            userItems = me.items || me.buttons || [],
            pagingItems;
        pagingItems = me.getPagingItems();
        if (me.prependButtons) {
            me.items = userItems.concat(pagingItems);
        } else {
            me.items = pagingItems.concat(userItems);
        }
        me.callParent();
    },
    getPagingItems: function() {
        var me = this,
            inputListeners = {
                scope: me,
                blur: me.onPagingBlur
            };
        inputListeners[Ext.supports.SpecialKeyDownRepeat ? 'keydown' : 'keypress'] = me.onPagingKeyDown;
        return [
            '->',
            {
                itemId: 'prev',
                iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
                disabled: false,
                handler: me.movePrevious,
                scope: me
            },
            {
                disabled: true,
                width: 30
            },
            {
                itemId: 'next',
                iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
                disabled: false,
                handler: me.moveNext,
                scope: me
            },
            {
                disabled: true,
                width: 50
            },
            {
                itemId: 'add',
                iconCls: 'addAction-button-item',
                disabled: false,
                handler: me.addRecord,
                scope: me
            },
            {
                disabled: true,
                width: 50
            },
            {
                itemId: 'delete',
                iconCls: 'deleteAction1-button-item',
                disabled: false,
                handler: me.removeRecord,
                scope: me
            },
            {
                disabled: true,
                width: 50
            }
        ];
    },
    addRecord: function() {
        var me = this,
            formPanel = me.up();
        formPanel.addNewRecord();
    },
    removeRecord: function() {
        var me = this,
            formPanel = me.up();
        formPanel.removeRecord();
    },
    movePrevious: function() {
        var me = this,
            formPanel = me.up();
        if (formPanel.page === 0 || Ext.isEmpty(formPanel.page)) {
            return false;
        }
        formPanel.page = formPanel.page - 1;
        //var formRecordData = Ext.getStore(formPanel.store).getAt(formPanel.page);
        var items = formPanel.items.items;
        Ext.each(items, function(item) {
            item.setValue();
        });
        var loadRecord = Ext.getStore(formPanel.store).data.items[formPanel.page];
        if (Ext.isEmpty(loadRecord)) {
            formPanel.page += 1;
            return false;
        }
        formPanel.loadRecord(loadRecord);
    },
    moveNext: function() {
        var me = this,
            formPanel = me.up();
        if (Ext.isEmpty(formPanel.page) || Ext.getStore(formPanel.store).data.length === 0 || formPanel.page === Ext.getStore(formPanel.store).data.length - 1) {
            //if(formPanel.insertFlag){
            //    formPanel.page+=1;
            //    formPanel.addNewRecord();
            //}
            return false;
        }
        formPanel.page = formPanel.page + 1;
        var formRecordData = Ext.getStore(formPanel.store).data.items[formPanel.page];
        //var formRecordData = Ext.getStore(formPanel.store).getAt(formPanel.page);
        var items = formPanel.items.items;
        Ext.each(items, function(item) {
            item.setValue();
        });
        formPanel.loadRecord(formRecordData);
    }
});

Ext.define('Rs.ext.toolbar.Paging', {
    extend: 'Ext.toolbar.Paging',
    xtype: 'rs-pagingtoolbar',
    displayInfo: true,
    prependButtons: true,
    initComponent: function() {
        var preItem,
            me = this;
        me.callParent();
        if (me.displayInfo) {
            var items = me.items;
            items.eachKey(function(key, item) {
                if (key == 'displayItem') {
                    items.removeAll([
                        preItem,
                        item
                    ]);
                    items.insert(0, [
                        item,
                        preItem
                    ]);
                    return false;
                }
                preItem = item;
            });
        }
    },
    getPagingItems: function() {
        var me = this,
            pagingItems = me.callParent();
        pagingItems.unshift('->');
        return pagingItems.slice(0, -2);
    }
});

