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
    initialize: function () {
        var me = this,
        formatRegex = new RegExp("H(.|\n)i"),
        tempRegex,
        tempRegex0;
        tempRegex0 = me.format[1];
        me.callParent();
        me.on('afterrender', function (thisField) {
            if (formatRegex.test(thisField.format)) {
                tempRegex = "(^[0-9]$)"
                     + "|^(([0-1][0-9])|(2[0-3]))$"
                     + "|^(([0-1][0-9]|2[0-3])([0-5][0-9]))$"
                     + "|^(([0-1][0-9]|2[0-3])([^\\w]|("
                    +tempRegex0 + ")|[_])([0-5][0-9]))$"
                     + "|^(([0-9])([^\\w]|("
                    +tempRegex0 + ")|[_])([0-5][0-9]))$";
            }
            me.regex = new RegExp(tempRegex);
        });
        me.on('blur', function (thisField) {
            var hour,
            minute,
            tempValue,
            newValue;
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
