Ext.define('Rs.ext.overrides.field.Text', {
    override: 'Ext.field.Text',
    /**
     * 目前针对已知情况只过滤的英文字符中' 单引号
     */
    maskRe: new RegExp('[^\']'),
    stripCharsRe: new RegExp('[\']', 'gi')
});

/**
 * @class Rs.ext.window.MessageAlert
 * @extends Ext.window.MessageBox
 * @author LiGuangqiao
 * 自定义提示框
 */
Ext.define('Rs.ext.window.MessageAlert', {
    extend: 'Ext.MessageBox',
    alias: 'widget.msgalert',
    closable: false,
    initialize: function() {
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
            cfg.modal = true;
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
                //buttons: cfg.buttons,
                //buttonText: cfg.buttonText,
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
            //监听提示框失焦事件
            //点击外部提示框关闭
            me.on('focusleave', function() {
                if (!Ext.isEmpty(task)) {
                    runner.stop(task);
                }
                me.close();
            });
            //监听提示框失焦事件
            //点击外部提示框关闭
            me.on('blur', function() {
                if (!Ext.isEmpty(task)) {
                    runner.stop(task);
                }
                me.close();
            });
            var a = me.show(cfg.title);
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
        //监听键盘按下事件
        //任意键盘按下关闭提示框
        if (!Ext.isEmpty(me.getFocusEl())) {
            me.getFocusEl().on({
                keydown: function() {
                    if (!Ext.isEmpty(task)) {
                        runner.stop(task);
                    }
                    me.close();
                }
            });
        }
        /**
		* 实现点击alert面板其他部分，面板消失；
		* 需触发facusleave事件，但实际中弹出框未能触发focuse，进而focusleave也没触发；
		* 这里折中的办法是：给整个dom添加了click事件，去触发事件focusleave
		**/
        document.onclick = function(docEl) {
            if (!Ext.Array.contains(docEl.srcElement.classList, "x-messagebox-body-el") && !Ext.Array.contains(docEl.srcElement.classList, "x-innerhtml") && !Ext.Array.contains(docEl.srcElement.classList, "x-text-el") && !Ext.Array.contains(docEl.srcElement.classList, "x-messageboxtitle") && !Ext.Array.contains(docEl.srcElement.classList, "x-toolbar-body-el")) {
                me.fireEvent("focusleave");
            }
        };
        if (Ext.isEmpty(me.hasFocusLeave)) {
            me.on('focusleave', function() {
                me.hasFocusLeave = true;
                if (!Ext.isEmpty(task)) {
                    runner.stop(task);
                }
                me.close();
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
        //var temp = 0;
        Ext.each(errorCodes, function(errCode) {
            errMsg = me.getErrorMsg(errCode);
            console.log(errMsg);
            errors.push({
                code: errCode,
                msg: errMsg["ZH"]
            });
        });
        //Rs.LANG.toUpperCase()]
        win.store.setData(errors);
        win.show();
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
        win = Ext.create('Ext.Dialog', {
            //width: 200,
            height: 200,
            layout: 'fit',
            closable: false,
            //closeAction: 'hide',
            defaultFocus: '#itemId',
            //bodyPadding: 30,
            maxWidth: 300,
            //padding:1,
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
                    id: 'itemId',
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
        console.log(win.store);
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
            store = grid.getStore(),
            records = me.records[grid.id],
            record = store.getById(records[0].uuid),
            column = grid.getColumnForField(records[0].checkField[0]),
            editing = grid.findPlugin("gridcellediting");
        editing.startEdit(record, column);
    },
    focusOfCard: function(card, el) {
        el.focus();
    },
    getMarkElsOfGrid: function(grid, errArr) {
        //var record, rowEl,// selectors,
        //    view = grid.getView(),
        //    store = grid.getStore(),
        //    els = new Ext.CompositeElementLite(null, true);
        var els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function(item) {
            //selectors = [];
            //record = store.getById(item.uuid);
            //rowEl = Ext.fly(view.getRow(record));
            //Ext.getCmp('myPanelId').getItemAt(1).cells[3].setStyle({background:'yellow'})
            //var rowEl = grid.getItemAt(record.data.ROWNUM_).el;
            //console.log(rowEl);
            Ext.each(item.checkField, function(field) {
                //selectors.push('div[data-componentid='+field +']');
                //var rowNum = Number(record.data.ROWNUM_);
                var rowNum = item.index;
                //var cell = Ext.ComponentQuery.query('#'+field)[rowNum].element;
                var cell = grid.getColumnForField(field).getCells()[rowNum].element;
                els.add(cell);
            });
        });
        return els;
    },
    getMarkElsOfCard: function(card, errArr) {
        var els = new Ext.CompositeElementLite(null, true);
        Ext.each(errArr, function(item) {
            Ext.each(item.checkField, function(field) {
                els.add(card.down('#' + field).inputElement);
            });
        });
        return els;
    },
    markStyle: function(els) {
        Ext.each(els.elements, function(item) {
            item.style.background = "#ffdfd7";
        });
    },
    //els.applyStyles({ background: '#ffdfd7', zIndex:"1"});
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
    Ext.require([
        'Rs.ext.overrides.field.Text',
        'Rs.ext.window.MessageAlert',
        'Rs.ext.util.Marker'
    ]);
    var man = Ext.manifest,
        locale = man.locale;
    Ext.Loader.loadScript({
        url: man.paths['Rs.ext'] + '/../locale/' + locale + '/rs-ext-locale-' + locale + '.js'
    });
}());

/**
 * @class Rs.ext.button.RsButton
 * @extends Ext.button.Button
 * @author ZanShuangpeng
 * RsButton
 */
Ext.define('Rs.ext.button.RsButton', {
    extend: 'Ext.Button',
    alias: 'widget.rsbutton',
    //_btnCls: Ext.baseCSSPrefix + 'btn-RsButton',
    //overCls: Ext.baseCSSPrefix + 'btn-RsOver',
    //_pressedCls: Ext.baseCSSPrefix + 'btn-RsPressed',
    initialize: function() {
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
    }
});
/*,
	onMouseOver: function(e) {
        var me = this;
		me.el.dom.style.background='linear-gradient(#F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)';
		me.el.dom.style.borderColor='#7EA9E2';
        if (!me.disabled && !e.within(me.el, true, true)) {
            me.onMouseEnter(e);
        }
    },
	
	onMouseOut: function(e) {
        var me = this;
		me.el.dom.style.background='linear-gradient(#e4f3ff 45%,#c3d9f3 50%,#c9dffa 90%,#d7ecff 95%)';
		me.el.dom.style.borderColor='#aac8f1';
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
		me.el.dom.style.background='linear-gradient(#BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)';
		me.el.dom.style.borderColor='#99BBE8';
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
                if (me.destroying || me.destroyed ||
                    (Ext.Element.getActiveElement() !== activeEl) || !me.canFocus()) {
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
		me.el.dom.style.background='linear-gradient(#F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)';
		me.el.dom.style.borderColor='#aac8f1';
        // If the external mouseup listener of the ButtonManager fires after the button
        // has been destroyed, ignore.
        if (!me.destroyed && e.button === 0) {
            if (!me.pressed) {
                me.removeCls(me._pressedCls);
            }
        }
    }*/

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
            record = [],
            //canRemoved用于确定关联面板需不需清空前面板数据，当新数据为空时清除，非空时不清除
            canRemoved;
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
                if (!Ext.Object.isEmpty(me.noRelationStaticDataObj)) {
                    record = me.noRelationStaticDataObj[page];
                }
            }
            if (record.length === 0) {
                canRemoved = true;
            } else {
                canRemoved = false;
            }
            me.currentPage = page;
            me.setData(record);
            options = Ext.apply({
                page: page,
                start: (page - 1) * size,
                limit: size,
                addRecords: true,
                canRemoved: canRemoved
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
	 * @Rs.ext.field.plugin.ControlStatusPlugin
	 * @extends Ext.plugin.Abstract
	 * @author 
	 * 后台业务状态控制插件
	 */
Ext.define('Rs.ext.field.plugin.ControlStatusPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.controlstatus',
    requires: 'Ext.field.Field',
    configs: {
        panelId: '',
        controlObj: '',
        errorCode: '',
        tipType: ''
    },
    init: function() {
        var me = this;
        var component = me.getCmp();
        var obj = me.config.controlObj;
        if (obj) {
            for (var i = 0; i < obj.length; i++) {
                (function() {
                    var queryStr = obj[i];
                    var reg = /\[(.*?)\]/gi;
                    var tmp = queryStr.match(reg);
                    if (tmp && tmp.length == 1) {
                        var fieldId = tmp[0].replace(reg, "$1");
                        Ext.getCmp(fieldId).on('blur', function(cmp) {
                            var sql = queryStr.replace(tmp[0], cmp.getValue());
                            me.formFieldsControlStatus(sql, fieldId, cmp.getValue());
                        });
                    }
                })();
            }
        }
    },
    formFieldsControlStatus: function(sql, fieldId, value) {
        if (!value) {
            return false;
        }
        var params = {};
        var index = sql.toUpperCase().indexOf('FROM');
        sql = sql.slice(0, index) + ' AS COUNT ' + sql.slice(index);
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
                } else {
                    var count = data[0]['COUNT'];
                    if (count < 1) {
                        Ext.getCmp(fieldId).setValue();
                    }
                }
            },
            failure: function(response, opts) {
                Ext.getCmp(fieldId).setValue();
                console.log("系统提示", "服务器未连接");
            }
        });
    }
});

