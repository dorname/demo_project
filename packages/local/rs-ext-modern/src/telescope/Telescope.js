Ext.define('Rs.ext.telescope.Telescope', {
	extend: 'Ext.field.Text',
	
	alias: 'widget.telescope',
	
	requires: [
		'Rs.ext.telescope.view.TelescopePanel'
	],
	
	isTelescope: true,
	
	matchFieldWidth: false,

	config: {
		/**
		 * @cfg {String} progCode
		 * 望远镜编码
		 */
		progCode: null,
		
		/**
		 * @cfg {Function} buildProgCondtion
		 * 望远镜动态条件处理
		 */
		buildProgCondtion: Ext.identityFn,
		 
		/**
		 * @cfg {String} displayField
		 * 望远镜的显示字段
		 */
		displayField: '',
		
		/**
		 * @cfg {String} valueField
		 * 望远镜的反填值字段
		 */
		valueField: '',
		
		/**
		 * @cfg {Boolean} multiSelect
		 * 多选望远镜 (默认为false, 即单选望远镜)
		 */
		multiSelect: false,
		
		/**
		 * @cfg {String} separator
		 * 多选望远镜的分割字符串
		 */
		separator: ',',
		
		/**
		 * @cfg {Object} gridConfig
		 * 望远镜的grid面板配置
		 */
		gridConfig: {},
		
		lastSelection: []
	},
	
	type: 'floated',
	
	triggers: {
		expand: {
			type: 'expand'
		}
	},
	
	internelId: 'telescope-model-id',
	
	selection: [],
	
	setSelection: function (models) {
		var me = this, selection = [];
		Ext.each(models, function (model) {
			model.isModel && selection.push(model);
		});		
		me.selection = selection;
	},
	
	getSelection: function () {
		var me = this;
		return me.selection;
	},
	
	initialize: function () {
		var me = this;
		me.callParent();
		//me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);
		me.cached = Ext.create('Ext.util.Collection', {
			keyFn: function (record) {
				return record[me.internelId];
			}
		});
		console.log(me.cached.getKey);
	},
	
	//Override
	setValue: function (value) {
		var me = this,
			values = [],
			displays = [],
			sp = me.separator;
		
		if (Ext.isArray(value)) {
			var models = value;
			Ext.each(models, function (model) {
				model = me.doBeforeSetValue(model);
				values.push(model[0]);
				displays.push(model[1]);
			});
			console.log(values, displays);
			me.callParent([values.join(sp)]);
			me.inputElement.dom.value = displays.join(sp);
		} else {
			value = Ext.isEmpty(value) ? [] : [value];
			return me.setValue(value);
		}
		var selection = me.getSelection();
		me.setSelection(value);
		me.setLastSelection(selection);
	},
	
	doBeforeSetValue: function (model) {
		var me = this;
		if (Ext.isObject(model) && model.isModel) {
			var vf = me.getValueField(),
				df = me.getDisplayField();
			return [model.get(vf), model.get(df)];	
		} else {
			return [model, model];
		}
	},
	
	onExpandTap: function(field) {
		console.log(this, arguments);
		var me = this, 
			cached = me.cached, 
			dialog = me.getDialog(),
			selection = me.getSelection();
			
		console.log('selection:', selection);
		cached.removeAll().add(selection);
		me.highlightSelection(selection);
		dialog.show().refresh();
	},
	
	
	getDialog: function () {
		var me = this, dialog = me.dialog;
		
		if (!dialog) {
			var progCode = me.getProgCode(),
				gridConfig = me.getGridConfig(),
				multiSelect = me.getMultiSelect(),
				buildProgCondtion = me.getBuildProgCondtion();
				console.log('gridConfig====>', gridConfig);
			dialog = Ext.create('Rs.ext.telescope.view.TelescopePanel', {
				id: me.id + '-dialog',
				hidden: true,
				embeded: true,
				
				floating: true,
				pickerField: me,
				
				progCode: progCode,
				gridConfig: gridConfig,
				multiSelect: multiSelect,
				buildProgCondtion: buildProgCondtion.bind(me)
			});
			me.initDialog(dialog);
			me.dialog = dialog;
		}
		return dialog;
	},
	
	initDialog: function (dialog) {
		var me = this;
		dialog.on({
			scope: me,
			'store-load': 	me.onStoreLoad,
			
			'grid-select':	me.onSelect,
			'grid-deselect': me.onDeselect
		});
		
		if (!me.getMultiSelect()) {
			dialog.on('grid-select', me.onSingleSelect, me);
		}
		
		return dialog;
	},
	
	//hash策略
	identifier: function (model) {
		var me = this, dialog = me.dialog, identifier = [];
		Ext.each(dialog.displayColumns, function (name) {
			identifier.push(model.get(name));
		});
		return identifier.join();
	},
	
	onSelect: function (selModel, model) {
		console.log('onSelect:', arguments);
		var me = this, cached = me.cached,
			id = me.identifier(model);
		if (!cached.containsKey(id)) {
			model[me.internelId] = id;
			cached.add(model);
		}
		console.log("cached-onSelect===", cached.getCount(), ":", cached.getRange());
	},
	
	onDeselect: function (selModel, model) {
		console.log('onDeselect:', arguments);
		var me = this, cached = me.cached,
			id = me.identifier(model);
		if (cached.containsKey(id)) {
			model[me.internelId] = id;
			cached.remove(model);
		}
		console.log("cached-onDeselect===", cached.getCount(), ":", cached.getRange());
	},
	
	onStoreLoad: function (store, records) {
		console.log('----->');
		var me = this, 
			selection = [], cached = me.cached;
				
		Ext.each(records, function (record) {
			var id = me.identifier(record);
			if (cached.containsKey(id)) {
				record[me.internelId] = id;
				selection.push(record);
			}
		});
		
		if (!Ext.isEmpty(selection)) {
			me.syncSelection(selection);
			me.highlightSelection(selection);
		}
	},
	
	syncSelection: function (selection) {
		var me = this, cached = me.cached;
		cached.add(selection);
		me.setSelection(cached.getRange());
	},
	
	highlightSelection: function (selection) {
		var me = this, grid = me.dialog.grid;
		
		if (Ext.isEmpty(selection)) {
			selection = false;
		}
		if (grid && grid.rendered) {
			grid.suspendEvent('select', 'deselect');
			grid.setSelection(selection);
			grid.resumeEvent('select', 'deselect');
		}
	},
		
	//单选模式
	onSingleSelect: function (selModel, record) {
		var me = this,
			valueField = me.getValueField(),
			displayField = me.getDisplayField();
		
		if (me.fireEvent('beforeselect', me, record) != false) {
			me.fireEvent('select', me, record, selModel);
			me.setValue(record);
			me.collapse();
		}
	},
	
	collapse: function () {
		var me = this, dialog = me.dialog;
		dialog.hide();
	},
	
	doQuery: function (rawValue) {
		var me = this, dialog,
			vf = me.getValueField(),
			df = me.getDisplayField(),
			conditions, fields = [];
			
		me.expand();
		dialog = me.dialog;
		
		console.log('rawValue:==>', rawValue);
		
		if (!Ext.isEmpty(rawValue)) {
			Ext.each([vf, df], function (field) {
				fields.push(field + " like '" + rawValue + "%'");
			});
			conditions = '(' + fields.join(' or ') + ')';
		}
		dialog.setConditions(conditions);
		dialog.refresh();
	}
});