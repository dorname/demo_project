	/**
	 * @Rs.ext.grid.plugin.FieldsHeadDetailCalculatePlugin
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 头数值与明细数值计算
	 */
Ext.define('Rs.ext.grid.plugin.FieldsHeadDetailCalculatePlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.headDetailCalculate',
	requires:'Ext.form.field.Field',
	configs:{
		hPanelID:'',
		dPanelID:'',
		hFields:'',
		dFields:'',
		errorCode:''
	},
	init:function(grid){
		var me = this;
		if(!Ext.getCmp(me.config.dPanelID)){
			Ext.Msg.alert('提示','明细面板ID配置错误');
			return false;
		}
		/*
		Ext.getCmp(me.config.dPanelID).on('edit',function(editPlugin,context){
			me.headCalculate(context);
		});
		*/
	},
	headCalculate:function(){
		var me = this;
		if(!Ext.getCmp(me.config.hPanelID)){
			Ext.Msg.alert('提示','头面板ID配置错误');
		}
		var hFields = me.config.hFields;
		var dFields = me.config.dFields.split(',');
		var headNumber = 0;
		var detailNumber = 0;
		var fieldFlag = false;
		var equation = '';
		for(var i = 0; i < dFields.length; i++){
			detailNumber = 0;
			fieldFlag = false;
			Ext.getCmp(me.config.dPanelID).getStore().each(function(record,idx) {
				if(dFields[i] in record.data){
					fieldFlag = true;
					detailNumber = parseFloat(detailNumber) + parseFloat(record.get(dFields[i]));
				}
			});
			if(fieldFlag){
				detailNumber = detailNumber.toFixed(2);
				equation = equation + 'parseFloat('+detailNumber+')';
			}else{
				equation = equation + dFields[i];
			}
		}
		detailNumber = me.doStr(equation);
		if(isNaN(detailNumber)||Ext.isEmpty(detailNumber)){
			Ext.Msg.alert('提示','明细字段配置错误');
			return false;
		}
		headNumber = detailNumber.toFixed(2);
		if(Ext.getCmp(me.config.hPanelID).isXType('grid')){//列表
			Ext.getCmp(me.config.hPanelID).getStore().each(function(record,idx) {
				if(idx==Ext.getCmp(me.config.hPanelID).getSelectionModel().selectionStartIdx){
					record.set(hFields,headNumber);
					return true;
				}
			});
		}else{//卡片
			if(!Ext.getCmp(hFields)){
				Ext.Msg.alert('提示','头字段配置错误');
				return false;
			}else{
				Ext.getCmp(hFields).setValue(headNumber);
				return true;
			}
		}		
	},
	doStr: function(fn){
		var Fn = Function;
		return new Fn("return " + fn)();
	}
});