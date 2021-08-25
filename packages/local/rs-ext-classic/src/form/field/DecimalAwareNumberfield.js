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
	
	afterRender: function () {
		var me = this, panelId = me.panelId;
		me.callParent(arguments);
		
		if (!Rs || !Rs.DECIMALS) {
			console.error('确保 Rs.DECIMALS 不为空!');
			return ;
		}
	
		if (Ext.isEmpty(Rs.DECIMALS[panelId])) {
			console.error('panelId属性为空, 导致获取不到该组件所对应的小数位数!');
			return ;
		}
		
		var compId = me.compId,
			//保证IDE能够编辑
			decimals = Rs.DECIMALS[panelId];
			//decimals = Ext.Component.getDecimals(panelId);
		
		if (Ext.isEmpty(compId) || (decimals[compId] == undefined)) {
			console.error('itemId属性为空, 导致获取不到该组件所对应的小数位数!');
			return ;
		}
		me.decimalPrecision = decimals[compId];
	}
});