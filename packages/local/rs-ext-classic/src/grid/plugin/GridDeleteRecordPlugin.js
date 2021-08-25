Ext.define('Rs.ext.grid.plugin.GridDeleteRecordPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.deleterecord',
	requires:'Ext.button.Button',
	configs:{
		/**
		*@cfg {Object} style
		*删除按钮样式
		*/
		style:{},
		/**
		*@cfg {function} beforeDeleteRecord
		*删除前逻辑函数
		*true 自定义校验通过继续执行删除
		*false 自定义校验未通过停止删除
		*/
		beforeDeleteRecord:function(grid){},
		/**
		*@cfg {function} deleteSuccess
		*删除成功逻辑函数
		*/
		deleteSuccess:function(grid,response){},
		/**
		*@cfg {function} deleteFailure
		*删除失败逻辑函数
		*/
		deleteFailure:function(grid,response){}
	},
	//初始化插件
	init:function(grid){
		var me = this;
			me.grid = grid;
			me.initAddButton();
	},
	//初始化删除按钮
	initAddButton:function(){
		var me = this;
		    grid = me.grid;
		    toolbar;
			dockedItemsArray = me.grid.getDockedItems();
		    addbutton = new Ext.Button({
				text:' 删除 ',
				iconCls: 'x-fa fa-trash',
				style:me.style,
				handler:function(){
					me.beforeDelete();
				}
			});
		Ext.each(dockedItemsArray,function(dockItemObj){
			if("pagingtoolbar"===dockItemObj.xtype){
				toolbar = dockItemObj;
				console.log(dockItemObj);
				me.toolbar = toolbar;
			}
		},this);
		if(Ext.isEmpty(toolbar)){
			Ext.each(dockedItemsArray,function(dockItemObj){
				if("toolbar"===dockItemObj.xtype){
					toolbar = dockItemObj;
					me.toolbar = toolbar;
				}
			},this);
		}
		me.addbutton = addbutton;
		me.toolbar.insert(13,addbutton);
	},
	//删除前置验证
    beforeDelete: function(){
		var me =this;
			grid = me.grid;
			store = grid.getStore();
		if(grid.getSelection().length==0){
			Rs.Msg.messageAlert({title:'提示',message:"提示：请先选择要删除的数据行 !"});
			return false;
		}
		var modifyRecords = grid.getStore().getModifiedRecords();
		//是否有修改新增行
		if(!Ext.isEmpty(modifyRecords)){
			if(!(modifyRecords.length==1&&modifyRecords[0].crudState=='C'&&modifyRecords[0].dirty==false)){
				Rs.Msg.messageAlert({
					title:'提示',
					message:'您有数据尚未保存，是否继续删除操作？',
					buttons: Ext.MessageBox.OKCANCEL,
					buttonText:{ok:'删除',cancel:'不删除'}
				},function(buttonId){
					if(buttonId === 'ok'){
						me.doDeleteAction(grid);
					}else{
						return false;
					}
				}
				);
			}else{
				me.confirmDelete();
			}
		}else{
			me.confirmDelete();
		}
	},
	//删除前确认提示
	confirmDelete:function(){
		var me =this;
		Rs.Msg.messageAlert({
			title:'提示',
			message:'您确定要删除选中的记录吗？',
			buttons: Ext.MessageBox.OKCANCEL,
			buttonText:{ok:'删除',cancel:'不删除'}
		},function(buttonId){
			if(buttonId == 'ok'){
				me.doDeleteAction(grid);
			}else{
				return false;
			}
		}
		);
	},
	//删除操作
	doDeleteAction:function(grid){
		var me = this;
			url = grid.getStore().model.proxy.url;
			store = grid.getStore();
			requestData = new Array();
			params = {};
			selectionRecords=grid.getSelection();
		//删除前自定义方法执行
		var deleteFlag =Ext.isEmpty(me.beforeDeleteRecord)? true : me.beforeDeleteRecord(grid);
		if(!deleteFlag){
			return false;
		}
		params.COMPANYCODE=typeof(USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
		Ext.Array.each(selectionRecords, function(record, index, countriesItSelf) {
			if(record.crudState!='C'){
				requestData.push(record.data);
			}
		});
		//删除新增行
		if(Ext.isEmpty(requestData)){
			store.reload();
			return;
		}
		//删除数据请求
		Ext.Ajax.request({
			url: url,
			async:false,
			params: params,
			jsonData : JSON.stringify(requestData),
			method:'DELETE',
			dataType:"json",
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success){
					if(!Ext.isEmpty(me.deleteSuccess)){
						me.deleteSuccess(grid,response);
					}else{
						store.reload();
						Rs.Msg.messageAlert({title:'提示',message:obj.mesg});
					}
				}else{
					if(!Ext.isEmpty(me.deleteFailure)){
						me.deleteFailure(grid,response);
					}else{
						Rs.Msg.messageAlert({title:'提示',message:obj.mesg,model:true});
					}
				}
			},
			failure: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(!Ext.isEmpty(me.deleteFailure)){
					me.deleteFailure(grid,response);
				}else{
					Rs.Msg.messageAlert({title:'提示',message:obj.message,model:true});
				}
				return false;
			}
		});
	}
});