/**
 * @class Rs.ext.form.PagePanel
 * @extends Ext.form.Panel
 * @author Zanshuangpeng
 * ��Ƭҳ��壻����pc���޸ģ�
 *
 * ****
 * ���ݼ��أ�ͨ�� initialize-->loadRecord ��store��������ݼ���ҳ��
 * �����޸ģ���ʼ��ʱ�������� startPolling ѭ���¼���ÿ��500ms��ҳ���޸�����д��store��
 * ****
 */
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
         *������ʱĬ������;���ά�����棬��Ϊtrueʱ��ά�����������������ݡ�����*ά��������Ӳ���ȥ����
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
    layout: 'auto',
    bodyAriaRole: 'form',
    initialize: function() {
        var me = this;
        if (Ext.isEmpty(me.insertFlag)) {
            me.insertFlag = false;
        }
        this.callParent();
        this.element.on('submit', 'onSubmit', this);
        if (me.store) {
            var store = Ext.getStore(me.store);
            var model = store.model;
            var idProperty = Ext.create('Ext.field.Text', {
                    name: model.idProperty,
                    hidden: true
                });
            // me.items.items.push(idPropertys);
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
            me.startPolling(500);
        }
    },
    //store.add({});
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
     * Loads an {@link Ext.data.Model} into this form by calling {@link #setValues} with the
     * {@link Ext.data.Model#getData record data}. The fields in the model are mapped to 
     * fields in the form by matching either the {@link Ext.form.field.Base#name} or
     * {@link Ext.Component#itemId}.  See also {@link #trackResetOnLoad}. 
     * @param {Ext.data.Model} record The record to load
     * @return {Ext.form.Basic} this
     */
    loadRecord: function(record) {
        this._record = record;
        return this.setValues(record.getData());
    },
    /**
     * Returns the last Ext.data.Model instance that was loaded via {@link #loadRecord}
     * @return {Ext.data.Model} The record
     */
    getRecord: function() {
        return this._record;
    },
    /**
	* lined at @Ext.form.Basic-method-updateRecord
	*/
    updateRecord: function(record) {
        record = record || this._record;
        if (!record) {
            Ext.raise("A record is required.");
            return this;
        }
        // eslint-disable-next-line vars-on-top
        var fields = record.self.fields,
            values = this.getValues(),
            obj = {},
            i = 0,
            len = fields.length,
            name;
        for (; i < len; ++i) {
            name = fields[i].name;
            if (values.hasOwnProperty(name)) {
                obj[name] = values[name];
            }
        }
        record.beginEdit();
        record.set(obj);
        record.endEdit();
        return this;
    },
    /**
     * Forces each field within the form panel to
     * {@link Ext.form.field.Field#checkChange check if its value has changed}.
     */
    checkChange: function() {
        var fields = this._record,
            f;
        // for (f = 0; f < fLen; f++) {
        // fields[f].checkChange();
        // }
        if (this.isDirty()) {
            var record = this._record;
            if (Ext.isEmpty(record)) {
                if (this.insertFlag) {
                    this.addNewRecord();
                } else {
                    return false;
                }
            }
            this.updateRecord(this._record);
        } else {
            var record = this._record;
            if (!Ext.isEmpty(record) && !Ext.isEmpty(record.crudState) && !Ext.isEmpty(record.modified)) {
                if (record.crudState === 'U') {
                    //this.revertModified(this.getRecord());
                    this.updateRecord(this._record);
                } else if (record.crudState === 'C') {
                    this.updateRecord(this._record);
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
    extend: 'Ext.field.Text',
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
    initialize: function() {
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

/**
 * @class Rs.ext.form.field.TimeInputField
 * @extends Ext.form.field.Text
 * @author LiGuangqiao
 * 复选框
 */
Ext.define('Rs.ext.form.field.RsCheckBox', {
    extend: 'Ext.field.Checkbox',
    alias: 'widget.rscheckbox',
    /*setValue: function(checked) {
        var me = this,
            boxes, i, len, box;
        checked = checked=='Y'?true:false;
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
        return me?'Y':'N';
    }*/
    checkedRe: /^(true|1|on|Y)/i,
    updateChecked: function(checked, oldChecked) {
        var me = this,
            eventName;
        if (!me.$onChange) {
            me.inputElement.dom.checked = checked;
        }
        checked = checked == 'Y' ? true : false;
        me.toggleCls(me.checkedCls, checked);
        checked = checked == true ? 'Y' : 'N';
        if (me.initialized) {
            eventName = checked ? 'check' : 'uncheck';
            me.fireEvent(eventName, me);
            me.fireEvent('change', me, checked, oldChecked);
        }
        me.setDirty(me.isDirty());
    },
    applyChecked: function(checked) {
        var me = this;
        if (this.isConfiguring) {
            this.originalState = checked;
        }
        return !!this.checkedRe.test(String(checked)) ? 'Y' : 'N';
    }
});

/**
 * @class Rs.ext.form.field.TimeInputField
 * @extends Ext.form.field.Text
 * @author LiGuangqiao
 * 时间控件
 */
Ext.define('Rs.ext.form.field.TimeInputField', {
    extend: 'Ext.field.Text',
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
    initialize: function() {
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

Ext.define("Rs.ext.grid.RelationGridPanel", {
    extend: "Ext.grid.Grid",
    xtype: "relation-grid",
    isRelationGrid: true,
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
    relationGridPanelId: "",
    relationGridQueryFieldArray: [],
    relationGridStoreSet: {},
    relationGridPanelAutoLoad: true,
    moreRelationGridObj: {},
    clickAutoLoadRelationGridPanel: true,
    isAddWhileNoRecords: true,
    initialize: function() {
        var me = this;
        me.callParent();
        me.on('painted', function(grid, el) {
            var thisStore = grid.getStore(),
                thisCachedStore = thisStore.getCachedStore(),
                columnsArray = grid.getColumns(),
                actionColumn;
            Ext.each(columnsArray, function(column, index, myself) {
                if (column.xtype === "rsactioncolumn") {
                    actionColumn = column;
                }
                if (column.xtype === "rs-action-column-restricted") {
                    actionColumn = column;
                    grid.actionColumn = actionColumn;
                }
            });
            thisStore.on('load', function(store, records, successful, operation, eOpts) {
                console.log(successful, operation, "<-------------", grid.id);
                grid.synchroAddDefaultValue(grid, actionColumn, store, store, successful, operation, grid.isAddWhileNoRecords);
            });
            thisCachedStore.on('load', function(store, records, successful, operation, eOpts) {
                grid.synchroAddDefaultValue(grid, actionColumn, store.getDynamicStore(), store, successful, operation, grid.isAddWhileNoRecords);
            });
            if (!Ext.isEmpty(grid.relationGridPanelId)) {
                var obj = grid.getRelationObj(grid.relationGridPanelId, grid.relationGridQueryFieldArray);
                grid.relationGridHandler(grid, thisStore, obj);
                if (!Ext.Object.isEmpty(grid.moreRelationGridObj)) {
                    Ext.Object.eachValue(grid.moreRelationGridObj, function(tempObj) {
                        var temp = grid.getRelationObj(tempObj.relationGridPanelId, tempObj.relationGridQueryFieldArray);
                        grid.relationGridHandler(grid, thisStore, temp);
                    });
                }
            }
        });
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
    /**
     *同步操作列的默认值
     *@method synchroAddDefaultValue
     */
    synchroAddDefaultValue: function(grid, actionColumn, dynamicStore, currentStore, successful, operation, isAddWhileNoRecords) {
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
     *关联面板处理逻辑
     *@method relationGridHandler
     */
    relationGridHandler: function(grid, thisStore, obj) {
        //点击上帧行记录，加载下帧数据
        grid.clickLoadRelationGrid(grid, obj);
        // 默认下帧展示按第一行记录条件查询结果的第一页
        thisStore.on('load', function(store, recordArray, successful, operation) {
            var record = store.getRange();
            if (grid.relationGridPanelAutoLoad && !Ext.isEmpty(record)) {
                grid.autoLoadRelationPanel(grid, obj, record[0]);
            }
            if (Ext.isEmpty(record)) {
                obj.relationGridPanel.getStore().removeAll();
            }
        });
        thisStore.fireEvent("load", thisStore, thisStore.getRange(), true, {
            success: true
        });
        thisStore.getCachedStore().on('load', function(store, recordArray, successful, operation) {
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
        thisStore.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                //console.log(operation,details,eOpts)
                grid.syncWhenDataUpdate(grid, obj, record, operation, modifiedFieldNames);
            }
        });
        thisStore.getCachedStore().on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
            if (!Ext.isEmpty(modifiedFieldNames)) {
                grid.syncWhenDataUpdate(grid, obj, record, operation, modifiedFieldNames);
            }
        });
    },
    syncWhenDataUpdate: function(grid, obj, record, operation, modifiedFieldNames) {
        var field = modifiedFieldNames[0],
            relationModifiedFieldNames = [],
            recordArray, relationRecord;
        if (grid.isArrayHaveField(obj.relationGridQueryFieldArray, field) && !Ext.isEmpty(field)) {
            if (!Ext.isEmpty(obj.cachedStore.getRelationStaticDataArry())) {
                Ext.each(obj.cachedStore.getRelationStaticDataArry(), function(recordObj) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === obj.cachedStore.currentPage && recordObj["queryRecord"] === record) {
                        recordArray = tempRecord.data;
                    }
                });
                var tempField;
                if (grid.isArrayItemObj(obj.relationGridQueryFieldArray)) {
                    Ext.each(obj.relationGridQueryFieldArray, function(fieldName, index, array) {
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
    clickLoadRelationGrid: function(grid, obj) {
        grid.on('childtap', function(thisGrid, gridLocation) {
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
    autoLoadRelationPanel: function(gridPanel, obj, record, fn, flag) {
        //console.log("record", record);
        Ext.each(obj.relationGridQueryFieldArray, function(fieldName, index, array) {
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
            callback: function() {}
        });
    }
});

/**
 * @class Rs.ext.grid.column.RsAction
 * @extends Ext.grid.column.Action
 * @author ZanShuangpeng、LiGuangqiao
 * 操作列
 */
Ext.define('Rs.ext.grid.column.RsAction', {
    extend: 'Ext.grid.column.Column',
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
    initialize: function() {
        var me = this;
        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
    },
    /*
        me.onAfter('initialize', function () {
			console.log("after initialize");
            me.initMenu();
           Ext.each(me.items, function (item, index) {
                if (index >= 4) {
                    item.hidden = true;
                }
            });
            me.items[0] = {
                disabled: true
                //hidden: true
            };
            me.items[1] = {
                altText: me.addAltText,
                iconCls: 'addAction-button-item',
                icon: me.addIcon,
                disabled: me.addDisabled,
                hidden: me.addHidden,
                tooltip: me.addToolTip,
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
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
                handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                    me.deleteHandler(grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue);
                }
            };
            if (me.items.length >= 5) {
                me.items[3] = {
                    iconCls: 'moreAction-button-item',
                    handler: function (grid, rowIndex, colIndex, item, e, record, row) {
                        var itemDom = row.getElementsByClassName("moreAction-button-item")[0];
                        me.Menu.alignTo(itemDom);
						//console.log("itemDom:",itemDom);
                        //避免bind时嵌套死循环
                        Ext.each(me.items, function (selfItem, index) {
                            if (index >= 4) {
                                if (!Ext.isEmpty(selfItem.fn)) {
                                    var handlerFn = Ext.Function.bind(selfItem.fn, this, [grid, rowIndex, colIndex, item, e, record, row], false),
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
        })*/
    // 参考 /docs/ext-7.2.0/build/examples/kitchensink/?modern#array-grid
    cell: {
        tools: {
            approve: {
                iconCls: 'addAction-button-item',
                handler: function(grid, obj) {
                    var me = obj.column;
                    var rowIndex = obj.cell.row._recordIndex;
                    var colIndex, item, e, record, row;
                    record = obj.record;
                    row = obj.cell.row;
                    me.addHandler(grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue);
                }
            },
            decline: {
                iconCls: 'deleteAction1-button-item',
                handler: function(grid, obj) {
                    var me = obj.column;
                    var rowIndex = obj.cell.row._recordIndex;
                    var colIndex, item, e, record, row;
                    record = obj.record;
                    row = obj.cell.row;
                    me.deleteHandler(grid, rowIndex, colIndex, item, e, record, row, me.addDefaultValue);
                },
                weight: 1
            }
        }
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
            Ext.get(row.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon deleteAction2-button-item')).replaceCls('deleteAction2-button-item', 'deleteAction1-button-item');
        } else // Ext.get(row.getElementsByClassName('x-tool-zone x-head')).replaceCls('deleteAction2-button-item','deleteAction1-button-item');
        {
            if (!Ext.isEmpty(record.crudState) && record.crudState == 'C' && record.phantom) {
                if (grid.store.data.length > 1) {
                    grid.store.remove(record);
                }
            } else {
                record.deleteFlag = 'D';
                Ext.get(row.renderElement.dom.getElementsByClassName('x-icon-el x-font-icon deleteAction1-button-item')).replaceCls('deleteAction1-button-item', 'deleteAction2-button-item');
            }
        }
    }
});
//row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src = '../../../resources/images/del_press.png'		
//Ext.get(row.getElementsByClassName('x-tool-zone x-head')).replaceCls('deleteAction1-button-item','deleteAction2-button-item');

/**
 * @class Rs.ext.grid.column.RsUpDownloadAction
 * @extends Ext.grid.column.Action
 * @author LiGuangqiao
 * 上传操作列
 */
Ext.define('Rs.ext.grid.column.RsUpDownloadAction', {
    extend: 'Ext.grid.column.Column',
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
         *@cfg {boolean} isUploadThumb
         *上传缩略图（小图标）模式开关
         */
        isUploadThumb: false,
        /**
         *@cfg {boolean} SynchronizedToSavePlugin
         *上传逻辑同步到点击保存插件的保存按钮
         */
        SynchronizedToSavePlugin: false,
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
         *@cfg {function} thumbUploadSuccess
         *缩略图上传成功回调函数
         * @params {string} rowIndex 行号
         * @params {string} thumbData 缩略图base64数据
         */
        thumbUploadSuccess: function(rowIndex, thumbData) {},
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
    fileAccept: "/*",
    limitFileSize: "100m",
    isMultiple: false,
    isUploadThumb: false,
    savePluginPtype: 'saveplugin',
    SynchronizedToSavePlugin: false,
    submitUrl: "",
    uploadToolTip: "上传文件",
    initialize: function() {
        var me = this;
        me.callParent();
        me.initIframe();
    },
    cell: {
        tools: {
            up: {
                handler: function(grid, upObj) {
                    //console.log(arguments);
                    var me = upObj.column;
                    me.uploadHandler(me, me.uploadParams, me.uploadFileParam, me.submitUrl, me.isMultiple, grid);
                }
            }
        }
    },
    /**
     * 初始化iframe函数
     * private
     * @method initIframe
     */
    initIframe: function() {
        var me = this,
            iframe = Ext.DomHelper.createDom('<iframe>');
        iframe.setAttribute('name', 'formIframe');
        iframe.style.display = "none";
        iframe.addEventListener('load', function() {
            //console.log("iframe_load", Math.random());
            //console.dir(me.iframe);
            if (!Ext.isEmpty(iframe.contentDocument.body.innerText)) {
                var responseText = JSON.parse(iframe.contentDocument.body.innerText);
                if (!Ext.isEmpty(responseText)) {
                    if (responseText.info.success) {
                        me.uploadSuccess(responseText);
                    } else {
                        me.uploadFailure(responseText);
                    }
                }
            }
        });
        me.iframe = iframe;
        document.body.append(me.iframe);
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
    uploadHandler: function(me, uploadParams, uploadFileParam, submitUrl, isMultiple, grid) {
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
                    form.appendChild(uploadParamsArray[uploadParamsNum++]);
                });
            }
            form.appendChild(input);
            form.setAttribute("enctype", "multipart/form-data");
            if (!Ext.isEmpty(submitUrl)) {
                form.setAttribute('action', submitUrl);
            } else {}
            /*Rs.Msg.messageAlert({
                    title: '操作提示',
                    message: '缺少上传文件的接口地址Url，参考submitUrl属性'
                });*/
            form.setAttribute('method', 'post');
            form.setAttribute('target', 'formIframe');
            if (Ext.isEmpty(me.iframe.children.item(0))) {
                me.iframe.append(form);
            } else {
                me.iframe.children.item(0).replaceWith(form);
            }
            input.click();
            input.addEventListener('change', function(e) {
                var file = e.srcElement.files;
                //控制上传的文件类型
                for (i in file) {
                    if (Ext.isNumeric(i)) {
                        if (!fileRegType.test(file[i].type)) {
                            uploadAvailable = false;
                            //console.log("类型限制");
                            me.uploadFailure();
                            break;
                        }
                        if (!me.overLimitSize(me.limitFileSize, file[i].size)) {
                            uploadAvailable = false;
                            // console.log("大小限制");
                            // console.log(me.overLimitSize(me.limitFileSize, file[i].size), file[i].size, me.limitFileSize);
                            me.uploadFailure();
                            break;
                        }
                    }
                }
                if (me.SynchronizedToSavePlugin) {
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
        } else {}
    },
    /*
            Rs.Msg.messageAlert({
                title: '操作提示',
                message: '缺少上传文件的参数名，参考uploadFileParam属性'
            });*/
    /**
     * 上传成功回调函数
     * public
     * @method uploadSuccess
     * @params {Object} responseText 响应内容
     */
    uploadSuccess: function(responseText) {},
    // console.log("success:", responseText);
    /**
     * 上传失败回调函数
     * public
     * @method uploadFailure
     * @params {Object} responseText 响应内容
     */
    uploadFailure: function(responseText) {},
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

Ext.define('Rs.ext.grid.plugin.CalculateAssign', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.calculateassign',
    /* 	requires: [
		//'Rs.ext.button.RsButton'
		'Ext.form.field.Field'
	], */
    requires: 'Ext.field.Field',
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
            me.grid.store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
                me.gridCalculate(record, modifiedFieldNames);
            });
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
                if (Ext.getCmp(field).rawValue) {
                    formulaResult = formulaResult + Ext.getCmp(field).rawValue.toString();
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
    gridCalculate: function(record, modifiedFieldNames) {
        var me = this;
        var assignValue = me.assignValue;
        var formula = me.rule;
        //var record = context.record;		
        var formulaResult1 = '';
        var symbleFlag = false;
        var field = "";
        var calResult = 0;
        if ((me.relyOn).includes(modifiedFieldNames[0])) {
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

/**
	 * @Rs.ext.grid.plugin.FieldsDifferentControlB
	 * @extends Ext.plugin.Abstract
	 * @author pangmeichen
	 * 前台业务属性不一致控制插件
	 */
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
        /*me.grid.on('edit',function(editPlugin,context){
			        
			me.gridAttributeUnsame(me.itemIds,me.checkField,context);
		});*/
        me.grid.store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
            //me.gridCompareControl(record,modifiedFieldNames);
            me.gridAttributeUnsame(store, record, operation, modifiedFieldNames, details, eOpts);
        });
    },
    gridAttributeUnsame: function(context, record, operation, modifiedFieldNames, details, eOpts) {
        var me = this,
            itemIds = me.itemIds,
            checkField = me.checkField,
            //record = context.record,
            field = modifiedFieldNames;
        rowIndex = context.indexOf(record);
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
            //Ext.Msg.alert('提示','业务属性一致');
            console.log('提示', '业务属性一致');
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
    init: function(grid) {},
    /*var me = this,
		editPlugin,
		gridPluginsArray = grid.getPlugins();
		
		if(Ext.isEmpty(me.panelId)){
			Ext.Msg.alert("系统提示","插件参数配置错误");
			return false
		}

		//来源面板id有值，数据面板id无值————则为单列表页面
		if(Ext.getCmp(me.panelId).isXType('grid') && Ext.isEmpty(me.dataPanelId)){
			me.gridFunction(gridPluginsArray,editPlugin);
		}else if(Ext.getCmp(me.panelId).isXType('form') && Ext.getCmp(me.dataPanelId).isXType('grid')){
			me.mixFunction();
		}else{
			Ext.Msg.alert("系统提示","插件参数配置错误");
			return false
		}*/
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
            return false;
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

/**
	 * @Rs.ext.grid.plugin.FieldsDifferentControlB
	 * @extends Ext.plugin.Abstract
	 * @author pangmeichen
	 * 前台业务属性一致控制插件
	 */
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
        /* 		me.grid.on('edit',function(editPlugin,context){
			       
			me.gridAttributeSame(context);
		}); */
        me.grid.store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
            //me.gridCompareControl(record,modifiedFieldNames);
            me.gridAttributeSame(store, record, operation, modifiedFieldNames, details, eOpts);
        });
    },
    /* 		Ext.getCmp(me.itemIds).on('blur',function(context){
			        alert(2);
				//me.formCompareControl(me.itemIds,me.checkField,me.controlRule);
				me.gridAttributeSame(context);
		}); */
    gridAttributeSame: function(context, record, operation, modifiedFieldNames, details, eOpts) {
        var me = this,
            itemIds = me.itemIds,
            checkField = me.checkField,
            //record = context.record,
            field = modifiedFieldNames;
        rowIndex = context.indexOf(record);
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
            //Ext.Msg.alert('提示','业务属性不一致');
            console.log('提示', '业务属性不一致');
            return false;
        } else {
            return true;
        }
    }
});

/**
	 * @Rs.ext.grid.plugin.FieldsCompareControlF
	 * @extends Ext.plugin.Abstract
	 * 两个业务属性比较控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldsCompareControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fieldsCompare',
    requires: 'Ext.field.Field',
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
            me.grid.store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
                me.gridCompareControl(record, modifiedFieldNames);
            });
        } else {
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
        var newValue = Ext.getCmp(itemIds).getValue();
        var compareValue = Ext.getCmp(checkField).getValue();
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
                console.log('提示', '不满足控制规则');
                Ext.getCmp(itemIds).setValue();
                return false;
            } else {
                return true;
            }
        } else {
            console.log('提示', '控制规则配置错误');
            return false;
        }
    },
    gridCompareControl: function(record, modifiedFieldNames) {
        var me = this,
            itemIds = me.itemIds,
            checkField = me.checkField,
            controlRule = me.controlRule;
        newValue = record.get(itemIds) , compareValue = record.get(checkField);
        if (modifiedFieldNames != itemIds && modifiedFieldNames != checkField) {
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
                console.log('提示', '不满足控制规则');
                record.set(itemIds, '');
                return false;
            } else {
                return true;
            }
        } else {
            console.log('提示', '控制规则配置错误');
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
	 * @author xiaozhisong
	 * 后台业务属性不一致控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldsDifferentControlB', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.fieldsdifferentb',
    requires: 'Ext.field.Field',
    configs: {
        itemIds: '',
        panelId: '',
        tableCode: '',
        fields: '',
        condition: '',
        errorCode: '',
        tipType: ''
    },
    init: function() {},
    //var me = this;
    //if(Ext.getCmp(me.config.panelId).isXType('grid')){
    /*
			Ext.getCmp(me.config.panelId).on('edit',function(editPlugin,context){
				me.gridFieldsDifferentControlB(context);
			});
			*/
    //}else{
    //	var fields = me.config.fields.split(',');
    //	for(var i = 0; i < fields.length; i++){
    //		if(!Ext.getCmp(fields[i])){
    //			Ext.Msg.alert('提示','控件配置错误');
    //			return false;
    //		}else{
    //			Ext.getCmp(fields[i]).on('blur',function(field){
    //				me.formFieldsDifferentControlB(field);
    //			});
    //		}
    //	}
    //}
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
    requires: 'Ext.field.Field',
    configs: {
        hPanelID: '',
        hFields: '',
        dFields: '',
        errorCode: ''
    },
    init: function(grid) {
        var me = this;
        me.getCmp().store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
            me.headCalculate(store);
        });
    },
    headCalculate: function(store) {
        var me = this;
        var hPanelID = me.config.hPanelID;
        if (!Ext.getCmp(hPanelID)) {
            console.log('提示:头面板ID配置错误');
        }
        var hFields = me.config.hFields;
        var dFields = me.toArr(me.config.dFields);
        var headNumber = 0;
        var detailNumber = 0;
        var fieldFlag = false;
        var equation = '';
        for (var i = 0; i < dFields.length; i++) {
            detailNumber = 0;
            fieldFlag = false;
            var fieldsObj = store.model.getFieldsMap();
            store.each(function(record, idx) {
                if (dFields[i] in fieldsObj) {
                    fieldFlag = true;
                    var value = record.get(dFields[i].trim());
                    value = value ? value : 0;
                    detailNumber = (isNaN(parseFloat(detailNumber)) ? 0 : parseFloat(detailNumber)) + (isNaN(parseFloat(value)) ? 0 : parseFloat(value));
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
            console.log('提示:明细字段配置错误');
            return false;
        }
        headNumber = detailNumber.toFixed(2);
        if (Ext.getCmp(hPanelID).isXType('grid')) {
            //列表
            var headStore = Ext.getCmp(hPanelID).getStore();
            headStore.each(function(record, idx) {
                var selectedRecord = Ext.getCmp(hPanelID).getSelection();
                var selectIndex = headStore.indexOf(selectedRecord);
                if (idx == selectIndex && selectIndex > -1) {
                    record.set(hFields, headNumber);
                    return true;
                }
            });
        } else {
            //卡片
            if (!Ext.getCmp(hFields)) {
                console.log('提示:头字段配置错误');
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
    },
    toArr: function(str) {
        var arr1 = [];
        if (str.indexOf('+') > -1) {
            var arr = str.split('+');
            for (var i = 0; i < arr.length; i++) {
                arr1.push(arr[i].trim());
                i < arr.length - 1 && arr1.push('+');
            }
        } else {
            arr1.push(str);
        }
        var arr2 = [];
        for (var i = 0; i < arr1.length; i++) {
            var temStr = arr1[i];
            if (temStr.indexOf('-') > -1) {
                var arr = temStr.split('-');
                for (var i = 0; i < arr.length; i++) {
                    arr2.push(arr[i].trim());
                    i < arr.length - 1 && arr2.push('-');
                }
            } else {
                arr2 = arr1;
            }
        }
        var arr3 = [];
        for (var i = 0; i < arr2.length; i++) {
            var temStr = arr2[i];
            if (temStr.indexOf('*') > -1) {
                var arr = temStr.split('*');
                for (var i = 0; i < arr.length; i++) {
                    arr3.push(arr[i].trim());
                    i < arr.length - 1 && arr3.push('*');
                }
            } else {
                arr3 = arr2;
            }
        }
        var arr4 = [];
        for (var i = 0; i < arr3.length; i++) {
            var temStr = arr3[i];
            if (temStr.indexOf('/') > -1) {
                var arr = temStr.split('/');
                for (var i = 0; i < arr.length; i++) {
                    arr4.push(arr[i].trim());
                    i < arr.length - 1 && arr4.push('/');
                }
            } else {
                arr4 = arr3;
            }
        }
        return arr4;
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
    requires: 'Ext.field.Field',
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
                "panelID": "",
                "errorMsg": [],
                "errArr": []
            };
        }
        if (!Ext.getCmp(me.config.dPanelID)) {
            Ext.Msg.alert('提示', '明细面板ID配置错误');
            return {
                "success": false,
                "panelID": "",
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
                var store = Ext.getCmp(me.config.hPanelID).getStore();
                store.each(function(record, idx) {
                    var select = Ext.getCmp(me.config.hPanelID).getSelected();
                    var selectIdex = store.indexOfId(select.items[0].id);
                    //if(idx==Ext.getCmp(me.config.hPanelID).getSelectionModel().selectionStartIdx){
                    if (idx == selectIdex) {
                        if (hFields[i] in record.data) {
                            fieldFlag = true;
                            headNumber = parseFloat(headNumber) + parseFloat(record.get(hFields[i]));
                        }
                    }
                });
            } else //}
            {
                if (Ext.getCmp(me.config.hPanelID).items.items.includes(Ext.getCmp(hFields[i]))) {
                    fieldFlag = true;
                    headNumber = parseFloat(headNumber) + parseFloat(Ext.getCmp(hFields[i])._value);
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
                "panelID": "",
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
                "panelID": "",
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
                    "panelID": me.config.dPanelID,
                    "errorMsg": me.config.errorCode,
                    "errArr": [
                        {}
                    ]
                };
            } else {
                return {
                    "success": true,
                    "panelID": "",
                    "errorMsg": [],
                    "errArr": []
                };
            }
        } else {
            Ext.Msg.alert('提示', '控制规则配置错误');
            return {
                "success": false,
                "panelID": "",
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
        var me = this;
        errorMsg = {} , retVlaue = {} , store = me.panel.getStore() , errArr = [];
        checkField = me.fields;
        var keyIds = store.getModel().idProperty;
        var records = new Ext.util.MixedCollection();
        store.each(function(record, index, store) {
            if (me.checkIsValidRec(record, checkField)) {
                var joinKey = '';
                Ext.each(fields, function(field, index, fields) {
                    var data = record.get(field);
                    joinKey += '?' + (Ext.isEmpty(data) ? '' : data);
                }, this);
                if (!Ext.isEmpty(joinKey) && records.containsKey(joinKey)) {
                    //console.log("joinKey=",joinKey);
                    //console.log(records);
                    var msgs = errorMsg[joinKey] || [];
                    if (Ext.isEmpty(msgs)) {
                        var row = (records.get(joinKey))[0] + 1;
                        //console.log("row",row);
                        msgs.push(row);
                        errArr.push({
                            uuid: ((records.get(joinKey))[1]),
                            checkField: checkField,
                            index: row - 1
                        });
                    }
                    msgs.push(index + 1);
                    errorMsg[joinKey] = msgs;
                    errArr.push({
                        uuid: record.get(keyIds),
                        checkField: checkField,
                        index: index
                    });
                } else {
                    records.add(joinKey, [
                        index,
                        record.get(keyIds)
                    ]);
                }
            }
        }, this);
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
                    //console.log('您的验重字段配置错误，请检查');
                    return false;
                }
            }
        } else {
            //console.log('您的验重字段配置错误，请检查');
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
            retVlaue = {},
            store = me.panel.getStore(),
            errUUID = [],
            errArr = [],
            keyIds = store.getModel().idProperty,
            otherCdt = me.otherCdt,
            //其它特定条件
            records = new Ext.util.MixedCollection();
        //条件拆分
        store.each(function(record, index, store) {
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
                        if (flag && !data) {
                            //满足附加条件时，需必输 保留行号，UUID，空字段，空字段名称
                            if (errUUID.indexOf(record.get(keyIds)) == -1) {
                                errUUID.push(record.get(keyIds));
                                errArr.push({
                                    uuid: record.get(keyIds),
                                    checkField: [
                                        joinKey
                                    ],
                                    index: index
                                });
                            } else {
                                for (var p in errArr) {
                                    if (errArr[p].uuid == record.get(keyIds)) {
                                        errArr[p].checkField.push(joinKey);
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        if (!data) {
                            //没有附件条件，必输 保留行号，UUID，空字段，空字段名称
                            if (errUUID.indexOf(record.get(keyIds)) == -1) {
                                errUUID.push(record.get(keyIds));
                                errArr.push({
                                    uuid: record.get(keyIds),
                                    checkField: [
                                        joinKey
                                    ],
                                    index: index
                                });
                            } else {
                                for (var p in errArr) {
                                    if (errArr[p].uuid == record.get(keyIds)) {
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
                    console.log('您的必输字段配置错误，请检查');
                    return false;
                }
            }
        } else {
            console.log('您的必输字段配置错误，请检查');
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
	 * @Rs.ext.grid.plugin.deleteHeadControlF
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 删除头记录检查明细状态控制插件
	 */
Ext.define('Rs.ext.grid.plugin.deleteHeadControlF', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.deleteHead',
    requires: 'Ext.Button',
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
        if (grid.isXType('grid')) {
            //me.gridFunction(gridPluginsArray,editPlugin);
            me.grid = grid;
            me.grid.store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
                me.relateStateControl(store, record, modifiedFieldNames);
            });
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
    relateStateControl: function(store, record, field) {
        var me = this;
        var returnFlag = false;
        //var record = context.record;
        //var field = context.field;
        var itemIdArray = new Array();
        itemIdArray = me.itemIds.split(",");
        var fieldArray = new Array();
        //fieldArray = field.split(",");
        fieldArray = field;
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
                /* 				if(!Ext.isEmpty(me.erroCode)){
					Rs.Msg.messageAlert({stateCode:me.erroCode});
				} */
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
});

Ext.define('Rs.ext.panel.plugin.SavePlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.saveplugin',
    requires: [
        'Ext.Toolbar',
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
                    me.doSave();
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
    //保存
    doSave: function() {
        var me = this,
            params = {},
            panels = new Array();
        //store = Ext.getStore(me.grid.store);
        //逻辑执行前函数
        if (!Ext.isEmpty(me.beforeExecute)) {
            if (!me.beforeExecute(me)) {
                return false;
            }
        }
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
        Ext.each(store.model.getFields(), function(fields) {
            if (fields.name == 'COM_CODE') {
                me.comFlag = true;
            } else if (fields.name == 'UPD_CODE') {
                me.updFlag = true;
            }
        });
        if (!Ext.isEmpty(me.personCodeField) || !Ext.isEmpty(me.personNameField)) {
            me.personFlag = true;
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
                            deleteRecordsData.push(record.data);
                        } else if (record.crudState == 'U') {
                            fiedNameS = Object.keys(record.modified);
                            modifiedData = {};
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
                        deleteRecordsData.push(record.data);
                    } else if (record.crudState == 'U') {
                        fiedNameS = Object.keys(record.modified);
                        modifiedData = {};
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
            panelPlugins = panel._plugins,
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
        console.log("111111");
        Ext.each(me.panelIds, function(panelid) {
            panel = Ext.getCmp(panelid);
            if (!Ext.isEmpty(panel) && panel.isXType('grid')) {
                console.log("1111112");
                me.addControlPlugins(panel);
            }
        });
    },
    //获取所有控制插件
    addControlPlugins: function(panel) {
        var me = this,
            panelPlugins = panel._plugins,
            editPlugin,
            editControlPlugins = new Array();
        Ext.each(panelPlugins, function(panelPlugin) {
            if ("fieldscompare" == panelPlugin.ptype || "statecontrolf" == panelPlugin.ptype || "relatestatecontrolf" == panelPlugin.ptype || "fielddiffentcontrolf" == panelPlugin.ptype || "fieldsamecontrolf" == panelPlugin.ptype || "fieldsdifferentb" == panelPlugin.ptype || "fieldsamecontrolb" == panelPlugin.ptype || "calculateassign" == panelPlugin.ptype || "headdetailcalculate" == panelPlugin.ptype) {
                editControlPlugins.push(panelPlugin);
            }
            if ("gridcellediting" === panelPlugin.ptype) {
                editPlugin = panelPlugin;
            }
            if ("rowedit" === panelPlugin.ptype) {
                editPlugin = panelPlugin;
            }
            if ("gridcellediting" === panelPlugin.ptype) {
                editPlugin = panelPlugin;
            }
        }, this);
        if (!Ext.isEmpty(editPlugin)) {
            /*********************
				PC端通过监听cellEdit插件的edit、beforeEdit事件来触发相关业务插件
				移动端cellEdit插件无相关事件监听方法，现提供以下解决方式：
					1：通过监听gird的edit事件，需添加rowEdit插件  @see ext7doc/extjs/7.2.0/modern/Ext.grid.Grid.html#edit
					2：监听store的update事件
					3：弹出页面式(暂不满足领导需求) @see docs/ext-7.2.0/build/examples/kitchensink/?modern#editable-grid
			**********************/
            // 方式1：
            panel.on('edit', function(editPlugin, context) {
                me.doControPlugis(editControlPlugins, context);
            }, me);
            panel.on('beforeedit', function(editPlugin, context) {
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
    //方式2：
    /*
			panel.getStore().on('update',function(store, record, operation, modifiedFieldNames, details, eOpts){
				var context;
				context.store = store;
				context.record = record;
				context.operation = operation;
				context.modifiedFieldNames = modifiedFieldNames;
				context.details = details;
				context.eOpts = eOpts;
				me.doControPlugis(editControlPlugins,context);
		   });
			panel.getStore().on('beforesync',function(editPlugin,store, record, operation, modifiedFieldNames, details, eOpts){
				var returnFlag = true;
				Ext.each(editControlPlugins,function(controlPlugin){
					returnFlag = true;
					if("statecontrolf"==controlPlugin.ptype){
						returnFlag = controlPlugin.gridStateControl(editPlugin,context.record,context.field);
					}
					if("relatestatecontrolf"==controlPlugin.ptype){
						returnFlag = controlPlugin.relateStateControl(editPlugin,context.record,context.field);
					}
					if(!returnFlag){
						return false;
					}
				});
				if(!returnFlag){
					return false;
				}
			},me);*/
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
                returnFlag = controlPlugin.singleGridFunction('', context.record, context.cell.dataIndex, context.row._recordIndex);
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
            //me.gridFunction(gridPluginsArray,editPlugin);
            me.grid = grid;
            me.grid.store.on('update', function(store, record, operation, modifiedFieldNames, details, eOpts) {
                me.gridStateControl(record, modifiedFieldNames);
            });
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
    gridStateControl: function(record, modifiedFieldNames) {
        var me = this;
        var returnFlag = false;
        //var field = context.field;
        var itemIdArray = new Array();
        itemIdArray = me.itemIds.split(",");
        /* 			var fieldArray = new Array();
			fieldArray = field.split(","); add by pmc*/
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
            //if(fieldArray[j] == itemIdArray[j]){
            if (modifiedFieldNames == itemIdArray[j]) {
                if (Ext.isEmpty(record.get(checkFieldsArray[j]))) {
                    return false;
                }
                //console.log(record.get(checkFieldsArray[j]));
                var checkValue = record.get(checkFieldsArray[j]).toString();
                var targetValue = '0';
                if (record.get(targetValuesArray[j])) {
                    targetValue = record.get(targetValuesArray[j]).toString();
                }
                var controlRule = controlRuleArray[j];
                if (controlRule == '>') {
                    if (checkValue > targetValue) {
                        returnFlag = true;
                    } else //return false;
                    {}
                }
                //returnFlag = false;
                //return true;
                else if (controlRule == '<') {
                    if (checkValue < targetValue) {
                        returnFlag = true;
                    } else //return false;
                    {}
                }
                //returnFlag = false;
                //return true;
                else if (controlRule == '>=') {
                    if (checkValue >= targetValue) {
                        returnFlag = true;
                    } else //return false;
                    {}
                }
                //returnFlag = false;
                //return true;
                else if (controlRule == '<=') {
                    if (checkValue <= targetValue) {
                        returnFlag = true;
                    } else //return false;
                    {}
                }
                //returnFlag = false;
                //return true;
                else if (controlRule == '=') {
                    if (checkValue == targetValue) {
                        returnFlag = true;
                    } else //return false;
                    {}
                }
                //returnFlag = false;
                //return true;
                else if (controlRule == '<>' || controlRule == '!=') {
                    if (checkValue != targetValue) {
                        returnFlag = true;
                    } else //return false;
                    {}
                } else //returnFlag = false;
                //return true;
                {
                    Ext.Msg.alert('提示', '控制规则配置错误');
                }
            } else {}
        }
        if (returnFlag) {
            console.log("提示：" + me.erroCode);
            //Rs.Msg.messageAlert({stateCode:me.erroCode});
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
            //url: 'http://192.168.3.110:8083/read',
            //url: 'http://192.168.3.110:8083/telescope/read',
            //url: 'http://192.168.3.110:9303/telescope/read',
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
            //url: 'http://192.168.3.110:8083/meta',
            //url: 'http://192.168.3.110:8083/telescope/meta',
            //url: 'http://192.168.3.110:9303/telescope/meta',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    };
});

Ext.define('Rs.ext.telescope.view.TelescopeForm', {
    extend: 'Ext.Container',
    //extend: 'Ext.Panel',
    viewModel: {
        data: {
            selectedfield: null,
            currentValue: null
        }
    },
    bodyPadding: 4,
    animation: false,
    collapseAnimation: false,
    expandAnimation: false,
    hideAnimation: false,
    showAnimation: false,
    itemId: 'form',
    padding: 6,
    items: [
        {
            xtype: 'fieldcontainer',
            itemId: 'fieldcontainer',
            items: [
                {
                    xtype: 'selectfield',
                    itemId: 'options',
                    reference: 'options',
                    width: 144,
                    picker: 'floated',
                    matchFieldWidth: false,
                    placeholder: '请选择...'
                },
                {
                    xtype: 'container',
                    layout: 'center',
                    padding: 2,
                    items: [
                        {
                            xtype: 'label',
                            html: ':'
                        }
                    ]
                },
                {
                    flex: 1,
                    xtype: 'textfield',
                    itemId: 'valuefield',
                    reference: 'valuefield',
                    bind: '{currentValue}',
                    triggers: {
                        search: {
                            type: 'search'
                        }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            itemId: 'criterias'
        }
    ],
    //itemId: '',
    /*
		items: [{
			xtype: 'chip',
			closable: true,
			text: '物料编码: 090081'
		}, {
			xtype: 'chip',
			closable: true,
			text: '生产线编码: 090081090081'
		}]
		*/
    onSpecialkey: function(field, e) {
        console.log('onEnterKey', this, field);
        var me = this;
        if (e.getKey() == e.ENTER) {
            me.doQuery();
        }
    },
    initialize: function() {
        this.callParent(arguments);
        var me = this,
            fc = me.child('#fieldcontainer'),
            options = fc.child('#options'),
            criterias = me.child('#criterias');
        //初始化查询按钮
        var vf = fc.child('#valuefield');
        var triggers = vf.getTriggers();
        var search = triggers.search;
        search.setHandler(me.doQuery.bind(me));
        /*
		search.setHandler(function () {
			console.log('tttt....');
			vf.blur();
			console.log(criterias.getItems());
			criterias.getItems().each(function (item) {
				if (!item.isHidden()) {
					//item.getText();
				}
			});
			var conditions = " 2 = 2 ";
			//me.fireEvent('');
			
		});
		*/
        var vm = me.getViewModel();
        var closeHandler = function() {
                //this.setText(null);
                this.publishState('text', null);
                this.up('container').setHidden(true);
            };
        console.log(vm);
        me.mon(options, 'change', function(sel, newValue, oldValue) {
            vm.set('currentValue', null);
            var fieldName;
            var selection = sel.getSelection();
            var display = selection.get(sel.getDisplayField());
            var tempNew = me.handlerSpecialKey(newValue);
            var tempOld;
            fieldName = tempNew.fieldName;
            newValue = tempNew.itemId;
            if (oldValue) {
                tempOld = me.handlerSpecialKey(oldValue);
                oldValue = tempOld.itemId;
            }
            //console.log("newValue:----------->",newValue);
            var newField = criterias.child('#' + newValue),
                oldField = criterias.child('#' + oldValue);
            if (!Ext.isEmpty(oldField)) {
                console.log('清除bind');
                oldField.setBind({
                    //text: null,
                    hidden: null
                });
                oldField.child('chip').setBind({
                    text: null
                });
            }
            if (Ext.isEmpty(newField)) {
                var chip = Ext.create({
                        xtype: 'container',
                        layout: 'hbox',
                        align: 'center',
                        //closable: true,
                        itemId: newValue,
                        fieldName: fieldName,
                        bind: {
                            hidden: '{!currentValue}'
                        },
                        items: [
                            {
                                xtype: 'container',
                                html: display + ' : '
                            },
                            {
                                xtype: 'chip',
                                closable: true,
                                closeHandler: closeHandler,
                                bind: {
                                    text: '{currentValue}'
                                }
                            }
                        ]
                    });
                criterias.add(chip);
            } else {
                var chip = newField.child('chip');
                var value = chip.getText();
                vm.set('currentValue', value);
                newField.setBind({
                    hidden: '{!currentValue}'
                });
                //text: display + ':{currentValue}'
                chip.setBind('{currentValue}');
            }
        });
    },
    setFields: function(fields) {
        var me = this,
            options = [];
        //console.log(me);
        var fc = me.child('#fieldcontainer');
        var options = fc.child('#options');
        //console.log('options:', options);
        me.suspendLayout = true;
        options.setOptions(fields);
        me.suspendLayout = false;
    },
    //this.add(fields);
    getStore: function() {
        return this.store;
    },
    getValues: function() {
        var me = this,
            criterias = me.child('#criterias');
        var values = {};
        criterias.getItems().each(function(item) {
            var chip = item.child('chip');
            if (!item.isHidden()) {
                //values[item.getItemId()] = chip.getText();
                values[item.fieldName] = chip.getText();
            }
        });
        return values;
    },
    //对特殊字段名的处理如decode(vehicle_name, 'P', '飞机', 'T', '火车', 'S', '轮船') as vehicle_name 
    handlerSpecialKey: function(value) {
        var queryItem = {};
        var specialCode = {
                AS: " AS ",
                as: " as "
            };
        if (value.lastIndexOf(specialCode.AS) != -1) {
            var tempAS = value.split(specialCode.AS);
            queryItem.fieldName = tempAS[0].trim();
            queryItem.itemId = tempAS[1].trim();
            return queryItem;
        } else if (value.lastIndexOf(specialCode.as) != -1) {
            var tempas = value.split(specialCode.as);
            queryItem.fieldName = tempas[0].trim();
            queryItem.itemId = tempas[1].trim();
            return queryItem;
        } else {
            queryItem.fieldName = value;
            queryItem.itemId = value;
            return queryItem;
        }
    },
    doQuery: function(btn) {
        console.log('doQuery...............', btn);
        var me = this,
            store = me.getStore(),
            values = me.getValues();
        me.fireEvent('query', values);
        store.loadPage(1);
    }
});

Ext.define('Rs.ext.telescope.view.TelescopeGrid', {
    //extend: 'Ext.grid.locked.Grid',
    extend: 'Ext.grid.Grid',
    plugins: {
        pagingtoolbar: true
    }
});

Ext.define('Rs.ext.telescope.view.TelescopePanel', {
    extend: 'Ext.Dialog',
    //override: 'Ext.Dialog',
    requires: [
        'Rs.ext.telescope.store.TeleStore',
        'Rs.ext.telescope.store.TeleMetaStore',
        'Rs.ext.telescope.view.TelescopeForm',
        'Rs.ext.telescope.view.TelescopeGrid'
    ],
    hidden: true,
    title: '望远镜',
    width: '85%',
    height: 420,
    minHeight: 280,
    layout: 'vbox',
    closable: true,
    closeAction: 'hide',
    maximizable: true,
    //collapsible: false,
    shadow: false,
    draggable: false,
    hideAnimation: false,
    showAnimation: false,
    restoreAnimation: false,
    maximizeAnimation: false,
    embeded: false,
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
        me.store = store;
        store.on(me.getStoreListeners(store));
        //me.setStore(store);
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
        console.log(columns, "<======");
        return columns;
    },
    initColumns: function(columns) {
        var me = this;
        columns = [
            {
                locked: true,
                xtype: 'rownumberer'
            }
        ].concat(me.mergeColumns(columns) || []);
        me.afterMergeColumns(columns);
        return columns;
    },
    //列合并策略
    mergeColumns: function(columns) {
        var me = this,
            cols = [],
            mappings = {},
            gridConfig = me.getGridConfig() || {};
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
        var fields = [];
        criterias.each(function(criteria) {
            fields.push({
                text: criteria.get('desc_zh'),
                value: criteria.get('field_name')
            });
        });
        return fields;
    },
    createSelModel: function() {
        var me = this,
            selModel = me.multiSelect ? {
                mode: 'multi',
                checkbox: true,
                checkboxColumnIndex: 1
            } : {
                mode: 'single',
                checkbox: false,
                toggleOnClick: false
            };
        console.log('multiSelect====>', selModel);
        return selModel;
    },
    createGrid: function(store, columns) {
        var me = this,
            selModel = me.createSelModel();
        var grid = Ext.create('Rs.ext.telescope.view.TelescopeGrid', {
                flex: 1,
                store: store,
                columns: columns,
                selectable: selModel
            });
        me.initGrid(grid);
        return grid;
    },
    initGrid: function(grid) {
        var me = this,
            selectable = grid.getSelectable();
        //---------------------
        selectable.getSelection().refresh = Ext.emptyFn;
    },
    createForm: function(store, fields) {
        var me = this,
            form = Ext.create('Rs.ext.telescope.view.TelescopeForm', {
                animCollapse: false
            });
        form.store = store;
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
    initialize: function() {
        this.callParent(arguments);
        var me = this,
            progCode = me.getProgCode();
        var meta = me.meta = Ext.create('Rs.ext.telescope.store.TeleMetaStore', {
                prog_code: progCode
            });
        var toggleForm = function() {
                var tool = this,
                    form = me.form,
                    isHidden = form.isHidden();
                form[isHidden ? 'show' : 'hide']();
                tool.setType(isHidden ? 'up' : 'down');
            };
        meta.load({
            params: {
                prog_code: progCode
            },
            callback: function(records) {
                var model = meta.first();
                if (Ext.isEmpty(model)) {
                    Ext.raise('望远镜服务异常, 请检查望远镜后台服务!');
                }
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
                if (!Ext.isEmpty(fields)) {
                    me.addTool({
                        type: 'up',
                        handler: toggleForm
                    });
                }
                form = me.createForm(store, fields);
                if (!Ext.isEmpty(head)) {
                    me.setTitle(head.get('prog_name') || '');
                }
                me.form = form;
                me.grid = grid;
                me.add([
                    form,
                    grid
                ]);
                store.loadPage(1);
            }
        });
    },
    //me.embeded || me.show();
    refresh: function() {
        var me = this,
            store = me.store;
        if (store && !store.isLoading()) {
            store.loadPage(1);
        }
    },
    getStoreListeners: function(store) {
        var me = this;
        return {
            beforeload: me.onBeforeload,
            scope: me
        };
    },
    onBeforeload: function(store, operation) {
        var me = this,
            conditions = me.conditions,
            progCode = me.getProgCode(),
            params = operation.getParams();
        selectable = me.grid.getSelectable();
        selectable.deselectAll(true);
        console.log('beforeload...', me, progCode);
        conditions = Ext.valueFrom(conditions, ' 1 = 1 ');
        conditions = me.buildProgCondtion(conditions);
        operation.setParams(Ext.apply({}, {
            prog_code: progCode,
            prog_condition: conditions
        }, params));
    },
    buildProgCondtion: Ext.identityFn
});

Ext.define('Rs.ext.telescope.Telescope', {
    extend: 'Ext.field.Text',
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
		 * 多选望远镜 (默认为false, 即单选望远镜)
		 */
        multiSelect: false,
        /**
		 * @cfg {String} separator
		 * 多选望远镜的分割字符串
		 */
        separator: ',',
        /**
		 * @cfg {Object} gridConfig
		 * 望远镜的grid面板配置
		 */
        gridConfig: {},
        lastSelection: []
    },
    type: 'floated',
    triggers: {
        expand: {
            type: 'expand'
        }
    },
    internelId: 'telescope-model-id',
    selection: [],
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
    initialize: function() {
        var me = this;
        me.callParent();
        //me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);
        me.cached = Ext.create('Ext.util.Collection', {
            keyFn: function(record) {
                return record[me.internelId];
            }
        });
        console.log(me.cached.getKey);
    },
    //Override
    setValue: function(value) {
        var me = this,
            values = [],
            displays = [],
            sp = me.separator;
        if (Ext.isArray(value)) {
            var models = value;
            Ext.each(models, function(model) {
                model = me.doBeforeSetValue(model);
                values.push(model[0]);
                displays.push(model[1]);
            });
            console.log(values, displays);
            me.callParent([
                values.join(sp)
            ]);
            me.inputElement.dom.value = displays.join(sp);
        } else {
            value = Ext.isEmpty(value) ? [] : [
                value
            ];
            return me.setValue(value);
        }
        var selection = me.getSelection();
        me.setSelection(value);
        me.setLastSelection(selection);
    },
    doBeforeSetValue: function(model) {
        var me = this;
        if (Ext.isObject(model) && model.isModel) {
            var vf = me.getValueField(),
                df = me.getDisplayField();
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
    onExpandTap: function(field) {
        console.log(this, arguments);
        var me = this,
            cached = me.cached,
            dialog = me.getDialog(),
            selection = me.getSelection();
        console.log('selection:', selection);
        cached.removeAll().add(selection);
        me.highlightSelection(selection);
        dialog.show().refresh();
    },
    getDialog: function() {
        var me = this,
            dialog = me.dialog;
        if (!dialog) {
            var progCode = me.getProgCode(),
                gridConfig = me.getGridConfig(),
                multiSelect = me.getMultiSelect(),
                buildProgCondtion = me.getBuildProgCondtion();
            console.log('gridConfig====>', gridConfig);
            dialog = Ext.create('Rs.ext.telescope.view.TelescopePanel', {
                id: me.id + '-dialog',
                hidden: true,
                embeded: true,
                floating: true,
                pickerField: me,
                progCode: progCode,
                gridConfig: gridConfig,
                multiSelect: multiSelect,
                buildProgCondtion: buildProgCondtion.bind(me)
            });
            me.initDialog(dialog);
            me.dialog = dialog;
        }
        return dialog;
    },
    initDialog: function(dialog) {
        var me = this;
        dialog.on({
            scope: me,
            'store-load': me.onStoreLoad,
            'grid-select': me.onSelect,
            'grid-deselect': me.onDeselect
        });
        if (!me.getMultiSelect()) {
            dialog.on('grid-select', me.onSingleSelect, me);
        }
        return dialog;
    },
    //hash策略
    identifier: function(model) {
        var me = this,
            dialog = me.dialog,
            identifier = [];
        Ext.each(dialog.displayColumns, function(name) {
            identifier.push(model.get(name));
        });
        return identifier.join();
    },
    onSelect: function(selModel, model) {
        console.log('onSelect:', arguments);
        var me = this,
            cached = me.cached,
            id = me.identifier(model);
        if (!cached.containsKey(id)) {
            model[me.internelId] = id;
            cached.add(model);
        }
        console.log("cached-onSelect===", cached.getCount(), ":", cached.getRange());
    },
    onDeselect: function(selModel, model) {
        console.log('onDeselect:', arguments);
        var me = this,
            cached = me.cached,
            id = me.identifier(model);
        if (cached.containsKey(id)) {
            model[me.internelId] = id;
            cached.remove(model);
        }
        console.log("cached-onDeselect===", cached.getCount(), ":", cached.getRange());
    },
    onStoreLoad: function(store, records) {
        console.log('----->');
        var me = this,
            selection = [],
            cached = me.cached;
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
    },
    syncSelection: function(selection) {
        var me = this,
            cached = me.cached;
        cached.add(selection);
        me.setSelection(cached.getRange());
    },
    highlightSelection: function(selection) {
        var me = this,
            grid = me.dialog.grid;
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
            valueField = me.getValueField(),
            displayField = me.getDisplayField();
        if (me.fireEvent('beforeselect', me, record) != false) {
            me.fireEvent('select', me, record, selModel);
            me.setValue(record);
            me.collapse();
        }
    },
    collapse: function() {
        var me = this,
            dialog = me.dialog;
        dialog.hide();
    },
    doQuery: function(rawValue) {
        var me = this,
            dialog,
            vf = me.getValueField(),
            df = me.getDisplayField(),
            conditions,
            fields = [];
        me.expand();
        dialog = me.dialog;
        console.log('rawValue:==>', rawValue);
        if (!Ext.isEmpty(rawValue)) {
            Ext.each([
                vf,
                df
            ], function(field) {
                fields.push(field + " like '" + rawValue + "%'");
            });
            conditions = '(' + fields.join(' or ') + ')';
        }
        dialog.setConditions(conditions);
        dialog.refresh();
    }
});

