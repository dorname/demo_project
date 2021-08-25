	/**
	 * @Rs.ext.field.plugin.ControlStatusPlugin
	 * @extends Ext.plugin.Abstract
	 * @author 
	 * 后台业务状态控制插件
	 */
Ext.define('Rs.ext.field.plugin.ControlStatusPlugin',{
	
	extend:'Ext.plugin.Abstract',
	alias:'plugin.controlstatus',
	requires:'Ext.field.Field',
	
	configs:{
		panelId:'',
		controlObj:'',
		errorCode:'',
		tipType:''
	},
	
	init:function(){
		var me = this;
		var component = me.getCmp();
		var obj = me.config.controlObj;
		if(obj){
			for(var i = 0; i < obj.length; i++){
				(function(){
					var queryStr = obj[i];
					var reg = /\[(.*?)\]/gi;
					var tmp = queryStr.match(reg);
					if(tmp && tmp.length==1){
						var fieldId = tmp[0].replace(reg, "$1");
						Ext.getCmp(fieldId).on('blur',function(cmp){
							var sql = queryStr.replace(tmp[0],cmp.getValue());
							me.formFieldsControlStatus(sql,fieldId,cmp.getValue());
						});
					}
				})();
			}
		}
	},
	
	formFieldsControlStatus:function(sql,fieldId,value){
		if(!value){
			return false;
		}
		var params = {};
		var index = sql.toUpperCase().indexOf('FROM');
		sql = sql.slice(0,index)+' AS COUNT '+sql.slice(index);
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
				}else{
					var count = data[0]['COUNT'];
					if(count<1){
						Ext.getCmp(fieldId).setValue();
					}
				}
			},
			failure: function(response, opts) {
				Ext.getCmp(fieldId).setValue();
				console.log("系统提示","服务器未连接");
			}
		});
	}
	
});