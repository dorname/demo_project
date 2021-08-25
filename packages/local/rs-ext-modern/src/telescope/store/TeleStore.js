Ext.define('Rs.ext.telescope.store.TeleStore', function () {
    return {
        extend: 'Ext.data.Store',
		
		proxy: {
			type: 'ajax',
			url: '/base/telescope/read',
			//url: 'http://192.168.3.110:8083/read',
			//url: 'http://192.168.3.110:8083/telescope/read',
			//url: 'http://192.168.3.110:9303/telescope/read',
			
			reader: {
				type: 'json',
				rootProperty: 'data.list',
				totalProperty: 'data.total'
			}
		}
    }
});