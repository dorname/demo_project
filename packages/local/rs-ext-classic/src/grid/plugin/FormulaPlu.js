Ext.define('Rs.ext.grid.plugin.FormulaPlu',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.formulaplu',
	//requires:'Ext.button.Button',
	configs:{
		
		/**
		*@cfg {string} panelId
		*面板id
		*/
		panelID:'',
		
		/**
		*@cfg {string} formula
		*运算公式
		*/
		formula:'',
		
		/**
		*@cfg {string} erroCode
		*错误信息码
		*/
		erroCode:'',
		
		/**
		*@cfg {string} otherCdt
		*附加触发验证条件
		*/
		otherCdt:''
	},
	//初始化插件
	init:function(grid){
		//var me = this,
		//editPlugin;
		
		//editPlugin = Ext.getCmp("button");
		
		//editPlugin.on('click',function(editPlugin,context){
			//验证附加触发条件
			//console.log("触发条件:"+me.otherCdt);
			
			//me.formulaPlu();
		//},me);
		
	},
	
	//xtype为grid
	formulaPlu : function(gridPluginsArray,editPlugin){
		var me = this;
		//console.log("面板id:"+me.panelID);
		//console.log("运算公式:"+me.formula);
		var formulaComponent  = new Array();
		formulaComponent = me.formula.split("=");
		//console.log("运算公式左边:"+formulaComponent[0]);
		//console.log("运算公式右边:"+formulaComponent[1]);
		
		var formula = formulaComponent[0];
		var formula_right = formulaComponent[1];
		
		var errArr = [];
		
		var errFlag = true;
		var uuId = Ext.getCmp(me.panelID).getStore().getModel().idProperty;
		
		Ext.getCmp(me.panelID).getStore().each(function(record){
			
			var formulaResult = "";
			var formulaResult_condition = "";
			var symbleFlag = false;
			var symbleFlag_right = false;
			var symbleFlag_condition = false;
			var field = "";
			var field_condition = "";
			var value = 0;
			var fieldArr = [];
			
			var condition = me.otherCdt;
			if(!Ext.isEmpty(me.otherCdt)){
				for(i=0;i<condition.length;i++){
					//console.log(formula.charAt(i));
					if(condition.charAt(i) == "["){
						symbleFlag_condition = true;
						field_condition = "";
					}else if(condition.charAt(i) == "]"){
						symbleFlag_condition = false;
						//console.log("field_condition:"+field_condition);
						//console.log("field_name:"+record.get(field_condition));
						if(Ext.isEmpty(record.get(field_condition))){
							//Ext.Msg.alert('提示','附加触发验证条件为空值，无法验证');
							break;
						}else{
							formulaResult_condition = formulaResult_condition + "'" +record.get(field_condition).toString() + "'";
						}
						//formulaResult_condition = formulaResult_condition + record.get(field_condition).toString();
					}else if(condition.charAt(i) == "="){
						formulaResult_condition = formulaResult_condition + '==';
					}else if(!symbleFlag_condition){
						formulaResult_condition = formulaResult_condition + condition.charAt(i);
					}else if(symbleFlag_condition){
						field_condition = field_condition + condition.charAt(i);
					}
				}
			}else{
				formulaResult_condition = "1==1"
			}
			
			if(me.doStr(formulaResult_condition)){
				if(!Ext.isEmpty(record.get(uuId))){
					for(i=0;i<formula.length;i++){
						//console.log(formula.charAt(i));
						if(formula.charAt(i) == "["){
							symbleFlag = true;
							field = "";
						}else if(formula.charAt(i) == "]"){
							symbleFlag = false;
							//console.log("field:"+field);
							//console.log("field_name:"+record.get(field));
							if(Ext.isEmpty(record.get(field))|| record.get(field) == 0){
								fieldArr.push(field);
								value = parseFloat(0);
								value = value.toFixed(2);
								formulaResult = formulaResult + value.toString();
							}else if(isNaN(record.get(field))){
								console.log('formulaPlu插件字段存在字符串，无法计算');
								break;
							}else{
								fieldArr.push(field);
								value = parseFloat(record.get(field));
								value = value.toFixed(2);
								formulaResult = formulaResult + value.toString();
							}
							//formulaResult = formulaResult + record.get(field).toString();
						}else if(!symbleFlag){
							formulaResult = formulaResult + formula.charAt(i);
						}else if(symbleFlag){
							field = field + formula.charAt(i);
						}
					}
					
					formulaResult = formulaResult + "==";
					
					for(i=0;i<formula_right.length;i++){
						//console.log(formula.charAt(i));

						if(formula_right.charAt(i) == "["){
							symbleFlag_right = true;
							field = "";
						}else if(formula_right.charAt(i) == "]"){
							symbleFlag_right = false;
							//console.log("field:"+field);
							//console.log("field_name:"+record.get(field));
							if(Ext.isEmpty(record.get(field)) || record.get(field) == 0){
								fieldArr.push(field);
								value = parseFloat(0);
								value = value.toFixed(2);
								formulaResult = formulaResult + value.toString();
							}else if(isNaN(record.get(field))){
								console.log('formulaPlu插件字段存在字符串，无法计算');
								break;
							}else{
								fieldArr.push(field);
								value = parseFloat(record.get(field));
								value = value.toFixed(2);
								formulaResult = formulaResult + value.toString();
							}
							//formulaResult = formulaResult + record.get(field).toString();
						}else if(!symbleFlag_right){
							formulaResult = formulaResult + formula_right.charAt(i);
						}else if(symbleFlag_right){
							field = field + formula_right.charAt(i);
						}
					}
					
					if(me.doStr(formulaResult)){
						//console.log("正确");
					}else{
						errFlag = false;
						var obj = {
							uuid 		: record.get(uuId),
							chkField 	: fieldArr
						};
						errArr.push(obj);
					}
					
				}
				
			}

			//console.log("formulaResult::::"+formulaResult);
			//console.log(record);
			//console.log(me.analysisFormula(formulaComponent[0]).toString(),record);
		});
		
		var obj = {
			success 	: errFlag,
			errMsg 		: me.erroCode,
			panelID 	: me.panelID,
			errArr 		: errArr
		}
		
		console.log(obj);
		return obj;
		//console.log(me.analysisFormula(formulaComponent[0]).toString());
	},
	
	doStr: function(fn){
		var Fn = Function;
		return new Fn("return " + fn)();
	}
});
