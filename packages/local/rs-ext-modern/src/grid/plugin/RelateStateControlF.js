Ext.define('Rs.ext.grid.plugin.RelateStateControlF',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.relatestatecontrolf',
	//requires:'Ext.button.Button',
	configs:{
		
		/**
		*@cfg {string} panelId
		*关联控件id
		*/
		itemIds:'',
		
		/**
		*@cfg {string} panelId
		*关联面板ID
		*/
		relatePanelId:'',
		
		/**
		*@cfg {string} checkFields
		*关联字段
		*/
		relateFields:'',
		
		/**
		*@cfg {string} targetValues
		*业务字段
		*/
		checkFields:'',
		
		/**
		*@cfg {string} targetValues
		*目标值
		*/
		targetValues:'',
		
		/**
		*@cfg {string} controlRule
		*空值规则
		*/
		controlRule:'',
		
		/**
         *@cfg {string} allRowEnable
         *defaultValue:false
         *是否控制该行全部数据列
         */
        allRowEnable: false,
		
		/**
		*@cfg {string} erroCode
		*错误信息码
		*/
		erroCode:''
	},
	//初始化插件
	init:function(grid){
		var me = this,
		editPlugin,
		gridPluginsArray = grid.getPlugins();
		
		if(grid.isXType('grid')){
			//me.gridFunction(gridPluginsArray,editPlugin);
			
			me.grid = grid;
			me.grid.store.on('update',function(store, record, operation, modifiedFieldNames, details, eOpts){
				
				me.relateStateControl(store,record,modifiedFieldNames);
			});
		}
	},
	
	//xtype为grid
	gridFunction : function(gridPluginsArray,editPlugin){
		// var me = this;
		
		// Ext.each(gridPluginsArray,function(pluginObj){
			// if("cellediting"===pluginObj.ptype){
				// editPlugin = pluginObj;
			// }
			// if("rowediting"===pluginObj.ptype){
				// editPlugin = pluginObj;
			// }
		// },this);
				
		// editPlugin.on('beforeedit',function(editPlugin,context){
			// return me.relateStateControl(editPlugin,context.record,context.field);
		// },me);
	},
	
	relateStateControl: function(store,record,field){
		var me = this;
		
		var returnFlag = false;
		//var record = context.record;
			//var field = context.field;
			 
		var itemIdArray = new Array();
		itemIdArray = me.itemIds.split(",");
		
		var fieldArray = new Array();
		//fieldArray = field.split(",");
		fieldArray = field;
				
		var checkFieldsArray = new Array();
		checkFieldsArray = me.checkFields.split(",");
				
		var targetValuesArray = new Array();
		targetValuesArray = me.targetValues.split(",");
			
		var controlRuleArray = new Array();
		controlRuleArray = me.controlRule.split(",");
			
		var relateFieldsArray = new Array();
		relateFieldsArray = me.relateFields.split(",");
			
		//console.log(relateFieldsArray);
			
		if(targetValuesArray.length != checkFieldsArray.length){
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
			
		if(targetValuesArray.length != controlRuleArray.length){
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
		
		console.log(fieldArray);
		
		var clickFieldFlag = false;
		if(me.allRowEnable){
			clickFieldFlag = true;
		}else{
			for(j = 0; j < itemIdArray.length; j++){
				for(i = 0; i < fieldArray.length; i++){
					if(fieldArray[i] == itemIdArray[j]){
						clickFieldFlag = true;
					}
				}
			}
		}
		
		if(clickFieldFlag){
			for(j = 0; j < targetValuesArray.length; j++){
				
				//获取目标行关联字段的值
				var relateFieldsValueArray = new Array();
				for(i = 0; i < relateFieldsArray.length; i++){
					relateFieldsValueArray[i] = record.get(relateFieldsArray[i]);
				}
					
				//如果是新增行，则返回false
				var newRecordFlag = true;
				for(i = 0; i < relateFieldsValueArray.length; i++){
					if(!isNaN(relateFieldsValueArray[i])||!Ext.isEmpty(relateFieldsValueArray[i])){
						newRecordFlag = false;
					}
				}
				
				if(newRecordFlag){
					return true;
				}
					
				var findFlag;
				var value;
				//符合关联条件的记录数
				var count = 0;
				//业务字段的值
				var checkValue;
				//console.log(Ext.getCmp(me.relatePanelId).getStore());
				Ext.getCmp(me.relatePanelId).getStore().each(function(record){
					//console.log(record);
					//console.log(record.get("vehicle_name"));
					findFlag = true;
					for(z = 0; z < relateFieldsArray.length; z++){
						if(record.get(relateFieldsArray[z]) != undefined){
							value = record.get(relateFieldsArray[z]).toString();
							if(value != relateFieldsValueArray[z]){
								findFlag = false;
							}
						}else{
							findFlag = false;
						}
					}
					//if(record.crudState==='D'){
					//	deleteRecordsData.push(record.data);
					//}
					if(findFlag){
						//console.log(record);
						//console.log(record.get("SYS_CODE"));
						checkValue = record.get(checkFieldsArray[j]).toString();
						count = count + 1;
					}
						
						
					//console.log(1);
				});
				if(count == 0){
					Ext.Msg.alert('提示','未找到关联的记录，请重新定义关联字段');
					return false;
				}else if(count > 1){
					return false;
					Ext.Msg.alert('提示','找到多个关联的记录，请重新定义关联字段');
				}
				//console.log(count);
					
					
				//var checkValue = record.get(checkFieldsArray[j]);
				var targetValue = targetValuesArray[j].toString();
				var controlRule = controlRuleArray[j];
					
				//console.log(checkValue);
				//console.log(targetValue);
				//console.log(controlRule);
					
				if(controlRule=='>'){
					if(checkValue > targetValue){
						returnFlag = true;
					}
				}else if(controlRule=='<'){
					if(checkValue < targetValue){
						returnFlag = true;
					}
				}else if(controlRule=='>='){
					if(checkValue >= targetValue){
						returnFlag = true;
					}
				}else if(controlRule=='<='){
					if(checkValue <= targetValue){
						returnFlag = true;
					}
				}else if(controlRule=='='){
					if(checkValue == targetValue){
						returnFlag = true;
					}
				}else if(controlRule=='<>'||controlRule=='!='){
					if(checkValue != targetValue){
						returnFlag = true;
					}
				}else{
					//Ext.Msg.alert('提示','控制规则配置错误');
				}
			
			}
			if(returnFlag){
/* 				if(!Ext.isEmpty(me.erroCode)){
					Rs.Msg.messageAlert({stateCode:me.erroCode});
				} */
				return false;
			}else{
				return true;
			}
		}else{
			return true;
		}
	}
});
