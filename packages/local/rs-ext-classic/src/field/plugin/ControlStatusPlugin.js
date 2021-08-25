	/**
	 * @Rs.ext.field.plugin.ControlStatusPlugin
	 * @extends Ext.plugin.Abstract
	 * @author 
	 * 后台业务状态控制插件
	 */
Ext.define('Rs.ext.field.plugin.ControlStatusPlugin',{
	
	extend:'Ext.plugin.Abstract',
	alias:'plugin.controlstatus',
	requires:'Ext.form.field.Field',
	
	configs:{
		panelId:'',
		controlObj:'',
		errorCode:'',
		tipType:''
	},
	
	init:function(){
		var me = this;
		if(me.config.panelId && Ext.getCmp(me.config.panelId).isXType('form')){ //卡片
			var obj = me.config.controlObj;
			if(obj){
				for(var i = 0; i < obj.length; i++){
					(function(){
						var queryStr = obj[i].queryStr;
						var targetValue = obj[i].targetValue;
						var reg = /\[(.*?)\]/gi;
						var tmp = queryStr.match(reg);
						if(tmp && tmp.length==1){
							var fieldId = tmp[0].replace(reg, "$1");
							Ext.getCmp(fieldId).on('blur',function(cmp){
								var sql = queryStr.replace(tmp[0],cmp.getValue());
								me.formFieldsControlStatus(sql,fieldId,targetValue);
							});
						}
					})();
				}
			}
		}
	},
	
	formFieldsControlStatus:function(sql,fieldId,targetValue){
		var params = {};
		params.sql = sql;
		Ext.Ajax.request({
			url: '/base/sql/excute',
			jsonData: params,
			async:false,
			method:'POST',
			success: function(response, opts) {
				var data = [];
				var responseText = Ext.decode(response.responseText)
				if(responseText.success){
					data = responseText.data;
				}else{
					console.log("系统提示",responseText.mesg);
				}
				if(data.length<1){
					Ext.getCmp(fieldId).setValue();
				}
			},
			failure: function(response, opts) {
				Ext.getCmp(fieldId).setValue();
				console.log("系统提示","服务器未连接");
			}
		});
	}
	
});