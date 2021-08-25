{
    classAlias: "plugin.deleterecord",
    className: "Rs.ext.grid.plugin.GridDeleteRecordPlugin", 
    inherits: "Ext.plugin.Abstract",
    autoName: "DeleteRecord", 

    toolbox: {
        name: "DeleteRecord",
		groups: ["Grids"],
        category: "Grid Plugins"
    },
	configs: [{
			name: 'style',
			type: 'object',
			doc: 'ɾ����ť��ʽ'
		},{
			name: 'beforeDeleteRecord',
			type: 'function',
			params: [{
				name: 'grid'
			}],
			doc: 'ɾ��ǰ�Զ�����֤'
		},
		{
			name: 'deleteSuccess',
			type: 'function',
			params: [{
				name: 'grid'
			},{
				name: 'response'
			}],
			doc: 'ɾ���ɹ�����'
		},
		{
			name: 'deleteFailure',
			type: 'function',
			params: [{
				name: 'grid'
			},{
				name: 'response'
			}],
			doc: 'ɾ��ʧ�ܷ���'
		}
	]
}