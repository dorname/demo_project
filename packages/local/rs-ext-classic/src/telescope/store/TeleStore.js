Ext.define('Rs.ext.telescope.store.TeleStore', function () {
    return {
        extend: 'Ext.data.Store',
		
		proxy: {
			type: 'ajax',
			url: '/base/telescope/read',
			
			reader: {
				type: 'json',
				rootProperty: 'data.list',
				totalProperty: 'data.total'
			}
		}
    }
});