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
    initialize: function () {
        var me = this,
        formatRegex0 = new RegExp("Y(.|\n)*m(.|\n)*d"),
        formatRegex1 = new RegExp("d(.|\n)*m(.|\n)*Y"),
        formatRegex2 = new RegExp("m(.|\n)*d(.|\n)*Y"),
        tempRegex,
        tempRegex1;
        me.callParent();
        me.on('afterrender', function (thisField) {
            tempRegex1 = "^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})"
                 + "(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))"
                 + "|((0[469]|11)(0[1-9]|[12][0-9]|30))"
                 + "|(02(0[1-9]|[1][0-9]|2[0-8]))))$"
                 + "|^((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)$";
            if (formatRegex0.test(thisField.format)) {
                tempRegex = new RegExp("(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(.|\n)"
                         + "(((0[13578]|1[02])(.|\n)(0[1-9]|[12][0-9]|3[01]))"
                         + "|((0[469]|11)(.|\n)(0[1-9]|[12][0-9]|30))|(02(.|\n)(0[1-9]|[1][0-9]|2[0-8]))))"
                         + "|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))(.|\n)02(.|\n)29)" + "|(" + tempRegex1 + ")");
            }
            if (formatRegex1.test(thisField.format)) {
                tempRegex = new RegExp("((((0[1-9]|[12][0-9]|3[01])(.|\n)(0[13578]|1[02]))"
                         + "|((0[1-9]|[12][0-9]|30)(.|\n)(0[469]|11))"
                         + "|((0[1-9]|[1][0-9]|2[0-8])(.|\n)02))(.|\n)([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))"
                         + "|((29(.|\n)02)(.|\n)(((0[48]|[2468][048]|[3579][26])00)|(([0-9]{2})(0[48]|[2468][048]|[13579][26]))))" + "|(" + tempRegex1 + ")");
            }
            if (formatRegex2.test(thisField.format)) {
                tempRegex = new RegExp("(((0[13578]|1[02])(.|\n)(0[1-9]|[12][0-9]|3[01])"
                         + "|(0[469]|11)(.|\n)(0[1-9]|[12][0-9]|30)"
                         + "|02(.|\n)(0[1-9]|[1][0-9]|2[0-8]))(.|\n)([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3}))"
                         + "|((02(.|\n)29)(.|\n)(((0[48]|[2468][048]|[3579][26])00)$|(([0-9]{2})(0[48]|[2468][048]|[13579][26]))))" + "|(" + tempRegex1 + ")");
            }
            me.regex = new RegExp(tempRegex);
        });
        me.on('blur', function (thisField) {
            var year,
            month,
            day,
            tempValue,
            newValue,
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
    isLegalDate: function (year, month, day) {
        var flag = true;
        if (month - "12" > 0 || month - "01" < 0) {
            flag = flag && false;
            Rs.Msg.messageAlert({
                "message": "非法日期"
            });
        }
        if (month === "01"
             || month === "03"
             || month === "05"
             || month === "07"
             || month === "08"
             || month === "10"
             || month === "12") {
            if (day - "31" > 0 || day - "01" < 0) {
                flag = flag && false;
                Rs.Msg.messageAlert({
                    "message": "非法日期"
                });
            }
        }
        if (month === "04"
             || month === "06"
             || month === "09"
             || month === "11") {
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
