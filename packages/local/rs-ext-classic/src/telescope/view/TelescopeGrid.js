Ext.define('Rs.ext.telescope.view.TelescopeGrid', {
    extend: 'Ext.grid.Panel',
	
	forceFit: true,
	
	dockedItems: [{
		xtype: 'pagingtoolbar',
		displayInfo: false,
		dock: 'bottom',
		items: [{
			xtype: 'tbfill'
		}, {
			xtype: 'button',
			itemId: 'clear',
			text: '清空'
		}, '-', {
			xtype: 'button',
			itemId: 'close',
			text: '关闭'
		}, '-', {
			xtype: 'button',
			itemId: 'ok',
			text: '确定'
		}]
	}]
});