	/**
	 * @class Rs.ext.grid.plugin.GridAddNewRecordPlugin
	 * @extends Ext.plugin.Abstract
	 * @author LiGuangqiao
	 * 表格新增插件
	 */
Ext.define('Rs.ext.grid.plugin.GridAddNewRecordPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.addnewrecord',
	requires:'Ext.button.Button',
	configs:{
		/**
		*@cfg {String} buttonIcon
		*新增按钮图标设置
		*/
		buttonIcon:"",
		/**
		*@cfg {String} buttonStyle
		*新增按钮样式设置
		*/
		buttonStyle:"",
		/**
		*@cfg {String} buttonText
		*新增按钮显示文本
		*/
		buttonText:"",
		/**
		*@cfg {boolean} buttonShow
		*是否切换至按钮新增模式
		*/
		addButtonShow:false,
		/**
		*@cfg {Object} defaultValue
		*新增行对应字段的默认值
		*/
		defaultValue:{},
		/**
		*@cfg {function} addNewRecord
		*新增逻辑函数
		*/
		addNewRecord:function(store,defaultValue){},
		/**
		*@cfg {function} doCheckMustInputField
		*必输字段校验
		*true 必输字段已全部录入数据
		*false 必输字段中尚有未输字段
		*/
		doCheckMustInputField:function(store,mustInputFields,newRecords,me){},
		/**
		*@cfg {array} addNewRecord
		*必输字段数组
		*/
		mustInputFields:[]
		
	},
	//初始化插件
	init:function(grid){
		var me = this;
		me.grid = grid;
		//me.autoAddNewRecord(me.defaultValue);
		if(me.addButtonShow){
			me.initAddButton(me.defaultValue);
		}else{
			me.afterCheckMustInputFieldAddNewRecord(me.mustInputFields,me.defaultValue);
		}
	},
	//初始化新增按钮
	initAddButton:function(defaultValue){
		var toolbar,
			pagingtoolbar,
			isPagingToolbarExist = false,
			me = this,
			grid = me.grid,
			dockedItemsArray = me.grid.getDockedItems();
		Ext.each(dockedItemsArray,function(dockItemObj){
			if("pagingtoolbar"===dockItemObj.xtype){
				toolbar = dockItemObj;
				me.toolbar = toolbar;
				isPagingToolbarExist = true;
				me.isPagingToolbarExist =isPagingToolbarExist;
			}
		},this);
		if(!(me.isPagingToolbarExist)){
				Ext.each(dockedItemsArray,function(dockItemObj){
				if("toolbar"===dockItemObj.xtype){
					toolbar = dockItemObj;
					me.toolbar = toolbar;
				}else{
					me.toolbar = toolbar;
				}
			},this);
		}
		var addbutton = new Ext.Button({
			text:me.buttonText,
			icon:me.buttonIcon,
			style:me.buttonStyle,
			handler:function(){
				var store = grid.getStore();
				me.addNewRecord(store,defaultValue);
			}
		});
		me.addbutton = addbutton;
		if(!Ext.isEmpty(me.toolbar)){
			me.toolbar.add(addbutton);
		}
	},
	/**
	* 新增行逻辑
	* private
	* @method autoAddNewRecord
	* @params {Object} defaultValue 新增默认值
	*/
	addNewRecord:function(store,defaultValue){
		var temp = {},
			addDefaultValue = Ext.Object.merge(temp,defaultValue);
		store.add(addDefaultValue);
	},
	/**
	* 返回新增按钮
	* private
	* @method getAddButton
	* @return {object} Button 返回新增按钮对象
	*/
	getAddButton:function(){
		var me = this;
		return me.addbutton;
	},
	/**
	* 数据加载自动添加新增行
	* private
	* @method autoAddNewRecord
	* @params {Object} defaultValue 新增默认值
	*/
	autoAddNewRecord:function(defaultValue){
		var me = this,
			grid = me.grid,
			store = grid.getStore();
		store.on('load',function(store,records,options){
			me.addNewRecord(store,defaultValue);
		},me);
	},
	/**
	* 检测必输字段校验
	* private
	* @method doCheckMustInputField
	* @params {Object} mustInputFields 必输字段数组
	* @return {Boolean} true/false 返回必输字段完成标识
	*/
	doCheckMustInputField:function(store,mustInputFields,newRecords,me){
		var checkFlag = true;
		if(!Ext.isEmpty(mustInputFields)){
				Ext.each(newRecords , function(record, index, recordArray){
				var data = record.data,
					fieldNum = 0;
				for(fieldNum;fieldNum<mustInputFields.length;fieldNum++){
					var field = mustInputFields[fieldNum];
					if(Ext.isEmpty(data[field])){
						checkFlag = false;
						break;
					}
				}
			},me);
		}else{
			Ext.each(newRecords , function(record, index, recordArray){
				var data = record.data;
				for(field in data){
					if(Ext.isEmpty(data[field])){
						checkFlag = false;
						break;
					}
				}
				
			},me);
		}
		return checkFlag;
	},
	/**
	* 输完必输字段时自动添加新增行
	* private
	* @method afterCheckMustInputFieldAddNewRecord
	*/
	afterCheckMustInputFieldAddNewRecord:function(mustInputFields,defaultValue){
		var cellEditPlugin,
			rowEditPlugin,
			checkFlag,
			me = this,
			isCellEditExist = false,
			isRowEditExist =  false,
			grid = me.grid,
			store = grid.getStore(),
			gridPluginsArray = grid.getPlugins();
		Ext.each(gridPluginsArray,function(pluginObj){
			if("cellediting"===pluginObj.ptype){
				cellEditPlugin = pluginObj;
				me.cellEditPlugin = cellEditPlugin;
				isCellEditExist = true;
			}
			if("rowediting"===pluginObj.ptype){
				rowEditPlugin = pluginObj;
				me.rowEditPlugin = rowEditPlugin;
				isRowEditExist = true;
			}
		},this);
		if(!(isCellEditExist)){
			me.cellEditPlugin = cellEditPlugin;
		}
		if(!(rowEditPlugin)){
			me.rowEditPlugin = rowEditPlugin;
		}
		if(!Ext.isEmpty(me.cellEditPlugin)){
				me.cellEditPlugin.on('edit',function(editPlugin,field){
				var newRecords = store.getModifiedRecords();
				checkFlag = me.doCheckMustInputField(store,mustInputFields,newRecords,me);
				if(checkFlag){
					me.addNewRecord(store,defaultValue);
				}
			},me);
		}
		if(!Ext.isEmpty(me.rowEditPlugin)){
				me.rowEditPlugin.on('edit',function(editPlugin,field){
				var newRecords = store.getModifiedRecords();
				checkFlag = me.doCheckMustInputField(store,mustInputFields,newRecords,me);
				if(checkFlag){
					me.addNewRecord(store,defaultValue);
				}
			},me);
		}
	}
	
});
