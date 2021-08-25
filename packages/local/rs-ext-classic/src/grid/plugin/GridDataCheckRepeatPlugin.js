Ext.define('Rs.ext.grid.plugin.GridDataCheckRepeatPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.griddatacheckrepeat',
	requires: [
		// 'Rs.ext.button.RsButton'
	],
	configs:{
		/**
		*@cfg {array} fields
		*校验重复字段数组
		*/
		fields:[],
		/**
		*@cfg {String} panelID
		*面板id
		*/
		panelID:'',
		/**
		*@cfg {array} errCode
		*异常编码
		*/
		errCode:[]
	},
	//初始化
	init:function(){
		
	},
	checkRepeat: function(panel){
		var me = this;
			me.panel = panel;
			panelID = me.panelID;//异常面板
			fields = me.fields;//验证字段
			errCode = me.errCode;//异常编码
			errArr = [];//异常uuid和字段
		if(fields!==null && !Ext.isEmpty(fields)){
			var ret = me.checkFieldsConfig(fields);
			if(ret){
				var retv = me.checkRepeatDo(fields);
				var suc = retv.success
				errArr = retv.errArr
				retv = {
					success: suc,
					panelID: panelID,
					errorMsg: errCode,
					errArr: errArr
				};
				return retv;
			}
		}
	},
	//验重
	checkRepeatDo:function(fields){
		var me =this,
			panelID = me.panelID,
			errorMsg = {},
			retVlaue = {},
	    	store = me.panel.getStore(),
			errArr = [],
			checkField = me.fields,
			pagesDataIndex,
			noRelationStaticDataObj,
			pageData,
			relationF;
		var keyIds = store.getModel().idProperty;
		var records = new Ext.util.MixedCollection();
		
		var isDynamicStore = Ext.getCmp(panelID).getStore().isDynamicStore,
			isCachedStore = Ext.getCmp(panelID).getStore().isCachedStore;
		
		//缓存store
		if(isDynamicStore || isCachedStore){
			store = Ext.getCmp(panelID).getStore();
			if(store.isCachedStore){
				noRelationStaticDataObj = store.noRelationStaticDataObj;
			}else{
				noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
			}
			relationF=false;
			if(Ext.Object.isEmpty(noRelationStaticDataObj)){
				if(store.isCachedStore){
					noRelationStaticDataObj = store.relationStaticDataArry;
				}else{
					noRelationStaticDataObj = store.cachedStore.relationStaticDataArry;
				}
				relationF=true;
			}
			
			pagesDataIndex = Object.keys(noRelationStaticDataObj);
			if(!Ext.Object.isEmpty(noRelationStaticDataObj)){
				Ext.each(pagesDataIndex, function(pageDataIndex) {
					pageData = noRelationStaticDataObj[pageDataIndex]
					if(relationF){
						pageData = pageData.cachedPageData.data
					}
					Ext.each(pageData,function(record,index){
						if(me.checkIsValidRec(record, checkField)){
							var joinKey = '';
							Ext.each(fields, function(field, index, fields){
								var data = record.get(field) ;
								joinKey += '?' + (Ext.isEmpty(data)?'':data);
							},this);
							
							if(!Ext.isEmpty(joinKey) && records.containsKey(joinKey)){
								var msgs = errorMsg[joinKey] || [];
								if(Ext.isEmpty(msgs)){
									var row = (records.get(joinKey))[0] + 1;
									msgs.push(row);
									var keyValue = {};
									keyValue[keyIds] = (records.get(joinKey))[1];
									keyValue.checkField = checkField;
									errArr.push(keyValue)
								}
								msgs.push(index + 1);
								errorMsg[joinKey] = msgs;
								var keyValueT = {};
								keyValueT[keyIds] = record.get(keyIds);
								keyValueT.checkField = checkField;
								errArr.push(keyValueT)
							}else{
								records.add(joinKey, [index, record.get(keyIds)]);
							}
						}
					})
				})
			}
		}else{//普通store
			store.each(function(record, index, store){
				if(me.checkIsValidRec(record, checkField)){
					var joinKey = '';
					Ext.each(fields, function(field, index, fields){
						var data = record.get(field) ;
						joinKey += '?' + (Ext.isEmpty(data)?'':data);
					},this);
					
					if(!Ext.isEmpty(joinKey) && records.containsKey(joinKey)){
						var msgs = errorMsg[joinKey] || [];
						if(Ext.isEmpty(msgs)){
							var row = (records.get(joinKey))[0] + 1;
							msgs.push(row);
							var keyValue = {};
							keyValue[keyIds] = (records.get(joinKey))[1];
							keyValue.checkField = checkField;
							errArr.push(keyValue)
						}
						msgs.push(index + 1);
						errorMsg[joinKey] = msgs;
						var keyValueT = {};
						keyValueT[keyIds] = record.get(keyIds);
						keyValueT.checkField = checkField;
						errArr.push(keyValueT)
					}else{
						records.add(joinKey, [index, record.get(keyIds)]);
					}
				}
			},this);
		}

		if(errArr.length>0){
			retVlaue = {success: false, errArr: errArr};
		}else{
			retVlaue = {success: true, errArr: errArr};
		}
		return retVlaue;
	},
	//检查验重字段有效性
	checkFieldsConfig:function(fields){
		var me = this;
			store = me.panel.getStore();
		var sFields = store.getModel().fields.items;
		var allFields = [];
		if(Ext.isArray(fields)){
			for(var i=0;i<sFields.length;i++){
				allFields[i] = sFields[i].getName();
			}
			for(var k in fields){
				if(allFields.indexOf(fields[k]) == -1){
					// console.log('您的验重字段配置错误，请检查');
					return false;
				}
			}
		}else{
			// console.log('您的验重字段配置错误，请检查');
			return false;
		}
		return true;
	},
	//检查数据行是否需要验重(当前行是非删除行，检查当前行验重字段是否输入值)
	checkIsValidRec:function(record,modelFieldsNames){
		var me = this,validRawFlag=false,validFlag=false;
		if(record.dirty){
			var modifieds = Object.keys(record.modified);
			Ext.each(modifieds,function(modified){
				if(!Ext.isEmpty(record.data[modified])){
					validRawFlag=true;
					return false;
				}
			});
		}
		//删除行不验证
		if(record.deleteFlag == 'D'){
			validRawFlag=false;
		}else{
			//原有行需要验证
			if(record.crudState == 'R' || record.crudState == 'U'){
				validRawFlag=true;
			}
		}
		//有效行再验证
		if(validRawFlag){
			Ext.each(modelFieldsNames,function(modelFieldsName){
				if(!Ext.isEmpty(record.data[modelFieldsName])){
					validFlag=true;
					return false;
				}
			});
		}
		
		return validFlag;
	}
});
