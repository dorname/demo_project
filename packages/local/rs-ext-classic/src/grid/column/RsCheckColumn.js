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
            ret,
            checked;
 
        // Flag event to tell SelectionModel not to process it.
        e.stopSelection = !key && me.stopSelection;
 
        if (!disabled && (isClick || (key === e.ENTER || key === e.SPACE))) {
            if(me.isRecordChecked(record)==true || me.isRecordChecked(record) =='Y'){
				checked=false;
			}else{
				checked=true;
			}
			//checked = !me.isRecordChecked(record);
 
            // Allow apps to hook beforecheckchange
            if (me.fireEvent('beforecheckchange', me, recordIndex, checked, record, e) !== false) {
				var checkValue ='';
				if(checked==true || checked === 'Y'){
					checkValue = 'Y';
				}else{
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
        }
        else {
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
 
        if (value==true || value =='Y') {
            cls += ' ' + me.checkboxCheckedCls;
            tip = me.checkedTooltip;
        }
        else {
            tip = me.tooltip;
        }
 
        if (tip) {
            cellValues.tdAttr += ' data-qtip="' + Ext.htmlEncode(tip) + '"';
        }
 
        if (me.useAriaElements) {
            cellValues.tdAttr += ' aria-describedby="' + me.id + '-cell-description' +
                                 (!value ? '-not' : '') + '-selected"';
        }
 
        // This will update the header state on the next animation frame
        // after all rows have been rendered.
        me.updateHeaderState();
 
        return '<span class="' + cls + '" role="' + me.checkboxAriaRole + '"' +
                (!me.ariaStaticRoles[me.checkboxAriaRole] ? ' tabIndex="0"' : '') +
               '></span>';
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
            }
            else {
				var checkValue='';
				if(checked==true || checked =='Y'){
					checkValue='Y';
				}else{
					checkValue='N';
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
 
        if (value==true || value =='Y') {
            tip = me.checkedTooltip;
        }
        else {
            tip = me.tooltip;
        }
 
        if (tip) {
            cell.setAttribute('data-qtip', tip);
        }
        else {
            cell.removeAttribute('data-qtip');
        }
 
        if (me.useAriaElements) {
            me.updateCellAriaDescription(null, value, cell);
        }
 
        cell = Ext.fly(cell);
 
        cell[me.disabled ? 'addCls' : 'removeCls'](me.disabledCls);
 
        // eslint-disable-next-line max-len
		var clsValue=true;
		if(value==true || value =='Y'){
			clsValue = true;
		}else{
			clsValue = false;
		}
        Ext.fly(cell.down(me.getView().innerSelector, true).firstChild)[clsValue ? 'addCls' : 'removeCls'](Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
 
        // This will update the header state on the next animation frame
        // after all rows have been updated.
        me.updateHeaderState();
    }
});
