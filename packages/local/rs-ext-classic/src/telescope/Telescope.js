Ext.define('Rs.ext.telescope.Telescope', {
	extend: 'Ext.form.field.Picker',
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
		 * 是否允许多选 (默认为false, 即单选望远镜)
		 */
		multiSelect: false,
		
		/**
		 * @cfg {String} separator
		 * 多选望远镜的分割字符串, 默认为: ,
		 */
		separator: ',',
		
		/**
		 * @cfg {Object} gridConfig
		 * 望远镜的grid面板配置
		 */
		gridConfig: {},
		
		/**
		 * @cfg {Object} panelConfig
		 * 望远镜的弹出面板配置
		 */
		panelConfig: {},
		
		/**
		 * @cfg {Boolean} forceSelection
		 * true:  限制望远镜的值来源于列表 (默认值)
		 * false: 允许用户手动输入望远镜的值
		 */
		forceSelection: true,
		
		/**
		 * @cfg {Boolean} recordPreSelection
		 * true: 默认高亮上一次选中值(默认值)
		 * false: 取消高亮
		 */
		recordPreSelection:	false,
		
		/**
		 * @cfg {Boolean} autoBackfill
		 * true: 当查询结果只有一条时, 自动将该值反填到单选望远镜
		 * false: 取消自动反填(默认值)
		 */
		autoBackfill: false
	},
	
	selection: [],
	previousValue: [],
	internelId: 'telescope-model-id',
	
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
	
	initComponent: function () {
		var me = this;
		me.callParent();
		me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);		
		me.cached = Ext.create('Ext.util.Collection', {
			keyFn: function (record) {
				return record[me.internelId];
			}
		});
	},
	
	//Override
	setValue: function (value, isModel) {
		var me = this,
			values = [],
			displays = [],
			selection = [],
			sp = me.separator;
		
		if (Ext.isArray(value)) {
			var models = value;
			Ext.each(models, function (model) {
				if (Ext.isObject(model) && model.isModel) {
					selection.push(model);
				}
				model = me.doBeforeSetValue(model);
				values.push(model[0]);
				displays.push(model[1]);
			});
			me.setSelection(selection);
			me.callParent([values.join(sp)]);
			me.setRawValue(displays.join(sp));
		} else {
			value = Ext.isEmpty(value) ? [] : [value];
			return me.setValue(value, isModel);
		}
		me.previousValue = value;
	},
	
	doBeforeSetValue: function (model) {
		var me = this;
		if (Ext.isObject(model) && model.isModel) {
			var vf = me.valueField,
				df = me.displayField;
			return [model.get(vf), model.get(df)];	
		} else {
			return [model, model];
		}
	},
	
	//Override
	getValue: function () {
		var me = this;
		return me.value;
	},
	
	/**
	 * onFocusLeave主要用于支持可编辑望远镜.
	 * 通过对已选记录和文本框的原始值,来设置望远镜的编辑状态
	 */
	onFocusLeave: function (e) {
		var me = this,
			value = me.getValue(),
			raw = me.getRawValue();
		me.doQueryTask.cancel();
		
		if (me.mutated) {
			if (me.forceSelection) {
				me.setValue(me.previousValue);
			} else {
				me.setValue(raw);
			}
			me.mutated = false;
		}
		
		if (Ext.isEmpty(raw) && !Ext.isEmpty(value)) {
			me.setValue(raw);
		}
		me.callParent(arguments);
	},
	
	
	createPicker: function () {
		var me = this, picker;
		
		picker = Ext.create(Ext.apply({
			id: me.id + '-picker',
			hidden: true,
			floating: true
			//draggable: true
		}, {
			xtype: 'rs-telescope-panel',
			pickerField: me,
			progCode: me.progCode,
			gridConfig: me.gridConfig,
			multiSelect: me.multiSelect,
			buildProgCondtion: me.buildProgCondtion.bind(me)
		}, me.panelConfig));
		
		picker.on({
			scope: me,
			'grid-select':	me.onSelect,
			'grid-deselect': me.onDeselect,
			'store-load': 	me.onStoreLoad,
			'pagingtbar-ok-click': me.onOk,
			'pagingtbar-clear-click': me.onClear,
			'pagingtbar-close-click': me.onClose
		});
		
		if (!me.multiSelect) {
			picker.on('grid-select', me.onSingleSelect, me);
		}
		
		return picker;
	},
	
	//hash策略
	identifier: function (model) {
		var me = this, picker = me.picker, identifier = [];
		Ext.each(picker.displayColumns, function (name) {
			identifier.push(model.get(name));
		});
		return identifier.join();
	},
	
	onSelect: function (selModel, model) {
		var me = this, cached = me.cached,
			id = me.identifier(model);
		if (!cached.containsKey(id)) {
			model[me.internelId] = id;
			cached.add(model);
		}
	},
	
	onDeselect: function (selModel, model) {
		var me = this, cached = me.cached,
			id = me.identifier(model);
		if (cached.containsKey(id)) {
			model[me.internelId] = id;
			cached.remove(model);
		}
	},
	
	onOk: function () {
		var me = this, 
			cached = me.cached,
			records = cached.getRange();
		if (me.fireEvent('ok', me, records) != false) {
			me.setValue(records, true);
			me.collapse();			
		}
	},
	
	onClear: function () {
		var me = this;
		me.setValue([], true);
		me.cached.removeAll();
		me.highlightSelection([]);
		if (!me.forceSelection) {
			me.focus();
		}
		me.fireEvent('clear', me);
	},
	
	onClose: function () {
		var me = this;
		if (me.fireEvent('close', me) != false) {
			me.collapse();
		}
	},
	
	onStoreLoad: function (store, records) {
		var me = this, selection = [], 
			cached = me.cached, rawValue = me.getRawValue();
			
		if (me.recordPreSelection) {
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
		}
		
		if (me.autoBackfill && !me.multiSelect && me.forceSelection) {
			//如果返回结果只有一条记录,则直接反填.
			//(当且仅当该望远镜为可自动反填,不允许手动输入的单选望远镜.)
			if (records && records.length == 1) {
				if (!me.expandFromTrigger && !Ext.isEmpty(rawValue)) {
					me.setValue(store.first(), true);
					me.collapse();
				}
			}
		}
	},
	
	syncSelection: function (selection) {
		var me = this, cached = me.cached;
		cached.add(selection);
		me.setSelection(cached.getRange());
	},
	
	highlightSelection: function (selection) {
		var me = this, grid = me.picker.grid;
		
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
			valueField = me.valueField,
			displayField = me.displayField;
		
		if (me.fireEvent('beforeselect', me, record) != false) {
			me.fireEvent('select', me, record, selModel);
			me.lastDisplayValue = record.get(displayField);
			
			me.setValue(record, true);			
			me.collapse();
		}
	},
	
	onCollapse: function () {
		var me = this;
		me.expandFromTrigger = false;
		me.callParent(arguments);
		var	picker = me.picker;
		picker.resetForm();
		
	},
	
	onExpand: function () {
		var me = this, 
			cached = me.cached, 
			selection = me.selection;
		cached.removeAll().add(selection);
		me.callParent(arguments);
	},
	
	onTriggerClick: function () {
		var me = this, picker = me.picker;
		me.expandFromTrigger = true;
		if (picker) {
			picker.setConditions('');
			picker.refresh();
		}
		me.callParent(arguments);
	},
	
	onFieldMutation: function (e) {
		var me = this;
		me.callParent([e]);
		if (e.type == 'keyup') {
			me.mutated = true;
			if (!me.readOnly && me.editable) {
				me.doQueryTask.delay(500);
			}
		}
	},
	
	doRawQuery: function() {
        var me = this,
			rawValue = me.getRawValue();
        me.doQuery(rawValue, false, true);
    },
	
	doQuery: function (rawValue) {
		var me = this, picker,
			vf = me.valueField,
			df = me.displayField,
			conditions, fields = [];
			
		me.expand();
		picker = me.picker;
		
		if (!Ext.isEmpty(rawValue)) {
			Ext.each([vf, df], function (field) {
				fields.push(field + " like '" + rawValue + "%'");
			});
			conditions = '(' + fields.join(' or ') + ')';
		}
		picker.setConditions(conditions);
		picker.refresh();
	}
});