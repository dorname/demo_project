Ext.define('Rs.ext.telescope.model.Meta', {
    extend: 'Rs.ext.telescope.model.Base',
    
    requires: [
        'Rs.ext.telescope.model.Head',
        'Rs.ext.telescope.model.Detail',
		'Rs.ext.telescope.model.Criteria'
    ],

    fields: [{
        name: 'prog_code',
        mapping: 'progCode',
        type: 'string'
    }],
	
	hasOne: ['Head'],
    hasMany: ['Detail', 'Criteria']
	
});