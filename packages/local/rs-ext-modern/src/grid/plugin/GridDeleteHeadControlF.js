	/**
	 * @Rs.ext.grid.plugin.deleteHeadControlF
	 * @extends Ext.plugin.Abstract
	 * @author YaoYu
	 * 删除头记录检查明细状态控制插件
	 */
Ext.define('Rs.ext.grid.plugin.deleteHeadControlF',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.deleteHead',
	requires:'Ext.Button',
	configs:{
		itemIds:'',
		relatePanelId:'',
		checkFields:'',
		errorCode:''
	},
	deleteHeadControl:function(){
		var me = this;
		var passFlag = true;
		var panelIds = me.config.relatePanelId.split(',');
		for(var i = 0; i < panelIds.length; i++){
			if(Ext.getCmp(panelIds[i]).getStore().getCount()<1 || Ext.getCmp(panelIds[i]).getStore().data.items[0].phantom){
				continue;
			}else{
				passFlag = false;
				if(!Ext.isEmpty(me.config.errorCode)){
					Rs.Msg.messageAlert({stateCode:me.config.errorCode});
				}
				break;
			}
		}
		return passFlag;
	}
	
});
