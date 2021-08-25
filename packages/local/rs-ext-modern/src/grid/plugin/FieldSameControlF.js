	/**
	 * @Rs.ext.grid.plugin.FieldsDifferentControlB
	 * @extends Ext.plugin.Abstract
	 * @author pangmeichen
	 * 前台业务属性一致控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldSameControlF',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.fieldsamecontrolf',
	/*requires: [
		//'Rs.ext.button.RsButton'
		'Ext.form.field.Field'
	],*/
	configs:{
		itemIds:'',
		panelId:'',
		checkField:[],
		errorCode:''
	},

	//初始化插件
	init:function(grid){
		var me = this;
		me.grid = grid;
/* 		me.grid.on('edit',function(editPlugin,context){
			       
			me.gridAttributeSame(context);
		}); */
		
		me.grid.store.on('update',function(store, record, operation, modifiedFieldNames, details, eOpts){
				//me.gridCompareControl(record,modifiedFieldNames);
				me.gridAttributeSame(store,record,operation,modifiedFieldNames, details, eOpts);
		});

/* 		Ext.getCmp(me.itemIds).on('blur',function(context){
			        alert(2);
				//me.formCompareControl(me.itemIds,me.checkField,me.controlRule);
				me.gridAttributeSame(context);
		}); */
		
	},
	
	
    gridAttributeSame:function(context,record,operation,modifiedFieldNames, details, eOpts){
		var me = this,
		itemIds = me.itemIds,
		checkField = me.checkField,
		//record = context.record,
		field = modifiedFieldNames;
		rowIndex = context.indexOf(record);
		
		if(field!=itemIds){
			return true;
		}

		if(rowIndex==0){
			return true;
		}

		if(Ext.isEmpty(record.get(checkField))){
			return true;
		}
		var checkValue = me.grid.getStore().getAt(rowIndex-1).get(checkField);
		if(record.get(checkField).toString()!=checkValue.toString()){
			record.set(checkField,'');
			//Ext.Msg.alert('提示','业务属性不一致');
			console.log('提示','业务属性不一致');
			return false;
		}else{
			return true;
		}
		
		
	}

});
