Ext.define('Rs.ext.telescope.model.Head', {
    extend: 'Rs.ext.telescope.model.Base',
    
    fields: [{
        name: 'prog_code',
        mapping: 'progCode',
        type: 'string'
    }, {
        name: 'prog_name',
        mapping: 'progName',
        type: 'string'
    }]
});