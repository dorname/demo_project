Ext.define('Rs.ext.grid.plugin.FieldDiffentControlF',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.fielddiffentcontrolf',
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
		/*me.grid.on('edit',function(editPlugin,context){
			        
			me.gridAttributeUnsame(me.itemIds,me.checkField,context);
		});*/
		
	},
	
	
    gridAttributeUnsame:function(context){
		var me = this,
			itemIds = me.itemIds,
			checkField = me.checkField,
			record = context.record,
			field = context.field;
		rowIndex = context.rowIdx;
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
		if(record.get(checkField).toString()==checkValue.toString()){
			record.set(checkField,'');
			Ext.Msg.alert('提示','业务属性一致');
			return false;
		}else{
			return true;
		}
		
		
	}

});
