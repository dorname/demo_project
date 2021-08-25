Ext.define('Rs.ext.overrides.grid.CellEditor', {
    override: 'Ext.grid.CellEditor',    
	
	
    onSpecialKey: function(field, event, eOpts) {
		var me = this,
			key = event.getKey();
		//console.log(event);
		if(key === event.ENTER && event.shiftKey == false){
			event.ENTER= 9;
			event.keyCode =9;
			event.event.code= 'Tab';
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
