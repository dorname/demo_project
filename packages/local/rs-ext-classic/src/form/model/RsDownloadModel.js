Ext.define('Rs.ext.form.model.RsDownloadModel', {
    extend: 'Ext.data.Model',
    fields: [{
            name: 'attachmentId',
            type: 'string'
        }, {
            name: 'attachmentIndex',
            type: 'string'
        }, {
            name: 'fileName',
            type: 'string'
        }, {
            name: 'type'
        }, {
            name: 'size'
        }, {
            name: 'state'
        }
    ]
});
