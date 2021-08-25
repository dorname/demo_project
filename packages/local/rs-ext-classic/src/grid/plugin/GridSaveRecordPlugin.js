Ext.define('Rs.ext.grid.plugin.GridSaveRecordPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.saverecord',
	requires: [
		'Rs.ext.button.RsButton'
	],
	configs:{
		/**
		*@cfg {Object} style
		*保存按钮样式
		*/
		style:{},
		/**
		*@cfg {object} mustInputFields
		*必输字段数组
		*/
		mustInputFields:{},
		/**
		*@cfg {array} checkRepeatFields
		*校验重复字段数组
		*/
		checkRepeatFields:[],
		/**
		*@cfg {String} url
		*请求路径
		*/
		url:'',
		/**
		*@cfg {function} cunstomCheckRule
		*自定义验证
		*true 自定义校验通过继续执行保存
		*false 自定义校验未通过停止保存
		*/
		cunstomCheckRule:function(grid){},
		/**
		*@cfg {function} saveFailure
		*保存失败函数
		*/
		saveFailure:function(grid,response){},
		/**
		*@cfg {function} saveFailure
		*删除失败函数
		*/
		deleteFailure:function(grid,response){},
		/**
		*@cfg {function} insertFailure
		*新增失败函数
		*/
		insertFailure:function(grid,response){},
		/**
		*@cfg {function} insertFailure
		*保存成功函数
		*/
		saveSuccess:function(grid,response){}
	},
	//初始化插件
	init:function(grid){
		var me = this;
			me.grid = grid;
			me.initAddButton();
		if(me.mustInputFields!==null){
			me.afterCheckMustInputFieldChangColor(me.mustInputFields);
		}
		me.addNewRecord();
	},
	//初始化保存按钮
	initAddButton:function(){
		var me = this,
		    grid = me.grid,
		    toolbar,
			dockedItemsArray = me.grid.getDockedItems();
			var style = {
				//background:'#fff',
				//background:'-webkit-linear-gradient(top, #fff, #f9f9f9 48%, #e2e2e2 52%, #e7e7e7)'
			},
			style = Ext.Object.merge(style,me.style),
		    addbutton = Ext.create('Rs.ext.button.RsButton',{
				text:' 保存 ',
				iconCls: 'saveAction-button-item',
				style:style,
				iconAlign: "left",
				handler:function(){
					me.doSave();
				}
			});
		Ext.each(dockedItemsArray,function(dockItemObj){
			if("pagingtoolbar"===dockItemObj.xtype){
				toolbar = dockItemObj;
				me.toolbar = toolbar;
			}
		},this);
		if(!Ext.isEmpty(me.toolbar) && me.toolbar.xtype == 'pagingtoolbar'){
		//if(!Ext.isEmpty(toolbar.xtype) && toolbar.xtype == 'pagingtoolbar'){
			me.addbutton = addbutton;
			var leftSpace = {xtype: 'tbspacer',
							 flex: 1};
			var rightSpace = {xtype: 'tbspacer',
							 flex: 1};
			me.toolbar.insert(11,leftSpace);
			me.toolbar.insert(12,addbutton);
		}else{
			Ext.each(dockedItemsArray,function(dockItemObj){
				if("toolbar"===dockItemObj.xtype){
					toolbar = dockItemObj;
					me.toolbar = toolbar;
				}
			},this);
			me.addbutton = addbutton;
			me.toolbar.add(addbutton);
		}
		
	},
	//保存
	doSave:function(){
		var me =this,
			grid = me.grid,
			store = grid.getStore(),
			errorMsgs="",
			errorFlag=true,
			errorResponse={},
			checkFiedls=me.getNeedCheckFiedls();
			me.checkFiedls=checkFiedls,
		errorFlag=me.checkModifieData(store,checkFiedls);
		if(errorFlag){
			Rs.Msg.messageAlert({title:'提示',message:'数据没有发生变化，不需要保存'});
			return false;
		}
		//校验必输
		if(!Ext.isEmpty(me.mustInputFields)){
			errorMsgs=me.checkMustInputField(me.mustInputFields,store);
			if(!Ext.isEmpty(errorMsgs)){
				Rs.Msg.messageAlert({title:'提示',message:errorMsgs.join('<br/>')});
				return;
			}
		}
		//校验重复
		if(!Ext.isEmpty(me.checkRepeatFields)){
			errorMsgs=me.checkRepeatFieldsF(me.checkRepeatFields);
			if(!Ext.isEmpty(errorMsgs)){
				Rs.Msg.messageAlert({title:'提示',message:errorMsgs.join('<br/>')});
				return;
			}
		}
		
		
		//执行自定义验证
		if(!Ext.isEmpty(me.cunstomCheckRule)){
			errorFlag=me.cunstomCheckRule(grid);
			if(!errorFlag){
				return false;
			}
		}
		
		//删除操作
		errorFlag=me.doDeleteAction(grid);
		if(!errorFlag){
			return false;
		}
		
		//insert操作
		errorFlag=me.doInsertAction(grid);
		if(!errorFlag){
			return false;
		}
		//update操作
		errorFlag=me.doUpdateAction(grid);
		if(!errorFlag){
			return false;
		}
		//删除操作的数据行
		Ext.each(store.getModifiedRecords(),function(modifiedRecord){
			store.remove(modifiedRecord);
		},this);
		if(!Ext.isEmpty(me.needDeleteRecords)){
			store.remove(me.needDeleteRecords);
		}
		
		//保存后自定义方法
		if(!Ext.isEmpty(me.saveSuccess)){
			errorFlag=me.saveSuccess(grid);
			if(!errorFlag){
				return false;
			}
		}
		
		store.reload();
		return ;
	},
	//验证是否存在修改或新增删除的数据
	checkModifieData:function(store,checkFiedls){
		var me =this,
			modifiedRecords=store.getModifiedRecords(),
			modifiedFlag=false,
			newRecord=[],
			emptyCount=0;
		store.each(function(record){
			if(!Ext.isEmpty(record.deleteFlag) && record.deleteFlag=='D'){
				emptyCount+=1;
			}
		},this);
		
		if(emptyCount>0){
			return false;
		}
		if(Ext.isEmpty(modifiedRecords)){
			return true;
		}else{
			Ext.each(modifiedRecords,function(modifiedRecord){
				if(emptyCount>0){
					return false;
				}
				//modifiedFlag = me.checkIsEmptyRecord(modifiedRecord);
				modifiedFlag = me.checkIsEmptyRecordPlus(modifiedRecord,checkFiedls);
				if(!modifiedFlag){
					emptyCount+=1;
					return false;
				}
			},this);
			if(modifiedFlag){
				return true;
			}else{
				return false;
			}
		}
			
	},
	// 必输字段校验
	checkMustInputField:function(mustInputFields,store){
		var me =this,
			errorsMsg = [] ,
			errorrows = {} ,
			modifiedFlag=false,
			modifyRecords=store.getModifiedRecords(),
			modifyData=new Array(),
			mustInputFields=me.mustInputFields,
			columns=me.getColumnsAttribute(),
			modelFieldsName=columns.fiedNameS,
			otherColumnsCount = columns.otherColumnsCount;
			
		Ext.each(modifyRecords,function(modifiedRecord){
			modifiedFlag = me.checkIsEmptyRecordPlus(modifiedRecord,me.checkFiedls);
			if(!modifiedFlag){
				modifyData.push(modifiedRecord);
			}
		},this);
		Ext.each(modifyData , function(record, index, modifyRecords){
			data = record.data ;
			for(var field in mustInputFields){
				if(Ext.isEmpty(data[field])){ //如果主键没有输入  增加对number控件的支持，number无法直接使用trim
					if(!errorrows[field]){
							errorrows[field] = [];
					}
					var row = this.grid.store.indexOf(record) + 1 ;
					var col = modelFieldsName.indexOf(field);
					me.grid.view.getCell(row-1,col+otherColumnsCount).style.backgroundColor='#ffdfd7'
					errorrows[field].push(row) ;
				}
			}
		} ,this);
			
		for(var property in errorrows){
			if(!Ext.isEmpty(errorrows[property])){
				var message = "第" + errorrows[property].sort(function(v1, v2){
					if(v1 > v2){
						return 1;
					} else {
						return -1;
					}
				}).join('、') + "行" + mustInputFields[property]+ "不能为空" ;
					errorsMsg.push(message);
			}
		}
		return errorsMsg ;
	},
	//校验重复字段
	checkRepeatFieldsF:function(checkRepeatFields){
		var me =this,
			errorMsg = {} ,
	    	modifyRecords = [] ,
	    	store = me.grid.getStore() ,
	    	errors = [],
			columns=me.getColumnsAttribute(),
			modelFieldsName=columns.fiedNameS,
			otherColumnsCount = columns.otherColumnsCount,
			columsCount = columns.columsCount;
			
	    var records = new Ext.util.MixedCollection() ;
		store.each(function(record , index , store){
			if(!me.checkIsEmptyRecordPlus(record,me.checkFiedls)){
				var joinKey = '' ;
				if(Ext.isArray(checkRepeatFields)){
					Ext.each(checkRepeatFields , function(field , index , checkRepeatFields){
						var data = record.get(field) ;
						joinKey +=  '?' + (Ext.isEmpty(data) ? '' : data) ;
					} , this);
					
					if(!Ext.isEmpty(joinKey) && records.containsKey(joinKey)){
						var msgs = errorMsg[joinKey] || [];
						if(Ext.isEmpty(msgs)){
							var row = records.get(joinKey) + 1;
							msgs.push(row);
						}
						msgs.push(index + 1);
						errorMsg[joinKey] = msgs ;
					} else {
						records.add(joinKey , index);
					}
				} else {
					errors.push('您的验重配置错误，请检查！');
				}
			}
		} , this);
		
		store.each(function(record,index,store){
			for(var i=0;i<columsCount-1;i++){
				me.grid.view.getCell(record,i).style.backgroundColor=''
			}
		});
		for(var p in errorMsg){
			var rows = errorMsg[p].sort(function(v1, v2){
				if(v1 > v2){
					return 1;
				} else {
					return -1;
				}
			});
			Ext.each(checkRepeatFields,function(field){
				var col = modelFieldsName.indexOf(field);
				for(var i=0;i<rows.length;i++){
					me.grid.view.getCell(rows[i]-1,col+otherColumnsCount).style.backgroundColor='#ffdfd7'
				}
			});
			var msg = '第' + rows.join('、') + "行数据重复！" ;
			errors.push(msg);
		}
		return errors;
	},
	//监听单元格edit事件，必输字段输入后去掉背景色
	afterCheckMustInputFieldChangColor:function(mustInputFields){
		var editPlugin,
			me = this,
			gridPluginsArray = me.grid.getPlugins();
			
		Ext.each(gridPluginsArray,function(pluginObj){
			if("cellediting"===pluginObj.ptype){
				editPlugin = pluginObj;
				var gridEditPlugin = editPlugin;
			}
			if("rowediting"===pluginObj.ptype){
				editPlugin = pluginObj;
				var gridEditPlugin = editPlugin;
			}
		},this);
		if(!Ext.isEmpty(me.editPlugin)){
			gridEditPlugin.on('validateedit',function(editPlugin,context){
				var mustInputCol=[],
				data = context.record.data ,
				otherCol=0,
				columns=me.getColumnsAttribute(),
				modelFieldsName=columns.fiedNameS,
				otherColumnsCount = columns.otherColumnsCount;
				for(var field in mustInputFields){
					if(!data[field] || Ext.isEmpty(data[field]+"")){ 
						var col = modelFieldsName.indexOf(field)+otherColumnsCount;
						if(me.grid.view.getCell(context.record,col).style.backgroundColor=='#ffdfd7' || me.grid.view.getCell(context.record,col).style.backgroundColor=='rgb(255, 223, 215)'){
							mustInputCol.push(col);
						}
					}
				}
				context.mustInputCol=mustInputCol;
			},me);
			gridEditPlugin.on('edit',function(editPlugin,context){
				if(!Ext.isEmpty(context.mustInputCol)){
					Ext.each(context.mustInputCol,function(col){
						me.grid.view.getCell(context.record,col).style.backgroundColor='#ffdfd7';
					});
				}
				if(!Ext.isEmpty(context.cell.style.backgroundColor)){
					if(!Ext.isEmpty(context.value)){
						context.cell.style.backgroundColor='';
					}
				}
				if(!Ext.isEmpty(context.record.deleteFlag)){
					context.row.getElementsByClassName('x-action-col-icon x-action-col-2')[0].src='../../../resources/images/del_press.png'
				}
			},me);
		}
	},
	//执行insert操作
	doInsertAction:function(grid){
		var me = this,
			store = grid.getStore(),
			url = store.proxy.url,
			params = {},
			requestData = new Array(),
			newRecords = store.getNewRecords(),
			imptyFlag = false,
			errorFlag = true,
			needInsertRecords=new Array();
			
		Ext.each(newRecords,function(newRecord){
			imptyFlag = me.checkIsEmptyRecordPlus(newRecord,me.checkFiedls);
			if(!imptyFlag){
				needInsertRecords.push(newRecord);
				requestData.push(newRecord.data);
			}
		},this);
		if(Ext.isEmpty(requestData)){
			return true;
		}
		me.needInsertRecords=needInsertRecords;
		params.COMPANYCODE=typeof(USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
		params.personId=typeof(USERINFO) == 'undefined' ? '' : USERINFO.USERID;
		params.personCode=typeof(USERINFO) == 'undefined' ? '' : USERINFO.USERCODE;
		params.personName=typeof(USERINFO) == 'undefined' ? '' : USERINFO.USERNAME;
		if(!Ext.isEmpty(me.url)){
			url=me.url;
		}
		var storage = Ext.util.LocalStorage.get('rslocal');
        token = 'Bearer '+storage.getItem("token");
		Ext.Ajax.request({
			url: url,
			async:false,
			params: params,
			jsonData : JSON.stringify(requestData),
			method:'POST',
			headers:{
				Authorization:token
			},
			dataType:"json",
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success){
					errorFlag = true;
				}else{
					if(!Ext.isEmpty(me.insertFailure)){
						me.insertFailure(me.grid,response);
					}else{
						Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
					}
					errorFlag = false;
				}
			},
			failure: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(!Ext.isEmpty(me.insertFailure)){
					me.insertFailure(me.grid,response);
				}else{
					Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
				}
				errorFlag = false;
			}
		});
		return errorFlag;
	},
	//执行update操作
	doUpdateAction:function(grid){
		var me = this,
			store = grid.getStore(),
			url = store.proxy.url,
			params = {},
			requestData = new Array(),
			modifiedRecords= store.getModifiedRecords(),
			errorFlag = true,
			needSaveRecords = new Array();
			
		Ext.each(modifiedRecords,function(modifiedRecord){
			if(!Ext.isEmpty(modifiedRecord.deleteFlag) && modifiedRecord.deleteFlag=='D'){
				
			}else if(modifiedRecord.crudState=='U'){
				var fiedNameS=modifiedRecord.modified,
					updateData = {};
				updateData[store.model.idProperty]=modifiedRecord.id;
				for(var i=0;i<Object.keys(fiedNameS).length;i++){
					var fieldName=Object.keys(fiedNameS)[i]
						updateData[fieldName]=modifiedRecord.data[fieldName];
				}
				requestData.push(updateData);
				needSaveRecords.push(modifiedRecord);
			}
		},this);
		if(Ext.isEmpty(requestData)){
			return true;
		}
		me.needSaveRecords=needSaveRecords;
		params.COMPANYCODE=typeof(USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
		params.personId=typeof(USERINFO) == 'undefined' ? '' : USERINFO.USERID;
		params.personCode=typeof(USERINFO) == 'undefined' ? '' : USERINFO.USERCODE;
		params.personName=typeof(USERINFO) == 'undefined' ? '' : USERINFO.USERNAME;
		if(!Ext.isEmpty(me.url)){
			url=me.url;
		}
		var storage = Ext.util.LocalStorage.get('rslocal');
        token = 'Bearer '+storage.getItem("token");
		Ext.Ajax.request({
			url: url,
			async:false,
			params: params,
			jsonData : JSON.stringify(requestData),
			method:'PUT',
			headers:{
				Authorization:token
			},
			dataType:"json",
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success){
					errorFlag = true;
				}else{
					if(!Ext.isEmpty(me.saveFailure)){
						me.saveFailure(me.grid,response);
					}else{
						Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
					}
					errorFlag = false;
				}
			},
			failure: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(!Ext.isEmpty(me.saveFailure)){
					me.saveFailure(me.grid,response);
				}else{
					Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
				}
				errorFlag = false;
			}
		});
		return errorFlag;
	},
	
	//执行Delete操作
	doDeleteAction:function(grid){
		var me = this,
			store = grid.getStore(),
			url = store.proxy.url,
			params = {},
			requestData = new Array(),
			errorFlag = true,
			needDeleteRecords = new Array();
			
		store.each(function(record){
			if(!Ext.isEmpty(record.deleteFlag) && record.deleteFlag=='D'){
				requestData.push(record.data);
				needDeleteRecords.push(record);
			}
		},this);	
		if(Ext.isEmpty(requestData)){
			return true;
		}
		me.needDeleteRecords=needDeleteRecords;
		params.COMPANYCODE=typeof(USERINFO) == 'undefined' ? '00' : USERINFO.COMPANYCODE;
		if(!Ext.isEmpty(me.url)){
			url=me.url;
		}
		var storage = Ext.util.LocalStorage.get('rslocal');
        token = 'Bearer '+storage.getItem("token");
		Ext.Ajax.request({
			url: url,
			async:false,
			params: params,
			jsonData : JSON.stringify(requestData),
			method:'DELETE',
			dataType:"json",
			headers:{
				Authorization:token
			},
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success){
					errorFlag = true;
				}else{
					if(!Ext.isEmpty(me.deleteFailure)){
						me.deleteFailure(me.grid,response);
					}else{
						Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
					}
					errorFlag = false;
				}
			},
			failure: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(!Ext.isEmpty(me.deleteFailure)){
					me.deleteFailure(me.grid,response);
				}else{
					Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
				}
				errorFlag = false;
			}
		});
		return errorFlag;
	},
	
	//验证某一行是否为修改行
	checkIsEmptyRecord:function(record){
		var emptyFlag=true,
			data=Ext.Object.getValues(record.data);
		if(record.crudState=='U'){
			emptyFlag=false;
			return emptyFlag;
		}
		for(var i=1;i<data.length;i++){
			if(!Ext.isEmpty(data[i])){
				emptyFlag=false;
				return emptyFlag;
			}
		}
		return emptyFlag;
	},
	//获取colums中dataindex，工具列条数，显示列数
	getColumnsAttribute:function(){
		var me = this,
			gridcolumns = me.grid.getColumns(),
			columns = {},
			modelFieldsName = new Array(),
			otherCol = 0,
			columsCount=0;
		Ext.each(gridcolumns,function(column){
			if(column.xtype!='checkcolumn' && column.xtype!='rownumberer' && column.xtype!='actioncolumn' && !column.hidden){
				modelFieldsName.push(column.dataIndex);
			}
			if(column.xtype=='checkcolumn'|| column.xtype=='rownumberer' || column.xtype=='actioncolumn'){
				otherCol+=1;
			}
			if(!column.hidden){
				columsCount+=1;
			}
		});
		columns.fiedNameS=modelFieldsName;
		columns.otherColumnsCount=otherCol;
		columns.columsCount=columsCount;
		return columns;
	},
	checkIsEmptyRecordPlus:function(record,modelFieldsNames){
		var me = this,
			emptyFlag=true;
		if(record.crudState=='U'){
			emptyFlag=false;
			return emptyFlag;
		}
		Ext.each(modelFieldsNames,function(modelFieldsName){
			if(!Ext.isEmpty(record.data[modelFieldsName])){
				emptyFlag=false;
				return emptyFlag;
			}
		});
		return emptyFlag;
	},
	getNeedCheckFiedls:function(){
		var me = this,
			columns = me.getColumnsAttribute(),
			modelFieldsNames = columns.fiedNameS;
			if(Ext.isEmpty(me.grid.getStore().defaultFieldValue)){
				return modelFieldsNames;
			}
			defaultFields=Object.keys(me.grid.getStore().defaultFieldValue);
		Ext.each(defaultFields,function(defaultField){
			var col = modelFieldsNames.indexOf(defaultField);
			modelFieldsNames.splice(col, 1);
		});
		return modelFieldsNames;
	},
	addNewRecord:function(){
		var me = this,
			store = me.grid.getStore();
		store.on('load',function(store,records,options){
			if(store.data.length==0){
				if(Ext.isEmpty(store.defaultFieldValue)){
					store.add({});
				}else{
					var addData = JSON.parse(JSON.stringify(store.defaultFieldValue));
					store.add(addData);
				}
			}
		},me);
	}
});
