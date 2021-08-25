	/**
	 * @Rs.ext.grid.plugin.FieldsSumComparePlugin
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 头数值与明细数值合计值
	 */
Ext.define('Rs.ext.grid.plugin.FieldsSumComparePlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.sumCompare',
	requires:'Ext.form.field.Field',
	configs:{
		hPanelID:'',
		dPanelID:'',
		hFields:'',
		dFields:'',
		formula:'',
		errorCode:''
	},
	headDetailSumCompareControl:function(){
		var me = this;
		if(!Ext.getCmp(me.config.hPanelID)){
			Ext.Msg.alert('提示','头面板ID配置错误');
			return {"success":false,"panelId":"","errorMsg":[],"errArr":[]};
		}
		if(!Ext.getCmp(me.config.dPanelID)){
			Ext.Msg.alert('提示','明细面板ID配置错误');
			return {"success":false,"panelId":"","errorMsg":[],"errArr":[]};
		}
		var hFields = me.config.hFields.split(',');
		var dFields = me.config.dFields.split(',');
		var headNumber = 0;
		var detailNumber = 0;
		var fieldFlag = false;
		var equation = '';
		//计算头字段数值
		for(var i = 0; i < hFields.length; i++){
			headNumber = 0;
			fieldFlag = false;
			if(Ext.getCmp(me.config.hPanelID).isXType('grid')){
				Ext.getCmp(me.config.hPanelID).getStore().each(function(record,idx) {
					if(idx==Ext.getCmp(me.config.hPanelID).getSelectionModel().selectionStartIdx){
						if(hFields[i] in record.data){
							fieldFlag = true;
							headNumber = parseFloat(headNumber) + parseFloat(record.get(hFields[i]));
						}
					}
				});
			}else{
				if(Ext.getCmp(me.config.hPanelID).items.items.includes(Ext.getCmp(hFields[i]))){
					fieldFlag = true;
					headNumber = parseFloat(headNumber) + parseFloat(Ext.getCmp(hFields[i]).value);
				}
			}
			if(fieldFlag){
				headNumber = headNumber.toFixed(2);
				equation = equation + 'parseFloat('+headNumber+')';
			}else{
				equation = equation + hFields[i];
			}
		}
		headNumber = me.doStr(equation);
		if(isNaN(headNumber)||Ext.isEmpty(headNumber)){
			Ext.Msg.alert('提示','头字段配置错误');
			return {"success":false,"panelId":"","errorMsg":[],"errArr":[]};
		}
		headNumber = headNumber.toFixed(2);
		//计算明细字段数值
		equation = '';
		//var errArr = [];
		//var errArrRecord = {};
		for(var i = 0; i < dFields.length; i++){
			detailNumber = 0;
			fieldFlag = false;
			Ext.getCmp(me.config.dPanelID).getStore().each(function(record,idx) {
				if(dFields[i] in record.data){
					fieldFlag = true;
					detailNumber = parseFloat(detailNumber) + parseFloat(record.get(dFields[i]));
				}
				//errArrRecord.uuid = record.get('uuid');
				//errArrRecord.checkField = dFields;
				//console.log(errArrRecord);
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
			return {"success":false,"panelId":"","errorMsg":[],"errArr":[]};
		}
		detailNumber = detailNumber.toFixed(2);
		if(['>','<','>=','<=','==','!=='].includes(me.config.formula)){
			if(!this.doStr('parseFloat('+headNumber+')' + me.config.formula + 'parseFloat('+detailNumber+')')){
				return {
					"success":false,
					"panelId":me.config.dPanelID,
					"errorMsg":me.config.errorCode,
					"errArr":[]
				}
			}else{
				return {"success":true,"panelId":"","errorMsg":[],"errArr":[]};
			}
		}else{
			Ext.Msg.alert('提示','控制规则配置错误');
			return {"success":false,"panelId":"","errorMsg":[],"errArr":[]};
		}
	},
	doStr: function(fn){
		var Fn = Function;
		return new Fn("return " + fn)();
	}
});