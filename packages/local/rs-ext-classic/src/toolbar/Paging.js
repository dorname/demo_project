Ext.define('Rs.ext.toolbar.Paging', {
	extend: 'Ext.toolbar.Paging',
	xtype: 'rs-pagingtoolbar',
	
	displayInfo: true,
	prependButtons: true,
	
	initComponent: function() {
		var preItem, me = this;
		me.callParent();
		if (me.displayInfo) {
			var items = me.items;
			items.eachKey(function (key, item) {
				if (key == 'displayItem') {
					items.removeAll([preItem, item]);
					items.insert(0, [item, preItem]);
					return false;
				}
				preItem = item;
			});
		}
    },
	
    getPagingItems: function() {
        var me = this,
			pagingItems = me.callParent();
			pagingItems.unshift('->');
		return pagingItems.slice(0, -2);
    }
});