Ext.define('Rs.ext.telescope.store.TeleMetaStore', function () {
    return {
        extend: 'Ext.data.Store',
        
        model: 'Rs.ext.telescope.model.Meta',

		proxy: {
			type: 'ajax',
			url: '/base/telescope/meta',
			reader: {
				type: 'json',
				rootProperty: 'data'
			}
		}
    }
});