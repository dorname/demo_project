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
    initComponent: function () {
        this.callParent();
    },
    getErrorMsg: function (err_code) {
        var params = {},
        errowMsg;
        params.sql = "select err_code,err_des_c,err_des_e from sys_err_info where err_code = '" + err_code + "'";

        Ext.Ajax.request({
            url: '/base/sql/excute',
            jsonData: params,
            async: false,
            method: 'POST',
            success: function (response, opts) {
                var obj = Ext.decode(response.responseText);
                if (obj.success) {
                    errowMsg = obj.data[0];
                } else {
                    Ext.Msg.alert("系统提示", obj.mesg);
                }
            },
            failure: function (response, opts) {
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
    messageAlert: function (cfg, fn, scope) {
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
            Ext.Object.each(ERRORINFO, function (key, value, myself) {
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
                run: function () {
                    task.taskFlag++;
                    me.show(cfg.title);
                    if (task.taskFlag > cfg.time) {
                        me.close();
                    }
                },
                interval: 1000, //间隔时间1s
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
                    win.onmousemove = function (mouseEvent) {
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
                        if (distanceX >= cfg.autoCloseDistance
                             || distanceY >= cfg.autoCloseDistance
                             || distance >= (cfg.autoCloseDistance * cfg.autoCloseDistance)) {
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
                    win.onmousemove = function (mouseEvent) {
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
                        if (distanceX >= cfg.autoCloseDistance
                             || distanceY >= cfg.autoCloseDistance
                             || distance >= (cfg.autoCloseDistance * cfg.autoCloseDistance)) {
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
            me.on('focusleave', function () {
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
                keydown: function () {
                    if (!Ext.isEmpty(task)) {
                        runner.stop(task);
                    }
                    me.close();
                }
            });
        }
    }
}, function (MessageBox) {
    /**
     * @class Rs.ext.window.MessageBox
     * @alternateClassName Rs.Msg
     * @extends Ext.window.MessageBox
     * @singleton
     * @inheritdoc Ext.window.MessageBox
     */
    // We want to defer creating Ext.MessageBox and Ext.Msg instances
    // until overrides have been applied.
    Ext.onInternalReady(function () {
        Rs.ext.window.MessageBox = Rs.Msg = new MessageBox();
    });
});
