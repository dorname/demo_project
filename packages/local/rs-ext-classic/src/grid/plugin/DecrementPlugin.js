Ext.define('Rs.ext.grid.plugin.DecrementPlugin', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.decrement-plugin',
	configs:{
		panelId:''
	},
    gridFieldDecrease: function (field,record) {
		var panel,tempRecord,oldValue,newValue,me = this;
		if(!Ext.isEmpty(me.panelId)){
			panel = Ext.getCmp(me.panelId);
		}
		if(Ext.isEmpty(record)&&!Ext.isEmpty(me.panelId)){
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
    formFieldDecrease: function (id) {
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
