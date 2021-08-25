Ext.define('Rs.ext.overrides.grid.column.Number', {
    override: 'Ext.grid.column.Number',
	
	afterRender: function() {
		var me = this;
		me.callParent(arguments);
		var panelId = me.up('grid').id,
			itemId = me.itemId;
		
		var decimals = Rs.DECIMALS[panelId]; //Ext.Component.getDecimals(panelId);
		
		if(!Ext.isEmpty(decimals)) {
			var format = me.format;
			format = format.split('.')[0] + '.' + Ext.String.leftPad('', decimals[itemId] || 2, '0');
			me.format = format;
			console.log('====>', format);
		}
	}
});