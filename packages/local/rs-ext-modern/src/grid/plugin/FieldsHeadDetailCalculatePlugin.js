	/**
	 * @Rs.ext.grid.plugin.FieldsHeadDetailCalculatePlugin
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 头数值与明细数值计算
	 */
Ext.define('Rs.ext.grid.plugin.FieldsHeadDetailCalculatePlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.headDetailCalculate',
	requires:'Ext.field.Field',
	configs:{
		hPanelID:'',
		hFields:'',
		dFields:'',
		errorCode:''
	},
	init:function(grid){
		var me = this;
		me.getCmp().store.on('update',function(store, record, operation, modifiedFieldNames, details, eOpts){
			me.headCalculate(store);
		});
	},
	headCalculate:function(store){
		var me = this;
		var hPanelID = me.config.hPanelID;
		if(!Ext.getCmp(hPanelID)){
			console.log('提示:头面板ID配置错误');
		}
		var hFields = me.config.hFields;
		var dFields = me.toArr(me.config.dFields);

		var headNumber = 0;
		var detailNumber = 0;
		var fieldFlag = false;
		var equation = '';
		for(var i = 0; i < dFields.length; i++){
			detailNumber = 0;
			fieldFlag = false;
			var fieldsObj = store.model.getFieldsMap();
			store.each(function(record,idx) {
				if(dFields[i] in fieldsObj){
					fieldFlag = true;
					var value = record.get(dFields[i].trim());
					value = value?value:0;
					detailNumber = (isNaN(parseFloat(detailNumber))?0:parseFloat(detailNumber)) + (isNaN(parseFloat(value))?0:parseFloat(value));
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
			console.log('提示:明细字段配置错误');
			return false;
		}
		headNumber = detailNumber.toFixed(2);
		if(Ext.getCmp(hPanelID).isXType('grid')){//列表
			var headStore = Ext.getCmp(hPanelID).getStore();
			headStore.each(function(record,idx) {
				var selectedRecord = Ext.getCmp(hPanelID).getSelection();
				var selectIndex = headStore.indexOf(selectedRecord);
				if(idx==selectIndex && selectIndex>-1){
					record.set(hFields,headNumber);
					return true;
				}
			});
		}else{//卡片
			if(!Ext.getCmp(hFields)){
				console.log('提示:头字段配置错误');
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
	},
	toArr: function(str){
		var arr1 = [];
		if(str.indexOf('+')>-1){
			var arr = str.split('+');
			for(var i=0;i<arr.length;i++){
				arr1.push(arr[i].trim());
				i<arr.length-1&&arr1.push('+');
			}
		}else{
			arr1.push(str);
		}
		
		var arr2 = [];
		for(var i=0;i<arr1.length;i++){
			var temStr = arr1[i];
			if(temStr.indexOf('-')>-1){
				var arr = temStr.split('-');
				for(var i=0;i<arr.length;i++){
					arr2.push(arr[i].trim());
					i<arr.length-1&&arr2.push('-'); 
				}
			}else{
				arr2=arr1;
			}
		}
		
		var arr3 = [];
		for(var i=0;i<arr2.length;i++){
			var temStr = arr2[i];
			if(temStr.indexOf('*')>-1){
				var arr = temStr.split('*');
				for(var i=0;i<arr.length;i++){
					arr3.push(arr[i].trim());
					i<arr.length-1&&arr3.push('*');
				}
			}else{
				arr3=arr2;
			}
		}
		
		var arr4 = [];
		for(var i=0;i<arr3.length;i++){
			var temStr = arr3[i];
			if(temStr.indexOf('/')>-1){
				var arr = temStr.split('/');
				for(var i=0;i<arr.length;i++){
					arr4.push(arr[i].trim());
					i<arr.length-1&&arr4.push('/');
				}
			}else{
				arr4=arr3;
			}
		}
		return arr4;
	}
});