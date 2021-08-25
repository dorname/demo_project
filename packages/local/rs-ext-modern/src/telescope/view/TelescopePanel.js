Ext.define('Rs.ext.telescope.view.TelescopePanel', {
    extend: 'Ext.Dialog',
	//override: 'Ext.Dialog',
	
	requires: [
		'Rs.ext.telescope.store.TeleStore',
		'Rs.ext.telescope.store.TeleMetaStore',
		'Rs.ext.telescope.view.TelescopeForm',
		'Rs.ext.telescope.view.TelescopeGrid'
	],
	
	hidden: true,
	
	title: '望远镜',
	width: '85%',
	height: 420,
	minHeight: 280,
	
	layout: 'vbox',
	
	closable: true,
	closeAction: 'hide',
	maximizable: true,
	
	//collapsible: false,
	
	shadow: false,
	draggable: false,
	hideAnimation: false,
	showAnimation: false,
	restoreAnimation: false,
	maximizeAnimation: false,
	
	embeded: false,

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
		
		me.store = store;
		
		store.on(me.getStoreListeners(store));
		
		//me.setStore(store);
		
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
		console.log(columns,"<======");
		return columns;
	},

	initColumns: function (columns) {
		var me = this;
		columns = [{
			locked: true,
			xtype: 'rownumberer'
		}].concat(me.mergeColumns(columns) || []);
		me.afterMergeColumns(columns);
		return columns;
	},
	
	//列合并策略
	mergeColumns: function (columns) {
		var me = this, 
			cols = [], mappings = {},
			gridConfig = me.getGridConfig() || {};			
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
		var fields = [];
		criterias.each(function (criteria) {
			fields.push({
				text: 	criteria.get('desc_zh'),
				value: 	criteria.get('field_name')
			});
		});
		return fields;
	},
	
	createSelModel: function () {
		var me = this,
			selModel = me.multiSelect ? {
				mode: 'multi',
				checkbox: true,
				checkboxColumnIndex: 1
			} : {
				mode: 'single',
				checkbox: false,
				toggleOnClick: false
			};
		console.log('multiSelect====>', selModel);
		return selModel;
	},
	
	createGrid: function (store, columns) {
		var me = this, selModel = me.createSelModel();
		var grid = Ext.create('Rs.ext.telescope.view.TelescopeGrid', {
			flex: 1,
			store: store,
			columns: columns,
			selectable: selModel
		});
		
		me.initGrid(grid);
		return grid;
	},
	
	initGrid: function (grid) {
		var me = this, 
			selectable = grid.getSelectable();
		//---------------------
		selectable.getSelection().refresh = Ext.emptyFn;
	},
	
	createForm: function (store, fields) {
		var me = this,
			form = Ext.create('Rs.ext.telescope.view.TelescopeForm', {
				animCollapse: false
			});
		form.store = store;
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
	
    initialize: function () {
	
		this.callParent(arguments);
		
		var me = this, 
			progCode = me.getProgCode();
		
		var meta = me.meta = Ext.create('Rs.ext.telescope.store.TeleMetaStore', {
			prog_code: progCode
		});
		
		var toggleForm = function () {
			var tool = this, 
				form = me.form, 
				isHidden = form.isHidden();
			form[isHidden ? 'show' : 'hide']();
			tool.setType(isHidden ? 'up' : 'down');
		};
		
		meta.load({
			params: {
				prog_code: progCode
			},
			callback: function (records) {
				var model = meta.first();
				
				if (Ext.isEmpty(model)) {
					Ext.raise('望远镜服务异常, 请检查望远镜后台服务!');
				}
				
				//grid
				var store, columns, grid;
				
				var details = model.details();
				if (!Ext.isEmpty(details)) {
					store = me.createStore(details);
					columns = me.createColumns(details);
					grid = me.createGrid(store, columns);
					
					me.relayEvents(store, ['load'], 'store-');
					me.relayEvents(grid, ['deselect', 'select'], 'grid-');
				}
				
				//form
				var form, fields,
					head = model.getHead(),
					criterias = model.criterias();
				if (!Ext.isEmpty(criterias)) {
					fields = me.createFields(criterias);
				}
				
				if (!Ext.isEmpty(fields)) {
					me.addTool({
						type: 'up',
						handler: toggleForm
					});
				}
				
				form = me.createForm(store, fields);
				
				if (!Ext.isEmpty(head)) {
					me.setTitle(head.get('prog_name') || '');
				}
				
				me.form = form;
				me.grid = grid;
				
				me.add([form, grid]);
				store.loadPage(1);
				//me.embeded || me.show();
			}
		});
    },
	
	refresh: function () {
		var me = this, store = me.store;
		if (store && !store.isLoading()) {
			store.loadPage(1);
		}
	},
	
	getStoreListeners: function (store) {
		var me = this;
        return {
            beforeload: me.onBeforeload,
			scope: me
        }
	},
	
	onBeforeload: function (store, operation) {
		var me = this,
			conditions = me.conditions,
			progCode = me.getProgCode(),
			params = operation.getParams();
			
		
		selectable = me.grid.getSelectable();
		selectable.deselectAll(true);
		console.log('beforeload...', me, progCode);
		
		conditions = Ext.valueFrom(conditions, ' 1 = 1 ');
		conditions = me.buildProgCondtion(conditions);
		
		operation.setParams(Ext.apply({}, {
			prog_code: progCode,
			prog_condition: conditions
		}, params));
	},
	
	buildProgCondtion: Ext.identityFn
});