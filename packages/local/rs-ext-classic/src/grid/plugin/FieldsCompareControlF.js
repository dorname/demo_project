	/**
	 * @Rs.ext.grid.plugin.FieldsCompareControlF
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 两个业务属性比较控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldsCompareControlF',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.fieldsCompare',
	requires:'Ext.form.field.Field',
	configs:{
		itemIds:'',
		panelId:'',
		checkField:'',
		controlRule:'',
		errorCode:''
	},
	init:function(grid){
		var me = this;
		if(grid.isXType('grid')){
			me.grid = grid;
			/*me.grid.on('edit',function(editPlugin,context){
				me.gridCompareControl(me.itemIds,me.checkField,me.controlRule,context);
			});*/
		}else{
			if(!Ext.getCmp(me.itemIds) || !Ext.getCmp(me.checkField)){
				Ext.Msg.alert('提示','控件配置错误');
				return false;
			}
			Ext.getCmp(me.itemIds).on('blur',function(){
				me.formCompareControl(me.itemIds,me.checkField,me.controlRule);
			});
			Ext.getCmp(me.checkField).on('blur',function(){
				me.formCompareControl(me.itemIds,me.checkField,me.controlRule);
			});
		}
	},
	formCompareControl:function(itemIds,checkField,controlRule){
		var newValue = Ext.getCmp(itemIds).value;
		var compareValue = Ext.getCmp(checkField).value;
		if(isNaN(newValue)||Ext.isEmpty(newValue)){
			return false;
		}
		if(isNaN(compareValue)||Ext.isEmpty(compareValue)){
			return false;
		}
		if(['>','<','>=','<=','==','!=='].includes(controlRule)){
			if(!this.doStr('parseFloat('+newValue+')' + controlRule + 'parseFloat('+compareValue+')')){
				Ext.Msg.alert('提示','不满足控制规则');
				Ext.getCmp(itemIds).setValue();
				return false;
			}else{
				return true;
			}
		}else{
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
	},
	gridCompareControl:function(context){
		var me = this,
			record = context.record,
			field = context.field,
			itemIds = me.itemIds,
			checkField = me.checkField,
			controlRule = me.controlRule;
			newValue = record.get(itemIds),
			compareValue = record.get(checkField);
		if(field!=itemIds && field!=checkField){
			return true;
		}
		if(isNaN(newValue)||Ext.isEmpty(newValue)){
			return false;
		}
		if(isNaN(compareValue)||Ext.isEmpty(compareValue)){
			return false;
		}
		if(['>','<','>=','<=','==','!=='].includes(controlRule)){
			if(!this.doStr('parseFloat('+newValue+')' + controlRule + 'parseFloat('+compareValue+')')){
				Ext.Msg.alert('提示','不满足控制规则');
				record.set(itemIds,'');
				return false;
			}else{
				return true;
			}
		}else{
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
	},
	doStr: function(fn){
		var Fn = Function;
		return new Fn("return " + fn)();
	}
});