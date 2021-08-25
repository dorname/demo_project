Ext.define('Rs.ext.telescope.view.TelescopeForm', {
    extend: 'Ext.Container',
	//extend: 'Ext.Panel',
	
	viewModel: {
		data: {
			selectedfield: null,
			currentValue: null
		}
	},
	
	bodyPadding: 4,
	
	animation: false,
	collapseAnimation: false,
	expandAnimation: false,
	hideAnimation: false,
	showAnimation: false,
	
	itemId: 'form',
	padding: 6,
		
	items: [{
		xtype: 'fieldcontainer',
		itemId: 'fieldcontainer',
		items: [{
			xtype: 'selectfield',
			itemId: 'options',
			reference: 'options',
			width: 144,
			picker: 'floated',
			matchFieldWidth: false,
			placeholder: '请选择...'
		}, {
			xtype: 'container',
			layout: 'center',
			padding: 2,
			items: [{
				xtype: 'label',
				html: ':'
			}]
		}, {
			flex: 1,
			xtype: 'textfield',
			itemId: 'valuefield',
			reference: 'valuefield',
			bind: '{currentValue}',
			triggers: {
				search: {
					type: 'search'
				}
			}
		}]
	}, {
		xtype: 'container',
		itemId: 'criterias'
		//itemId: '',
		/*
		items: [{
			xtype: 'chip',
			closable: true,
			text: '物料编码: 090081'
		}, {
			xtype: 'chip',
			closable: true,
			text: '生产线编码: 090081090081'
		}]
		*/
	}],
	onSpecialkey: function (field, e) {
		console.log('onEnterKey', this, field);
		var me = this;
		if (e.getKey() == e.ENTER) {
			me.doQuery();
		}
	},

    initialize: function () {
		this.callParent(arguments);
		var me = this, 
			fc = me.child('#fieldcontainer'),
			options = fc.child('#options'),
			criterias = me.child('#criterias');
			
			
		//初始化查询按钮
		var vf = fc.child('#valuefield');
		var triggers = vf.getTriggers();
		var search = triggers.search;
		
		search.setHandler(me.doQuery.bind(me));
		
		/*
		search.setHandler(function () {
			console.log('tttt....');
			vf.blur();
			console.log(criterias.getItems());
			criterias.getItems().each(function (item) {
				if (!item.isHidden()) {
					//item.getText();
				}
			});
			var conditions = " 2 = 2 ";
			//me.fireEvent('');
			
		});
		*/
		
			
		var vm = me.getViewModel();
			
		var closeHandler = function () {
			//this.setText(null);
			this.publishState('text', null);
			this.up('container').setHidden(true);
			
		};
		
		console.log(vm);
		me.mon(options, 'change', function (sel, newValue, oldValue) {
			vm.set('currentValue', null);
			var fieldName;
			var selection = sel.getSelection();
			var display = selection.get(sel.getDisplayField());
			var tempNew = me.handlerSpecialKey(newValue);
			var tempOld;
			fieldName = tempNew.fieldName;
			newValue = tempNew.itemId;
			if(oldValue){
			 tempOld = me.handlerSpecialKey(oldValue);
			 oldValue = tempOld.itemId;
			}
			//console.log("newValue:----------->",newValue);
			var newField = criterias.child('#' + newValue),
				oldField = criterias.child('#' + oldValue);
			
			if (!Ext.isEmpty(oldField)) {
				console.log('清除bind');
				oldField.setBind({
					//text: null,
					hidden: null
				});
				oldField.child('chip').setBind({
					text: null
				});
			}
			
			if (Ext.isEmpty(newField)) {
				var chip = Ext.create({
					xtype: 'container',
					layout: 'hbox',
					align: 'center',
					//closable: true,
					itemId: newValue,
					fieldName:fieldName,
					bind: {
						hidden: '{!currentValue}'
					},
					items: [{
						xtype: 'container',
						html: display + ' : '
					}, {
						xtype: 'chip',
						closable: true,
						closeHandler: closeHandler,
						bind: {
							text: '{currentValue}'
						}
					}]
					
				});
				criterias.add(chip);
			} else {
				var chip = newField.child('chip');
				var value = chip.getText();
				
				vm.set('currentValue', value);
				
				newField.setBind({
					hidden: '{!currentValue}'
					//text: display + ':{currentValue}'
				});
				chip.setBind('{currentValue}');
			}
		});
    },
	
	setFields: function (fields) {
		var me = this, options = [];
		
		//console.log(me);
		var fc = me.child('#fieldcontainer');
		
		var options = fc.child('#options');
		
		//console.log('options:', options);
		me.suspendLayout = true;
		
		options.setOptions(fields);
		me.suspendLayout = false;
		//this.add(fields);
	},
	
	getStore: function () {
		return this.store;
	},
	
	getValues: function () {
		var me = this,
			criterias = me.child('#criterias');
		
		var values = {};
		criterias.getItems().each(function (item) {
			var chip = item.child('chip');
			if (!item.isHidden()) {
				//values[item.getItemId()] = chip.getText();
				values[item.fieldName] = chip.getText();
			}
		});
		return values;
	},
	//对特殊字段名的处理如decode(vehicle_name, 'P', '飞机', 'T', '火车', 'S', '轮船') as vehicle_name 
	handlerSpecialKey:function(value){
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
	},
	doQuery: function (btn) {
		console.log('doQuery...............', btn);
		var me = this,
			store = me.getStore(),
			values = me.getValues();
		me.fireEvent('query', values);
		store.loadPage(1);
	}
});