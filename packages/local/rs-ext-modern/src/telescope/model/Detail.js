Ext.define('Rs.ext.telescope.model.Detail', {
    extend: 'Rs.ext.telescope.model.Base',
	
    fields: [{
		name: 'seq_no',
        mapping: 'seqNo',
        type: 'int'
	}, {
        name: 'prog_code',
        mapping: 'progCode',
        type: 'string'
    }, {
        name: 'field_name',
        mapping: 'fieldName',
        type: 'string'
    }, {
		name: 'is_hidden',
		mapping: 'isHidden',
		type: 'string'
	}, {
        name: 'desc_zh',
        mapping: 'descZh',
        type: 'string'
    }, {
        name: 'desc_en',
        mapping: 'descEn',
        type: 'string'
    }]
});