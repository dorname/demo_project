Ext.define('Rs.ext.telescope.store.TeleMetaStore', function () {
    return {
        extend: 'Ext.data.Store',
        
        model: 'Rs.ext.telescope.model.Meta',

		proxy: {
			type: 'ajax',
			url: '/base/telescope/meta',
			//url: 'http://192.168.3.110:8083/meta',
			//url: 'http://192.168.3.110:8083/telescope/meta',
			//url: 'http://192.168.3.110:9303/telescope/meta',
			
			reader: {
				type: 'json',
				rootProperty: 'data'
			}
		}
    }
});