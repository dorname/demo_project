Ext.define('Rs.ext.grid.plugin.FieldSameControlB',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.fieldsamecontrolb',
	//requires:'Ext.button.Button',
	configs:{
		
		/**
		*@cfg {string} itemId
		*控件id
		*/
		itemIds:'',
		
		/**
		*@cfg {string} panelId
		*来源面板id
		*/
		panelId:'',
		
		/**
		*@cfg {string} panelId
		*数据面板id
		*/
		dataPanelId:'',
		
		/**
		*@cfg {string} tableCode
		*数据表
		*/
		tableCode:'',
		
		/**
		*@cfg {string} fields
		*数据表字段
		*/
		fields:'',
		
		/**
		*@cfg {string} condition
		*约束条件
		*/
		condition:'',
		
		/**
		*@cfg {string} errorCode
		*错误信息码
		*/
		errorCode:'',
		
		/**
		*@cfg {string} tipType
		*提示类型
		*/
		tipType:''
	},
	//初始化插件
	init:function(grid){
		var me = this,
		editPlugin,
		gridPluginsArray = grid.getPlugins();
		
		if(Ext.isEmpty(me.panelId)){
			Ext.Msg.alert("系统提示","插件参数配置错误");
			return false
		}

		//来源面板id有值，数据面板id无值————则为单列表页面
		if(Ext.getCmp(me.panelId).isXType('grid') && Ext.isEmpty(me.dataPanelId)){
			me.gridFunction(gridPluginsArray,editPlugin);
		}else if(Ext.getCmp(me.panelId).isXType('form') && Ext.getCmp(me.dataPanelId).isXType('grid')){
			me.mixFunction();
		}else{
			Ext.Msg.alert("系统提示","插件参数配置错误");
			return false
		}
	},
	
	doSql : function(sql){
		var count = 0;
		
		var controlSql = sql;
		
		var params = {};
		params.sql = controlSql;
		
		Ext.Ajax.request({
			url: '/base/sql/excute',
			jsonData: params,
			async:false,
			method:'POST',
			success: function(response, opts) {
				if(Ext.decode(response.responseText).success){
					count = Ext.decode(response.responseText).data[0].COUNT;
					return count
				}else{
					Ext.Msg.alert("系统提示",Ext.decode(response.responseText).mesg);
				}
			},
			failure: function(response, opts) {
				Ext.Msg.alert("系统提示","服务器未连接");
			}
		});

		
		//return count;
	},
	
	doSql123 : function(sql){
		var count = 0;
		return count;
	},
	
	//xtype为grid——单列表页面
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
		
		// editPlugin.on('edit',function(editPlugin,context){
			// me.singleGridFunction(editPlugin,context.record,context.field,context.rowIdx);
		// },me);
	},
	
	//混合页面
	singleGridFunction : function(editPlugin,context_record,context_field,context_rowIdx){
		var me = this;
		
		var sql = "select ";
		var fieldSql = "";
		var field;
		var symbleFlag = false;
			
		var fieldsArray = new Array();
		fieldsArray = me.fields.split(",");
		if(fieldsArray.length == 0){
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
		
		for(j = 0; j < fieldsArray.length; j++){
			if(j == 0){
				fieldSql = fieldSql + fieldsArray[j];
			}else{
				fieldSql = fieldSql + ", " + fieldsArray[j];
			}
		}
		
			sql = sql + fieldSql + " from " + me.tableCode + " where 1=1 ";
		
			var formula = me.condition;
			var formulaResult = "";
			
			var lastFieldsValueArray = new Array();
			var newFieldsValueArray = new Array();
			var record = context_record;
			//console.log(context);
			var nowRowNum;
			//console.log(record);
			if(context_field == me.itemIds){
				nowRowNum = context_rowIdx;
				//当前点击的不是第一行
				if(nowRowNum != 0){
					//console.log(Ext.getCmp(me.panelId).getStore().getAt(nowRowNum-1));
					//获取目标行关联字段的值
					for(i = 0; i < fieldsArray.length; i++){
						lastFieldsValueArray[i] = Ext.getCmp(me.panelId).getStore().getAt(nowRowNum-1).get(fieldsArray[i]);
					}
					//console.log(lastFieldsValueArray);
					
					formulaResult = "";
					if(!Ext.isEmpty(formula)){
						for(i=0;i<formula.length;i++){
							//console.log(formula.charAt(i));
							if(formula.charAt(i) == "["){
								symbleFlag = true;
								field = "";
							}else if(formula.charAt(i) == "]"){
								symbleFlag = false;
								//console.log("field:"+field);
								//console.log("field_name:"+record.get(field));
								if(Ext.isEmpty(record.get(field))){
									value = "''";
									formulaResult = formulaResult + value.toString();
								}else{
									value = "'" + record.get(field) + "'";
									formulaResult = formulaResult + value.toString();
								}
							}else if(!symbleFlag){
								formulaResult = formulaResult + formula.charAt(i);
							}else if(symbleFlag){
								field = field + formula.charAt(i);
							}
						}
					}
					
					sql = sql + formulaResult;
					
					var controlSql = sql;
					//var controlSql = "select uu_id, sys_code from Sys_Program_Log where acct_code = 'zhongyang' and uu_id = '12'";
					var params = {};
					params.sql = controlSql;
					
					Ext.Ajax.request({
						url: '/base/sql/excute',
						jsonData: params,
						async:false,
						method:'POST',
						success: function(response, opts) {
							if(Ext.decode(response.responseText).success){
								if(Ext.decode(response.responseText).data.length > 1){
									Ext.Msg.alert("系统提示","找到多条记录");
									record.set(me.itemIds,"");
									return false
								}else if(Ext.decode(response.responseText).data.length == 0){
									Ext.Msg.alert("系统提示","未找到记录");
									record.set(me.itemIds,"");
									return false
								}else{
									for(i = 0; i < fieldsArray.length; i++){
										newFieldsValueArray[i] = Ext.decode(response.responseText).data[0][fieldsArray[i].toUpperCase()];
									}
								}
							}else{
								Ext.Msg.alert("系统提示",Ext.decode(response.responseText).mesg);
								return false
							}
						},
						failure: function(response, opts) {
							Ext.Msg.alert("系统提示","服务器未连接");
							return false
						}
					});
					if(me.arraryCompare(lastFieldsValueArray,newFieldsValueArray)){
						//找到一致记录
						return true
					}else{
						//未找到一致记录
						record.set(me.itemIds,"");
						return false
					}
				}else{
					return true;
				}		
			}else{
				return true;
			}
	},
	
	//混合页面
	mixFunction : function(){
		var me = this;
		
		var sql = "select ";
		var fieldSql = "";
		var symbleFlag = false;
		var formulaResult = "";
		var formula = me.condition;
		var field;
		
		var fieldsArray = new Array();
		fieldsArray = me.fields.split(",");
		if(fieldsArray.length == 0){
			Ext.Msg.alert('提示','控制规则配置错误');
			return false;
		}
		
		for(j = 0; j < fieldsArray.length; j++){
			if(j == 0){
				fieldSql = fieldSql + fieldsArray[j];
			}else{
				fieldSql = fieldSql + ", " + fieldsArray[j];
			}
		}
		
		
		if(Ext.isEmpty(me.itemIds)){
			return false
		}
		var item = Ext.getCmp(me.itemIds);
			
		item.on('blur',function(editPlugin,context){
			var lastFieldsValueArray = new Array();
			var newFieldsValueArray = new Array();
			
			var lastRowNum = Ext.getCmp(me.dataPanelId).getStore().data.length;
			//获取数据面板最后一行关联字段的值
			for(i = 0; i < fieldsArray.length; i++){
				lastFieldsValueArray[i] = Ext.getCmp(me.dataPanelId).getStore().getAt(lastRowNum-1).get(fieldsArray[i]);
			}
			//console.log(lastFieldsValueArray);
			sql = "select ";
			sql = sql + fieldSql + " from " + me.tableCode + " where 1=1 ";
			formulaResult = "";
			if(!Ext.isEmpty(formula)){
				for(i=0;i<formula.length;i++){
					//console.log(formula.charAt(i));
					if(formula.charAt(i) == "["){
						symbleFlag = true;
						field = "";
					}else if(formula.charAt(i) == "]"){
						symbleFlag = false;
						if(Ext.isEmpty(Ext.getCmp(field))){
							Ext.Msg.alert('提示','插件配置错误-匹配条件中未找到对应的控件');
							Ext.getCmp(me.itemIds).setValue("");
							return false
						}else if(Ext.isEmpty(Ext.getCmp(field).getValue())){
							value = "''";
							formulaResult = formulaResult + value.toString();
						}else{
							value = "'" + Ext.getCmp(field).getValue() + "'";
							formulaResult = formulaResult + value.toString();
						}
					}else if(!symbleFlag){
						formulaResult = formulaResult + formula.charAt(i);
					}else if(symbleFlag){
						field = field + formula.charAt(i);
					}
				}
			}
			sql = sql + formulaResult;
			
			var controlSql = sql;
			//var controlSql = "select uu_id, sys_code from Sys_Program_Log where acct_code = 'zhongyang' and uu_id = '12'";
			var params = {};
			params.sql = controlSql;
				
			Ext.Ajax.request({
				url: '/base/sql/excute',
				jsonData: params,
				async:false,
				method:'POST',
				success: function(response, opts) {
					if(Ext.decode(response.responseText).success){
						if(Ext.decode(response.responseText).data.length > 1){
							Ext.Msg.alert("系统提示","找到多条记录");
							Ext.getCmp(me.itemIds).setValue("");
							return false
						}else if(Ext.decode(response.responseText).data.length == 0){
							Ext.Msg.alert("系统提示","未找到记录");
							Ext.getCmp(me.itemIds).setValue("");
							return false
						}else{
							for(i = 0; i < fieldsArray.length; i++){
								newFieldsValueArray[i] = Ext.decode(response.responseText).data[0][fieldsArray[i].toUpperCase()];
							}
						}
					}else{
						Ext.Msg.alert("系统提示",Ext.decode(response.responseText).mesg);
						return false
					}
				},
				failure: function(response, opts) {
					Ext.Msg.alert("系统提示","服务器未连接");
					return false
				}
			});
			
			if(me.arraryCompare(lastFieldsValueArray,newFieldsValueArray)){
				//找到一致记录
				return true
			}else{
				//未找到一致记录
				Ext.getCmp(me.itemIds).setValue("");
				return false
			}
		});
	},
	
	
	arraryCompare : function(arrary1,arrary2){
		var compareFlag = true;
		if(arrary1.length != arrary2.length){
			Ext.Msg.alert("系统提示","验证模型报错");
			return false;
		}
		
		for(i = 0; i < arrary1.length; i++){
			if(arrary1[i] == arrary2[i]){
				
			}else{
				compareFlag = false;
			}
		}
		return compareFlag;
	}
});
