Ext.define('Rs.ext.grid.plugin.StateControlF',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.statecontrolf',
	//requires:'Ext.button.Button',
	configs:{
		
		/**
		*@cfg {string} panelId
		*控件id
		*/
		itemIds:'',
		
		/**
		*@cfg {string} panelId
		*面板id
		*/
		panelId:'',
		
		/**
		*@cfg {string} checkFields
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
			me.gridFunction(gridPluginsArray,editPlugin);
		}else{
			me.grid = grid;
			me.grid.on('afterrender',function(editPlugin,context){
			//判断已经渲染该控件
				var itemIdArray = new Array();
				itemIdArray = me.itemIds.split(",");
					
				var checkFieldsArray = new Array();
				checkFieldsArray = me.checkFields.split(",");
					
				var targetValuesArray = new Array();
				targetValuesArray = me.targetValues.split(",");
				
				var controlRuleArray = new Array();
				controlRuleArray = me.controlRule.split(",");
				
				if(itemIdArray.length != checkFieldsArray.length){
					Ext.Msg.alert('提示','控制规则配置错误');
					return false;
				}
				
				if(targetValuesArray.length != controlRuleArray.length){
					Ext.Msg.alert('提示','控制规则配置错误');
					return false;
				}
				
				if(itemIdArray.length != targetValuesArray.length){
					Ext.Msg.alert('提示','控制规则配置错误');
					return false;
				}
				
				for(j = 0; j < itemIdArray.length; j++){
					me.panelFunction(itemIdArray[j],me.panelId,checkFieldsArray[j],targetValuesArray[j],controlRuleArray[j]);
				}
			});
		}
	},
	
	panelFunction : function(itemId,panelId,checkFields,targetValues,controlRule){
		var me =this;
					
		//console.log(Ext.getCmp(checkFields).getValue());
		var checkValue = Ext.getCmp(checkFields).getValue().toString();
		var targetValue = targetValues.toString();
		if(controlRule=='>'){
			if(checkValue > targetValue){
				Ext.getCmp(itemId).setReadOnly(true);
			}else{
				Ext.getCmp(itemId).setReadOnly(false);
			}
		}else if(controlRule=='<'){
			if(checkValue < targetValue){
				Ext.getCmp(itemId).setReadOnly(true);
			}else{
				Ext.getCmp(itemId).setReadOnly(false);
			}
		}else if(controlRule=='>='){
			if(checkValue >= targetValue){
				Ext.getCmp(itemId).setReadOnly(true);
			}else{
				Ext.getCmp(itemId).setReadOnly(false);
			}
		}else if(controlRule=='<='){
			if(checkValue <= targetValue){
				Ext.getCmp(itemId).setReadOnly(true);
			}else{
				Ext.getCmp(itemId).setReadOnly(false);
			}
		}else if(controlRule=='='){
			if(checkValue == targetValue){
				Ext.getCmp(itemId).setReadOnly(true);
			}else{
				Ext.getCmp(itemId).setReadOnly(false);
			}
		}else if(controlRule=='<>'||controlRule=='!='){
			if(checkValue != targetValue){
				Ext.getCmp(itemId).setReadOnly(true);
			}else{
				Ext.getCmp(itemId).setReadOnly(false);
			}
		}else{
			Ext.Msg.alert('提示','控制规则配置错误');
		}
	},
	
	gridStateControl : function(editPlugin,record,field){
		var me = this;
		
		var returnFlag = false;
		//var field = context.field;
			
		var itemIdArray = new Array();
		itemIdArray = me.itemIds.split(",");
			
		var fieldArray = new Array();
		fieldArray = field.split(",");
				
		var checkFieldsArray = new Array();
		checkFieldsArray = me.checkFields.split(",");
				
		var targetValuesArray = new Array();
		targetValuesArray = me.targetValues.split(",");
			
		var controlRuleArray = new Array();
		controlRuleArray = me.controlRule.split(",");
			
		if(targetValuesArray.length != checkFieldsArray.length){
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
			
		if(targetValuesArray.length != controlRuleArray.length){
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}

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
			for(j = 0; j < checkFieldsArray.length; j++){
					
				if(Ext.isEmpty(record.get(checkFieldsArray[j]))){
					return true
				}
				//console.log(record.get(checkFieldsArray[j]));
				var checkValue = record.get(checkFieldsArray[j]).toString();
				var targetValue = targetValuesArray[j].toString();
				var controlRule = controlRuleArray[j];
					
				if(controlRule=='>'){
					if(checkValue > targetValue){
						returnFlag = true;
						//return false;
					}
				}else if(controlRule=='<'){
					if(checkValue < targetValue){
						returnFlag = true;
							//return false;
					}
				}else if(controlRule=='>='){
					if(checkValue >= targetValue){
							returnFlag = true;
							//return false;
					}
				}else if(controlRule=='<='){
					if(checkValue <= targetValue){
							returnFlag = true;
							//return false;
					}
				}else if(controlRule=='='){
					if(checkValue == targetValue){
						//console.log(1);
						returnFlag = true;
							//return false;
					}
				}else if(controlRule=='<>'||controlRule=='!='){
					if(checkValue != targetValue){
						returnFlag = true;
						//return false;
					}
				}else{
					Ext.Msg.alert('提示','控制规则配置错误');
				}
				
			}	
		}
		
		if(returnFlag){
			if(!Ext.isEmpty(me.erroCode)){
				Rs.Msg.messageAlert({stateCode:me.erroCode});
			}
			return false;
		}else{
			return true;
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
			// return me.gridStateControl(editPlugin,context.record,context.field);
		// },me);
	}
});
