	/**
	 * @Rs.ext.grid.plugin.FieldsDifferentControlB
	 * @extends Ext.plugin.Abstract
	 * @author xiaozhisong
	 * 后台业务属性不一致控制插件
	 */
Ext.define('Rs.ext.grid.plugin.FieldsDifferentControlB',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.fieldsdifferentb',
	requires:'Ext.field.Field',
	configs:{
		itemIds:'',
		panelId:'',
		tableCode:'',
		fields:'',
		condition:'',
		errorCode:'',
		tipType:''
	},
	init:function(){
		//var me = this;
		//if(Ext.getCmp(me.config.panelId).isXType('grid')){
			/*
			Ext.getCmp(me.config.panelId).on('edit',function(editPlugin,context){
				me.gridFieldsDifferentControlB(context);
			});
			*/
		//}else{
		//	var fields = me.config.fields.split(',');
		//	for(var i = 0; i < fields.length; i++){
		//		if(!Ext.getCmp(fields[i])){
		//			Ext.Msg.alert('提示','控件配置错误');
		//			return false;
		//		}else{
		//			Ext.getCmp(fields[i]).on('blur',function(field){
		//				me.formFieldsDifferentControlB(field);
		//			});
		//		}
		//	}
		//}
	},
	formFieldsDifferentControlB:function(field){
		var me = this;
		var con = '1 = 1';
		var companyCode = (typeof(USERINFO) == "undefined"?"00":USERINFO.COMPANYCODE);
		var condition = me.config.condition.split(',');
		var fields = me.config.fields.split(',');
		for(var i = 0; i < condition.length; i++){
			if(condition[i]=="company_code"){
				con = con + " AND company_code = '"+companyCode+"'";
			}else{
				con = con + " AND " + condition[i];
			}
		}
		for(var j = 0; j < fields.length; j++){
			if(Ext.isEmpty(Ext.getCmp(fields[j]).getValue())){
				return true;
			}else{
				con = con + " AND " + fields[j] + " = " + "'" + Ext.getCmp(fields[j]).getValue() +"'";
			}
		}
		var controlSql = "select count(*) AS NUM from " + me.config.tableCode + " where " + con;
		console.log("controlSql:",controlSql);
		
		var params = {};
		params.sql = controlSql;
		
		Ext.Ajax.request({
			url: '/base/sql/excute',
			jsonData: params,
			async:false,
			method:'POST',
			success: function(response, opts) {
				if(Ext.decode(response.responseText).success){
					if(Ext.decode(response.responseText).data[0].NUM === 0){
						return true;
					}else{
						Ext.Msg.alert("系统提示","后台验证不一致未通过");
						field.setValue('');
						return false;
					};
				}else{
					Ext.Msg.alert("系统提示",Ext.decode(response.responseText).mesg);
					return false;
				}
			},
			failure: function(response, opts) {
				Ext.Msg.alert("系统提示","服务器未连接");
				return false;
			}
		});
		
	},
	gridFieldsDifferentControlB:function(context){
		var me = this;
		var record = context.record;
		var con = '1 = 1';
		var companyCode = (typeof(USERINFO) == "undefined"?"00":USERINFO.COMPANYCODE);
		var condition = me.config.condition.split(',');
		var fields = me.config.fields.split(',');
		for(var i = 0; i < condition.length; i++){
			if(condition[i]=="company_code"){
				con = con + " AND company_code = '"+companyCode+"'";
			}else{
				con = con + " AND " + condition[i];
			}
		}
		for(var j = 0; j < fields.length; j++){
			if(fields[j] in record.data){
				if(Ext.isEmpty(record.get(fields[j]))){
					return true;
				}else{
					con = con + " AND " + fields[j] + " = " + "'" + record.get(fields[j]) +"'";
				}
			}
		}
		var controlSql = "select count(*) AS NUM from " + me.config.tableCode + " where " + con;
		console.log("controlSql:",controlSql);
		
		var params = {};
		params.sql = controlSql;
		
		Ext.Ajax.request({
			url: '/base/sql/excute',
			jsonData: params,
			async:false,
			method:'POST',
			success: function(response, opts) {
				if(Ext.decode(response.responseText).success){
					if(Ext.decode(response.responseText).data[0].NUM === 0){
						return true;
					}else{
						Ext.Msg.alert("系统提示","后台验证不一致未通过");
						record.set(context.field,'');
						return false;
					};
				}else{
					Ext.Msg.alert("系统提示",Ext.decode(response.responseText).mesg);
					return false;
				}
			},
			failure: function(response, opts) {
				Ext.Msg.alert("系统提示","服务器未连接");
				return false;
			}
		});
		
	}
});