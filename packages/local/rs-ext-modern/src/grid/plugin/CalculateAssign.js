Ext.define('Rs.ext.grid.plugin.CalculateAssign',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.calculateassign',
/* 	requires: [
		//'Rs.ext.button.RsButton'
		'Ext.form.field.Field'
	], */
	requires:'Ext.field.Field',
	configs:{
		relyOn:[],//依赖字段
		assignValue:'',
		rule:''
	},

	//初始化插件
	init:function(grid){
		var me = this;
		if(!me.relyOn||!me.assignValue||!me.rule){
			
			return false;
		}
		if(grid.isXType('grid')){//grid.xtype=='mygridpanel'||grid.xtype=='gridpanel'){
			
			me.grid = grid;
			me.grid.store.on('update',function(store, record, operation, modifiedFieldNames, details, eOpts){
				
				me.gridCalculate(record,modifiedFieldNames);
			});
			/*me.grid.on('edit',function(editPlugin,context){
				//if((me.relyOn).includes(context.field)){
					//me.gridCalculate(context);
				//} 
				me.gridCalculate(context);
				
				
			});*/

		}else{
            for(j=0;j<me.relyOn.length;j++){
				var a=me.relyOn[j];
				Ext.getCmp(a).on('blur',function(){

				    me.formCalculate(me.relyOn,me.assignValue,me.rule);

					
				});	
				
			}
			
		}
		
	},
	
	formCalculate:function(relyOn,assignValue,formula){
		var formulaResult = "";
		var symbleFlag = false;
		var field = "";
		var calResult=0;
		var me = this;
		for(i=0;i<formula.length;i++){

			if(formula.charAt(i) == "["){
				symbleFlag = true;
				field = "";
			}else if(formula.charAt(i) == "]"){
				symbleFlag = false;
				//console.log("field:"+field);
				//console.log("field_name:"+record.get(field));
				if(Ext.getCmp(field).rawValue){
					formulaResult = formulaResult + Ext.getCmp(field).rawValue.toString();
				}else{
					return false;
				}				
				
			}else if(!symbleFlag){
				formulaResult = formulaResult + formula.charAt(i);
			}else if(symbleFlag){
				field = field + formula.charAt(i);
			}
		}
		
		
		calResult = me.doStr(formulaResult);
		if(isNaN(calResult)||Ext.isEmpty(calResult)){
			Ext.Msg.alert('提示','公式字段配置错误');
			return false;
		}
		calResult = calResult.toFixed(2);
		Ext.getCmp(assignValue).setValue(calResult);
		
		return true;
        
	},
	
	gridCalculate:function(record,modifiedFieldNames){
 		var me = this;
		var assignValue = me.assignValue;
		var formula = me.rule;
		//var record = context.record;		
		var formulaResult1='';
		var symbleFlag = false;
		var field = "";
		var calResult=0;
		if((me.relyOn).includes(modifiedFieldNames[0])){

			for(i=0;i<formula.length;i++){

				if(formula.charAt(i) == "["){
					symbleFlag = true;
					field = "";
				}else if(formula.charAt(i) == "]"){
					symbleFlag = false;
					//formulaResult1 = formulaResult1 + record.get(field).toString();
					if(record.get(field)){
						formulaResult1 = formulaResult1 + record.get(field).toString();
					}else{
						return false;
					}	
				}else if(!symbleFlag){
					formulaResult1 = formulaResult1 + formula.charAt(i);
				}else if(symbleFlag){
					field = field + formula.charAt(i);
				}
			}
			
			
			calResult = me.doStr(formulaResult1);
			if(isNaN(calResult)||Ext.isEmpty(calResult)){
				Ext.Msg.alert('提示','公式字段配置错误');
				return false;
			}
			calResult = calResult.toFixed(2);
			record.set(assignValue,calResult);
			return true;
		}

        
	},
	
	doStr: function(fn){
		var Fn = Function;
		return new Fn("return " + fn)();
	}

});
