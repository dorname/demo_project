Ext.define('Rs.ext.telescope.view.TelescopePanel', {
    extend: 'Ext.container.Container',
	
	xtype: 'rs-telescope-panel',
	
	requires: [
		'Rs.ext.telescope.store.TeleStore',
		'Rs.ext.telescope.store.TeleMetaStore',
		'Rs.ext.telescope.view.TelescopeForm',
		'Rs.ext.telescope.view.TelescopeGrid'
	],
	
	mixins: ['Ext.util.StoreHolder'],

    minHeight: 240,
    minWidth: 380,

    height: 320,
    width: 480,

    resizable: {
        pinned: true,
        handles: 'nw se'
    },
    layout: 'border',

    config: {
		progCode: '',
		gridConfig: {}
    },
	
	privates: {
		conditions: ''
	},
	
	setConditions: function (conditions) {
		var me = this;
		me.conditions = conditions;
	},
	
	createStore: function (details) {
		var me = this, store, fields = [];
		details.each(function (detail) {
			var name = detail.get('field_name'),
				alias = name.split('.').pop();
			fields.push({
				name: name,
				mapping: alias.toUpperCase()
			});
		});
		store = Ext.create('Rs.ext.telescope.store.TeleStore', {
			fields: fields
		});		
		me.setStore(store);
		return store;
	},
	
	createColumns: function (details) {
		var me = this, columns = [];
		details.each(function (detail) {
			columns.push({
				minWidth: 100,
				text: detail.get('desc_zh'),
				dataIndex: detail.get('field_name'),
				hidden: detail.get('is_hidden') == 'Y'
			});
		});
		columns = me.initColumns(columns);
		return columns;
	},

	initColumns: function (columns) {
		var me = this;
		columns = [].concat(me.mergeColumns(columns) || []);
		me.afterMergeColumns(columns);
		return columns;
	},
	
	//列合并策略
	mergeColumns: function (columns) {
		var me = this, 
			cols = [], mappings = {},
			gridConfig = me.gridConfig || {};			
		
		if (Ext.isArray(gridConfig.columns)) {
			Ext.each(columns, function (col) {
				mappings[col.dataIndex] = col;
			});
			
			Ext.each(gridConfig.columns, function (col) {
				var idx = col.dataIndex;
				cols.push(Ext.apply(mappings[idx], col)); 
			});
		} else {
			cols = columns;
		}
		//获取显示的列,用于hash记录
		console.log(cols.length, 'columns===>', cols);
		return cols;
	},
	
	afterMergeColumns: function (cols) {
		var me = this, displayCols = [];
		Ext.each(cols, function (col) {
			var idx = col.dataIndex;
			if (!col.hidden && idx) {
				displayCols.push(idx);
			}
		});
		console.log('displayCols:', displayCols);
		me.displayColumns = displayCols;
	},
	
	createFields: function (criterias) {
		var me = this, fields = [];
		criterias.each(function (criteria) {
			var fieldName = me.handlerSpecialKey(criteria.get('field_name'));
			//console.log(fieldName);
			fields.push({
				name: 		fieldName,
				emptyText: 	criteria.get('desc_zh')
			});
		});
		return fields;
	},
	//对特殊字段名的处理如decode(vehicle_name, 'P', '飞机', 'T', '火车', 'S', '轮船') as vehicle_name 
	handlerSpecialKey: function (val) {
		var pattern = ' AS ',
			idx = val.toUpperCase().lastIndexOf(pattern);
		if (idx != -1) {
			val = val.substring(idx + pattern.length);
		}
		return val.trim();
		/*
		var queryItem ={
			
		};
		var specialCode = {
			AS:" AS ",
			as:" as "
		}
		if(value.lastIndexOf(specialCode.AS)!=-1){
			var tempAS = value.split(specialCode.AS);
			queryItem.fieldName = tempAS[0].trim();
			queryItem.itemId = tempAS[1].trim();
			return queryItem;
		}
		else if(value.lastIndexOf(specialCode.as)!=-1){
			var tempas = value.split(specialCode.as);
			queryItem.fieldName = tempas[0].trim();
			queryItem.itemId = tempas[1].trim();
			return queryItem;
		}
		else{
			queryItem.fieldName = value;
			queryItem.itemId = value;
			return queryItem;
		}
		*/
	},
	createSelModel: function () {
		var me = this,
			selModel = me.multiSelect ? {
				mode: 'MULTI',
				checkOnly: false,
				selType: 'checkboxmodel'
			} : {
				mode: 'SINGLE',
				selType: 'rowmodel'
			};
		console.log('multiSelect====>', selModel);
		return selModel;
	},
	
	createGrid: function (store, columns) {
		var me = this, selModel = me.createSelModel();
		var grid = Ext.create('Rs.ext.telescope.view.TelescopeGrid', {
			store: store,
			columns: columns,
			region: 'center',
			selModel: selModel
		});
		
		me.initGrid(grid);
		return grid;
	},
	
	initGrid: function (grid) {
		var me = this,
			pagingtbar = grid.getDockedItems('pagingtoolbar')[0],		
			ok = pagingtbar.child('#ok'),
			clear = pagingtbar.child('#clear'),
			close = pagingtbar.child('#close');
			
		ok.setHidden(me.multiSelect ? false : true);
		
		me.relayEvents(ok, 		['click'], 'pagingtbar-ok-');
		me.relayEvents(clear, 	['click'], 'pagingtbar-clear-');
		me.relayEvents(close, 	['click'], 'pagingtbar-close-');
	},
	
	createForm: function (store, fields) {
		var me = this,
			form = Ext.create('Rs.ext.telescope.view.TelescopeForm', {
				region: 'north',
				animCollapse: false
			});
		form.setStore(store);
		form.setFields(fields);
		form = me.initForm(form);
		return form;
	},
	
	initForm: function (form) {
		var me = this;
		form.on('query', me.onFormQuery, me);
		return form;
	},
	
	onFormQuery: function (values) {
		var me = this, fields = [];
		Ext.iterate(values, function (key, value) {
			if (!Ext.isEmpty(value)) {
				fields.push(key + " like '" + value + "%'");
			}
		});
		me.setConditions(fields.join(' and '));
	},
	
	resetForm: function () {
		var me = this;
		me.form.reset();
	},
	
    initComponent: function () {
		this.callParent(arguments);
		
		var me = this, 
			progCode = me.progCode;
					
		var meta = me.meta = Ext.create('Rs.ext.telescope.store.TeleMetaStore', {
			prog_code: progCode
		});
		
		meta.load({
			params: {
				prog_code: progCode
			},
			callback: function (records) {
				var model = meta.first();
				
				//grid
				var store, columns, grid;
				
				var details = model.details();
				if (!Ext.isEmpty(details)) {
					store = me.createStore(details);
					columns = me.createColumns(details);
					grid = me.createGrid(store, columns);
					
					me.relayEvents(store, ['load'], 'store-');
					me.relayEvents(grid, ['deselect', 'beforeselect', 'select'], 'grid-');
				}
				
				//form
				var form, fields,
					head = model.getHead(),
					criterias = model.criterias();
				if (!Ext.isEmpty(criterias)) {
					fields = me.createFields(criterias);
				}
				console.log('fields:', fields);
				form = me.createForm(store, fields);
				if (!Ext.isEmpty(head)) {
					form.setTitle(head.get('prog_name') || '');
				}
				
				me.grid = grid;
				me.form = form;
				
				me.add([grid, form]);
				store.loadPage(1);
				me.show();
			}
		});
    },
	
	refresh: function () {
		var me = this, store = me.getStore();
		if (store && !store.isLoading()) {
			store.loadPage(1);
		}
	},
	
	getStoreListeners: function (store) {
		var me = this;
        return {
            beforeload: me.onBeforeload
        }
	},
	
	onBeforeload: function (store, operation) {
		var me = this,
			conditions = me.conditions,
			params = operation.getParams();
		
		conditions = Ext.valueFrom(conditions, ' 1 = 1 ');
		conditions = me.buildProgCondtion(conditions);
		
		operation.setParams(Ext.apply({}, {
			prog_code: me.progCode,
			prog_condition: conditions
		}, params));
	},
	
	buildProgCondtion: Ext.identityFn
});