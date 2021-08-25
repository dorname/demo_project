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
       checked =  checked=='Y'?true:false;
        me.toggleCls(me.checkedCls, checked);
       checked =  checked==true?'Y':'N';
        if (me.initialized) {
            eventName = checked ? 'check' : 'uncheck';
            me.fireEvent(eventName, me);
            me.fireEvent('change', me, checked, oldChecked);
        }
        me.setDirty(me.isDirty());
    },
	applyChecked: function(checked) {
         var me =this;		 
		 if (this.isConfiguring) {
            this.originalState = checked;
        }
        return !!this.checkedRe.test(String(checked))?'Y':'N';
    }
});
