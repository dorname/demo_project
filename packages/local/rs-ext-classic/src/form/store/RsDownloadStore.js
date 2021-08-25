Ext.define('Rs.ext.form.store.RsDownloadStore', function () {
    return {
        extend: 'Ext.data.Store',
        model: 'Rs.ext.form.model.RsDownloadModel',
        proxy: {
            type: 'ajax',
            //  url: 'http://192.168.2.208:9091/sys/testFileUtils/sys-attachment/crud',
            url: '/sys/testFileUtils/sys-attachment/crud',
            reader: {
                type: 'json',
                rootProperty: 'data'
            }
        }
    };
});
