Ext.define('Rs.ext.panel.plugin.SavePlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.saveplugin',
	requires: [
		'Ext.toolbar.Toolbar',
		'Rs.ext.button.RsButton'
	],
	configs:{
		/**
		*@cfg {Array} panelIds
		*面板id数组
		*/
		panelIds:[],
		/**
		*@cfg {String} buttonText
		*按钮文字
		*/
		buttonText:'',
		/**
		*@cfg {String} buttonIcon
		*按钮图标样式
		*/
		buttonIcon:'',
		/**
		*@cfg {Object} buttonStyle
		*按钮样式
		*/
		buttonStyle:{},
		/**
		*@cfg {String} url
		*请求路径
		*/
		url:'',
		/**
		*@cfg {String} personCodeField
		*人员编码字段
		*/
		personCodeField:'',
		/**
		*@cfg {String} personNameField
		*人员姓名字段
		*/
		personNameField:'',
		/**
		*@cfg {Boolean} autoLoad
		*自动重新查询（存在新增或删除数据最好是重新查询）
		*/
		autoLoad:true,
		/**
		*@cfg {Array} needLoadPanels
		*需要重新load的面板的store(不填为默认所有面板的store)		
		*/
		needLoadPanels:[],
		/**
		*@cfg {Object} needReplaceFields
		*保存后不刷新时，需要替换的每个面板的字段
		*/
		needReplaceFields:{},
		/**
		*@cfg {function} executeSuccess
		*执行前函数
		*/
		beforeExecute:function(thisButton){},
		/**
		*@cfg {function} executeSuccess
		*执行成功函数
		*/
		executeSuccess:function(thisButton,response){},
		/**
		*@cfg {function} executeFauild
		*执行失败函数
		*/
		executeFailures:function(thisButton,response){}
	},
	//初始化插件
	init:function(bar){
		var me = this;
			//me.panel = panel;
			me.initAddButton(bar);
			Ext.defer(me.initAddPlugins, 100,me);
	},
	//初始化保存按钮
	initAddButton:function(bar){
		var me = this,
		    toolbar,
			//dockedItemsArray = me.panel.getDockedItems(),
			style = {},
			style = Ext.Object.merge(style,me.buttonStyle);
			if(Ext.isEmpty(me.buttonIcon)){
				me.buttonIcon = 'saveAction-button-item';
			}
			if(Ext.isEmpty(me.buttonText)){
				me.buttonText = '保存';
			}
	    var	addbutton = Ext.create('Rs.ext.button.RsButton',{
				text:me.buttonText,
				iconCls: me.buttonIcon,
				style:style,
				iconAlign: "left",
				handler:function(){
					me.beforeSave();
				}
		});
		if(Ext.isEmpty(me.autoLoad)){
			me.autoLoad=true;
		}
		if(bar.xtype=='rs-pagingtoolbar'){
			bar.insert(2,addbutton);
		}else{
			bar.add(addbutton);
		}
		/*Ext.each(dockedItemsArray,function(dockItemObj){
			if("pagingtoolbar"==dockItemObj.xtype || 'rs-pagingtoolbar'==dockItemObj.xtype){
				toolbar = dockItemObj;
				me.toolbar = toolbar;
			}
		},this);*/
		/*if(!Ext.isEmpty(me.toolbar) && (me.toolbar.xtype == 'pagingtoolbar' || me.toolbar.xtype == 'rs-pagingtoolbar')){
			me.addbutton = addbutton;
			me.toolbar.insert(2,addbutton);
			/*var leftSpace = {xtype: 'tbspacer',
							 flex: 1};
			var rightSpace = {xtype: 'tbspacer',
							 flex: 1};
			me.toolbar.insert(11,leftSpace);
			me.toolbar.insert(12,addbutton);*/
		/*}else{
			Ext.each(dockedItemsArray,function(dockItemObj){
				if("toolbar"==dockItemObj.xtype){
					toolbar = dockItemObj;
					me.toolbar = toolbar;
				}
			},this)
			me.toolbar.add(addbutton);
		}*/
		
	},
	//保存前    ----执行了beforeExcuete
	beforeSave:function(){
		var me =this;
		//逻辑执行前函数
		if(!Ext.isEmpty(me.beforeExecute)){
			if(!me.beforeExecute(me)){
				return false;
			}
		}
		me.doSave();
	},
	//保存
	doSave:function(){
		var me =this,
			params = {},
			panels = new Array();
			//store = Ext.getStore(me.grid.store);
		//验证是否有修改数据
		if(!me.checkPanelsModified(me.panelIds)){
			return false;
		}
		//必输、验重、多字段等
		if(!me.checkDatas()){
			return false;
		}
		//me.checkModifieData(Ext.getStore(me.panel.store),me.panel);
		//panels.push(me.integratedData(me.grid.id,store));
		//整合数据
		Ext.each(me.panelIds,function(panelId){
			panel = Ext.getCmp(panelId);
			store = Ext.getStore(panel.store);
			panels.push(me.integratedData(panelId,store));
		});
		var first = me.url.indexOf("auto/");
		var last = me.url.indexOf("/crud");
		params.pagCode = me.url.substring(first+5,last);
		//params.pagCode = 'tik100';
		params.funCode = me.id;
		params.panels = panels;
			//NewRecordsData = me.getNewRecordsData(Ext.getStore(me.grid.store));
			//panelData = me.adjustData('insert',NewRecordsData,store);
			//params[me.grid.id] = panelData;
			//params.push(panelData);
		//console.log(JSON.stringify(params));
		//me.checkModifieData(Ext.getStore(me.panel.store),me.panel);
		
		//Ajax请求
		returnData=me.doExecuteAction(params);
		if(returnData.errorFlag){
			return false;
		}
		
		//重新加载
		if(me.autoLoad){
			if(!Ext.isEmpty(me.needLoadPanels)){
				Ext.each(me.needLoadPanels,function(panelId){
					var panel = Ext.getCmp(panelId),
					store = Ext.getStore(panel.store);
					if(store.isDynamicStore || store.isCachedStore){
						if(!Ext.isEmpty(store.dynamicStore)){
							store.dynamicStore.cachedDataAllClear()
						}
					}
					if (store.isCachedStore) {
						//store.each(function (record) {
						//	if (record.deleteFlag == 'D') {
						//		store.remove(record);
						//	}
						//})
						//store.commitChanges();
						store.getDynamicStore().forceChangeStore = true;
						store.loadPage(store.currentPage);
					} else {
						store.reload();
					}
					if(panel.isXType('grid')){
						panel.setSelection();
					}
				});
			}else{
				Ext.each(me.panelIds,function(panelId){
					panel = Ext.getCmp(panelId);
					store = Ext.getStore(panel.store);
					
					if(store.isDynamicStore || store.isCachedStore){
						if(!Ext.isEmpty(store.dynamicStore)){
							store.dynamicStore.cachedDataAllClear()
						}
					}
					if (store.isCachedStore) {
						/*store.each(function (record) {
							if (record.deleteFlag == 'D') {
								store.remove(record);
							}
						})
						//store.commitChanges();*/
						store.getDynamicStore().forceChangeStore = true;
						store.loadPage(store.currentPage);
					} else {
						store.reload();
					}
					if(panel.isXType('grid')){
						panel.setSelection();
					}
				});
			}
			
			//store.reload();
		}else{
			me.replaceIdToal(params,returnData.responseData);
		}
		return ;
	},
	//验证是否存在修改或新增删除的数据
	checkModifieData:function(store,panel){
		var me = this,
			updateRecords = store.getUpdatedRecords(),
			newRecords = store.getNewRecords(),
			dirtyFlag,
			modifieds,
			deleteRecords;
		if(store.isDynamicStore || store.isCachedStore){
			dirtyFlag = me.checkCaCheStoreModified(store);
		}else{
			if(updateRecords.length>0){
				if(panel.xtype=='gridpanel'){
					return true;
				}else{
					Ext.each(updateRecords,function(updateRecord){
						modifieds =  Object.keys(updateRecord.modified);
						Ext.each(modifieds,function(modified){
							if(modified!=store.model.idProperty && updateRecord.data[modified] != updateRecord.modified[modified]){
								if(updateRecord.data[modified] ==null && updateRecord.modified[modified] =='undefined'){
									
								}else{
									dirtyFlag=true;
									return false;
								}
							}
						});
						if(dirtyFlag){
							return false;
						}
					});
					if(dirtyFlag){
						return true;
					}
				}
			}
			Ext.each(newRecords,function(newRecord){
				if(newRecord.dirty){
					modifieds =  Object.keys(newRecord.modified);
					Ext.each(modifieds,function(modified){
						if(!Ext.isEmpty(newRecord.data[modified])){
							dirtyFlag=true;
						}
					});
				}
			});
			if(dirtyFlag){
				return true;
			}
			store.each(function(record){
				if(record.deleteFlag=='D'){
					dirtyFlag=true;
				}
			},this);
		}	
		
		if(dirtyFlag){
			return true;
		}
		return false;
	},
	//校验数据是否有更改(上下帧面板)
	checkCaCheStoreModified:function(store){
		var me = this,
			dirtyFlag,
			pageData,
			pagesDataIndex,
			relationDataIndex,
			relationPagesData,
			noRelationStaticDataObj,
			relationStaticDataArry;
		if(store.isCachedStore){
			noRelationStaticDataObj = store.noRelationStaticDataObj;
		}else{
			noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
		}
		pagesDataIndex = Object.keys(noRelationStaticDataObj);
		if(!Ext.Object.isEmpty(noRelationStaticDataObj)){
			Ext.each(pagesDataIndex, function(pageDataIndex) {
				pageData = noRelationStaticDataObj[pageDataIndex]
				if(pageDataIndex == store.currentPage){
					newRecordsP = me.getNewRecordsData(store);
					deleteRecordsP = me.getDeleteRecordsData(store);
					updateRecordsP = me.getUpdateRecordsData(store);
					justModeP = me.getJustModeRecordsData(store);
					if(!Ext.isEmpty(newRecordsP.recordData) || !Ext.isEmpty(deleteRecordsP.recordData) || !Ext.isEmpty(updateRecordsP.recordData) || !Ext.isEmpty(justModeP.recordData)){
						dirtyFlag=true;
					}
					if(dirtyFlag){
							return false;
					}
				}else{
					Ext.each(pageData,function(record){
						if(record.crudState=='R' && record.deleteFlag!='D'){
						}else if(record.deleteFlag=='D'){
							dirtyFlag=true;
						}else if(record.crudState=='U'){
							if(!Ext.isEmpty(record.modified)){
								modifieds =  Object.keys(record.modified);
								Ext.each(modifieds,function(modified){
									if(Ext.isEmpty(record.modified[modified]) && Ext.isEmpty(record.data[modified])){
										
									}else{
										if(modified!=store.model.idProperty && record.data[modified] != record.modified[modified]){
											if(record.data[modified] ==null && record.modified[modified] =='undefined'){
												
											}else{
												dirtyFlag=true;
												return false;
											}
										}
										/*if(record.data[modified] ==null && record.modified[modified] =='undefined'){
											
										}else{
											dirtyFlag=true;
											return false;
										}*/
									}
								});
							}
							//dirtyFlag=true;
						}
						if(record.phantom){
							if(!Ext.isEmpty(record.modified)){
								modifieds =  Object.keys(record.modified);
								Ext.each(modifieds,function(modified){
									if(!Ext.isEmpty(record.data[modified])){
										dirtyFlag=true;
										return false;
									}
								});
							}
							
							/*if(dirtyFlag){
								newRecordsData.push(record.data);
							}*/
						}
						if(dirtyFlag){
							return false;
						}
					});
					if(dirtyFlag){
							return false;
					}
					
				}
			});
			if(dirtyFlag){
				return true;
			}
		}else{
			if(store.isCachedStore){
				relationStaticDataArry = store.relationStaticDataArry;
			}else{
				relationStaticDataArry = store.cachedStore.relationStaticDataArry;
			}
			relationDataIndex = Object.keys(relationStaticDataArry);
			Ext.each(relationDataIndex,function(cachaedPageDataIndex){
				relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
				Ext.each(relationPagesData.cachedPageData.data,function(record){
					if(record.crudState=='R' && record.deleteFlag!='D'){
					}else if(record.deleteFlag=='D'){
						dirtyFlag=true;
					}else if(record.crudState=='U'){
						if(!Ext.isEmpty(record.modified)){
							modifieds =  Object.keys(record.modified);
							Ext.each(modifieds,function(modified){
								if(Ext.isEmpty(record.modified[modified]) && Ext.isEmpty(record.data[modified])){
									
								}else{
									if(modified!=store.model.idProperty && record.data[modified] != record.modified[modified]){
										if(record.data[modified] ==null && record.modified[modified] =='undefined'){
											
										}else{
											dirtyFlag=true;
											return false;
										}
									}
									//dirtyFlag=true;
									//return false;
								}
							});
						}
					}
					if(record.phantom){
						if(!Ext.isEmpty(record.modified)){
							modifieds =  Object.keys(record.modified);
							Ext.each(modifieds,function(modified){
								if(!Ext.isEmpty(record.data[modified])){
									dirtyFlag=true;
									return false;
								}
							});
							if(dirtyFlag){
								dirtyFlag=true;
							}
						}
					}
					if(dirtyFlag){
						return false;
					}
				});
				if(dirtyFlag){
					return false;
				}
			});
			if(dirtyFlag){
				return true;
			}
		}
			
	},
	//检验所有panel的更改
	checkPanelsModified:function(panelIds){
		var me = this,
			panel,
			modifiedFlag;
		Ext.each(panelIds,function(panelId){
			panel = Ext.getCmp(panelId);
			store = Ext.getStore(panel.store);
			modifiedFlag = me.checkModifieData(store,panel);
			if(modifiedFlag){
				return false;
			}
		});
		if(modifiedFlag){
			return true;
		}else{
			Rs.Msg.messageAlert({title:'提示',message:'数据没有发生变化，不需要保存'});
			return false;
		}
	},
	//整合数据
	integratedData:function(panelId,store){
		var me = this,
			panel = {},
			panelData = {},
			rePanelData = {};
		me.comCode = typeof(USERINFO)=='undefined'?'':USERINFO.COMPANYCODE;
		me.userCode = typeof(USERINFO)=='undefined'?'':USERINFO.ACCTCODE,
		me.userName = typeof(USERINFO)=='undefined'?'':USERINFO.ACCTNAME;
		if(Ext.isEmpty(me.userCode)){
			me.userCode = typeof(USERINFO)=='undefined'?'':USERINFO.USERCODE;
			me.userName = typeof(USERINFO)=='undefined'?'':USERINFO.USERNAME;
		}
		/*Ext.each(store.model.getFields(),function(fields){
			if(fields.name == 'COM_CODE'){
				me.comFlag = true;
			}else if(fields.name == 'UPD_CODE'){
				me.updFlag = true;
			}
		});*/
		if(!Ext.isEmpty(me.personCodeField) || !Ext.isEmpty(me.personNameField)){
			Ext.each(store.model.getFields(),function(fields){
				if(fields.name == 'COM_CODE'){
					me.comFlag = true;
				}
				if(fields.name == me.personCodeField){
					me.personFlag = true;
				}
			});
		}else{
			Ext.each(store.model.getFields(),function(fields){
				if(fields.name == 'COM_CODE'){
					me.comFlag = true;
				}
				if(fields.name == 'UPD_CODE'){
					me.updFlag = true;
				}
			});
		}
		
		if(store.isDynamicStore || store.isCachedStore){
			rePanelData = me.getAllModifiedRecordsData(store);
			panelData.newRecords = rePanelData.newRecords;
			panelData.deleteRecords = rePanelData.deleteRecords;
			panelData.updateRecords = rePanelData.updateRecords;
			panelData.justMode = rePanelData.justMode;
		}else{
			panelData.newRecords = this.getNewRecordsData(store);
			panelData.deleteRecords = this.getDeleteRecordsData(store);
			panelData.updateRecords = this.getUpdateRecordsData(store);
			panelData.justMode = this.getJustModeRecordsData(store);
		}
		panel.gridCode = panelId;
		panel.panelData = panelData;
		if(!Ext.isEmpty(Ext.getCmp(panelId).relationGridPanelId) || !Ext.isEmpty(Ext.getCmp(panelId).moreRelationGridObj)){
			panel.relationData = me.dealRelationData(Ext.getCmp(panelId));
		}
		return panel;
	},
	//处理关联数据
	dealRelationData:function(panel){
		var relationData = {},
			relData = {};
		if(!Ext.isEmpty(panel.relationGridPanelId)){
			//relData.relationCode = panel.relationGridPanelId;
			if(panel.isArrayItemObj(panel.relationGridQueryFieldArray)){
				//relData.relationFields = panel.relationGridQueryFieldArray;
				relData[panel.relationGridPanelId] = panel.relationGridQueryFieldArray;
			}else{
				var field = {},
					querFieldArray = [];
				Ext.each(panel.relationGridQueryFieldArray,function(querField){
					field.upField = querField;
					field.downField = querField;
					querFieldArray.push(field);
				});
				//relData.relationFields = querFieldArray;
				relData[panel.relationGridPanelId] = querFieldArray;
			}
			//relationData.push(relData);
		}
		if(!Ext.isEmpty(panel.moreRelationGridObj)){
			Ext.each(Ext.Object.getValues(panel.moreRelationGridObj),function(relation){
				if(panel.isArrayItemObj(relation.relationGridQueryFieldArray)){
                    relData[relation.relationGridPanelId] = relation.relationGridQueryFieldArray;
				}else{
					var field = {},
					    querFieldArray = [];
					Ext.each(relation.relationGridQueryFieldArray,function(querField){
						field.upField = querField;
						field.downField = querField;
						querFieldArray.push(field);
					});
					//relData.relationCode = relation.relationGridPanelId;
					//relData.relationFields = relation.relationGridQueryFieldArray;
					relData[relation.relationGridPanelId] = querFieldArray;
				//relationData.push(relData);
				}
				
			});
		}
		return relData;
	},
	//获取新增行数据
	getNewRecordsData:function(store){
		var me = this,
			newRecords = store.getNewRecords(),
			reNewRecords = {},
			dirtyFlag,
			newRecordsData = new Array();
		Ext.each(newRecords,function(newRecord){
			if(newRecord.dirty){
				modifieds =  Object.keys(newRecord.modified);
				Ext.each(modifieds,function(modified){
					if(!Ext.isEmpty(newRecord.data[modified])){
						dirtyFlag=true;
						return false;
					}
				});
				if(dirtyFlag){
					if(me.comFlag){
						newRecord.data.COM_CODE = me.comCode;
					}
					if(me.updFlag){
						newRecord.data.UPD_CODE = me.userCode;
						newRecord.data.UPD_NAME = me.userName; 
					}
					if(me.personFlag){
						newRecord.data[me.personCodeField] = me.userCode;
						newRecord.data[me.personNameField] = me.userName; 
					}
					newRecordsData.push(newRecord.data);
				}
			}
		});
		reNewRecords.recordData=newRecordsData;
		return reNewRecords;
	},
	//获取删除行数据
	getDeleteRecordsData:function(store){
		var me = this,
			deleteRecords = {},
			deleteRecordsData = new Array();
		store.each(function(record){
			if(record.deleteFlag=='D'){
				deleteRecordsData.push(record.data);
			}
		});
		deleteRecords.recordData = deleteRecordsData;
		return deleteRecords;
	},
	//获取调用模型的数据
	getJustModeRecordsData : function(store){
		var me = this,
			updateRecords = store.getUpdatedRecords(),
			reJustModeRecords = {},
			fiedNameS,
			recordsData = new Array();
		Ext.each(updateRecords,function(record){
			fiedNameS = Object.keys(record.modified);
			if(fiedNameS.length==1 && record.data.CHE_FLAG=='Y'){
				recordsData.push(record.data);
			}
		});
		reJustModeRecords.recordData = recordsData;
		return reJustModeRecords;
	},
	//获取修改行数据
	getUpdateRecordsData:function(store){
		var me = this,
			updateRecords = store.getUpdatedRecords(),
			reUpdateRecords = {},
			fiedNameS,
			modifieds = new Array(),
			modifiedData = {},
			recordsData = new Array();
		Ext.each(updateRecords,function(record){
			fiedNameS = Object.keys(record.modified);
			modifiedData = {};
			if(fiedNameS.length==1 && record.data.CHE_FLAG=='Y'){
				
			}else{
				Ext.each(fiedNameS,function(fiedName){
					if(Ext.isEmpty(record.modified[fiedName]) && Ext.isEmpty(record.data[fiedName])){
						
					}else{
						modifiedData[fiedName] = record.data[fiedName];
					}
				});
			}
			if(!Ext.Object.isEmpty(modifiedData)){
				modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
				if(me.updFlag){
					record.data.UPD_CODE = me.userCode; 
					record.data.UPD_NAME = me.userName;
					modifiedData.UPD_CODE = me.userCode; 
					modifiedData.UPD_NAME = me.userName;
				}
				if(me.personFlag){
					record.data[me.personCodeField] = me.userCode; 
					record.data[me.personNameField] = me.userName;
					modifiedData[me.personCodeField] = me.userCode; 
					modifiedData[me.personNameField] = me.userName;
				}
				modifieds.push(modifiedData);
				recordsData.push(record.data);
			}
		});
		reUpdateRecords.modifieds = modifieds;
		reUpdateRecords.recordData = recordsData;
		return reUpdateRecords;
	},
	//上下帧关联面板获得数据
	getAllModifiedRecordsData:function(store){
		var me = this,
			noRelationStaticDataObj,
			relationStaticDataArry, 
			pagesData,
			pagesDataIndex,
			relationPagesData,
			relationDataIndex,
			newRecords = {},
			dirtyFlag=false,
			updateRecords = {},
			deleteRecords = {},
			newRecordsP = {},
			updateRecordsP = {},
			deleteRecordsP = {},
			justMode = {},
			justModeP = {},
			returnOjbect = {},
			newRecordsData = new Array(),
			modifiedsData = new Array(),
			recordsData = new Array(),
			deleteRecordsData = new Array();
			justModeRecordData = new Array();
		if(store.isCachedStore){
			noRelationStaticDataObj = store.noRelationStaticDataObj;
		}else{
			noRelationStaticDataObj = store.cachedStore.noRelationStaticDataObj;
		}
		pagesDataIndex = Object.keys(noRelationStaticDataObj);
		if(!Ext.Object.isEmpty(noRelationStaticDataObj)){
			Ext.each(pagesDataIndex, function(pageDataIndex) {
				pageData = noRelationStaticDataObj[pageDataIndex]
				if(pageDataIndex == store.currentPage){
					newRecordsP = me.getNewRecordsData(store);
					deleteRecordsP = me.getDeleteRecordsData(store);
					updateRecordsP = me.getUpdateRecordsData(store);
					justModeP = me.getJustModeRecordsData(store);
				}else{
					Ext.each(pageData,function(record){
						if(record.crudState=='R' && record.deleteFlag!='D'){
						}else if(record.deleteFlag=='D'){
							deleteRecordsData.push(record.data)
						}else if(record.crudState=='U'){
							fiedNameS = Object.keys(record.modified);
							modifiedData = {};
							if(fiedNameS.length ==1 && record.data.CHE_FLAG=='Y'){
								justModeRecordData.push(record.data);
							}else{
								Ext.each(fiedNameS,function(fiedName){
									modifiedData[fiedName] = record.data[fiedName];
								});
								modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
								if(me.updFlag){
									record.data.UPD_CODE = me.userCode; 
									record.data.UPD_NAME = me.userName; 
									modifiedData.UPD_CODE = me.userCode; 
									modifiedData.UPD_NAME = me.userName; 
								}
								if(me.personFlag){
									record.data[me.personCodeField] = me.userCode; 
									record.data[me.personNameField] = me.userName;
									modifiedData[me.personCodeField] = me.userCode; 
									modifiedData[me.personNameField] = me.userName;
								}
								modifiedsData.push(modifiedData);
								recordsData.push(record.data);
							}
						}
						if(record.phantom){
							if(!Ext.isEmpty(record.modified)){
								modifieds =  Object.keys(record.modified);
								Ext.each(modifieds,function(modified){
									if(!Ext.isEmpty(record.data[modified])){
										dirtyFlag=true;
										return false;
									}
								});
								if(dirtyFlag){
									if(me.comFlag){
										record.data.COM_CODE = me.comCode;
									}
									if(me.updFlag){
										record.data.UPD_CODE = me.userCode;
										record.data.UPD_NAME = me.userName; 
									}
									if(me.personFlag){
										record.data[me.personCodeField] = me.userCode; 
										record.data[me.personNameField] = me.userName;
									}
									newRecordsData.push(record.data);
								}
							}
						}
					});
					
				}
			});
			updateRecords.modifieds = modifiedsData;
			updateRecords.recordData = recordsData;
			deleteRecords.recordData = deleteRecordsData;
			justMode.recordData = justModeRecordData;
			newRecords.recordData=newRecordsData;
			updateRecords = Ext.Object.merge(updateRecords,updateRecordsP),
			justMode = Ext.Object.merge(justMode,justModeP),
			deleteRecords = Ext.Object.merge(deleteRecords,deleteRecordsP),
			newRecords = Ext.Object.merge(newRecords,newRecordsP),
			returnOjbect.newRecords=newRecords;
			returnOjbect.deleteRecords=deleteRecords;
			returnOjbect.updateRecords=updateRecords;
			returnOjbect.justMode = justMode;
			return returnOjbect;
		}else{
			if(store.isCachedStore){
				relationStaticDataArry = store.relationStaticDataArry;
			}else{
				relationStaticDataArry = store.cachedStore.relationStaticDataArry;
			}
			relationDataIndex = Object.keys(relationStaticDataArry);
			Ext.each(relationDataIndex,function(cachaedPageDataIndex){
				relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
				Ext.each(relationPagesData.cachedPageData.data,function(record){
					if(record.crudState=='R' && record.deleteFlag!='D'){
					}else if(record.deleteFlag=='D'){
						deleteRecordsData.push(record.data)
					}else if(record.crudState=='U'){
						fiedNameS = Object.keys(record.modified);
						modifiedData = {};
						if(fiedNameS.length ==1 && record.data.CHE_FLAG=='Y'){
							justModeRecordData.push(record.data);
						}else{
							Ext.each(fiedNameS,function(fiedName){
								modifiedData[fiedName] = record.data[fiedName];
							});
							modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
							if(me.updFlag){
								record.data.UPD_CODE = me.userCode; 
								record.data.UPD_NAME = me.userName; 
								modifiedData.UPD_CODE = me.userCode; 
								modifiedData.UPD_NAME = me.userName; 
							}
							if(me.personFlag){
								record.data[me.personCodeField] = me.userCode; 
								record.data[me.personNameField] = me.userName;
								modifiedData[me.personCodeField] = me.userCode; 
								modifiedData[me.personNameField] = me.userName;
							}
							modifiedsData.push(modifiedData);
							recordsData.push(record.data);
						}
					}
					if(record.phantom){
						if(!Ext.isEmpty(record.modified)){
							modifieds =  Object.keys(record.modified);
							Ext.each(modifieds,function(modified){
								if(!Ext.isEmpty(record.data[modified])){
									dirtyFlag=true;
									return false;
								}
							});
							if(dirtyFlag){
								var newRecordData = record.data;
								newRecordData.FUU_ID = relationPagesData.queryRecord.id;
								if(me.comFlag){
									newRecordData.COM_CODE = me.comCode;
								}
								if(me.updFlag){
									newRecordData.UPD_CODE = me.userCode;
									newRecordData.UPD_NAME = me.userName; 
								}
								if(me.personFlag){
									newRecordData[me.personCodeField] = me.userCode; 
									newRecordData[me.personNameField] = me.userName;
								}
								newRecordsData.push(newRecordData);
								//newRecordsData.push(record.data);
							}
						}
					}
				});
			});
			updateRecords.modifieds = modifiedsData;
			updateRecords.recordData = recordsData;
			deleteRecords.recordData = deleteRecordsData;
			newRecords.recordData=newRecordsData;
			justMode.recordData = justModeRecordData;
			updateRecords = Ext.Object.merge(updateRecords,updateRecordsP),
			deleteRecords = Ext.Object.merge(deleteRecords,deleteRecordsP),
			newRecords = Ext.Object.merge(newRecords,newRecordsP),
			justMode = Ext.Object.merge(justMode,justModeP),
			returnOjbect.newRecords=newRecords;
			returnOjbect.deleteRecords=deleteRecords;
			returnOjbect.updateRecords=updateRecords;
			returnOjbect.justMode = justMode;
			return returnOjbect;
		}	
		
	},
	//执行操作
	doExecuteAction:function(params){
		var me = this,
			url = me.url,
			errorFlag = false,
			returnData = {},
			errorMsg;
		//var storage = Ext.util.LocalStorage.get('rslocal');
        //token = 'Bearer '+storage.getItem("token");
		token = typeof(TOKEN)=='undefined'?'':TOKEN;
		Ext.Ajax.request({
			url: url,
			async:false,
			headers:{
				Authorization:token
			},
			jsonData : JSON.stringify(params),
			method:'POST',
			dataType:"json",
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				returnData.responseData = obj;
				if(obj.success){
					if(!Ext.isEmpty(me.executeSuccess)){
						errorFlag = me.executeSuccess(me,response);
					}else{
						errorFlag = false;
					}
				}else{
					if(!Ext.isEmpty(me.executeFailures)){
						me.executeFailures(me,response);
					}else{
						//Rs.Marker.mark(obj.data);
						Rs.Msg.messageAlert({title:'提示',message:obj.data,buttons:Ext.MessageBox.OK});
					}
					errorFlag = true;
				}
			},
			failure: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(!Ext.isEmpty(me.executeFailures)){
					errorFlag = me.executeFailures(me,response);
				}else{
					Rs.Marker.mark(obj.data);
					//Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
				}
				errorFlag = true;
			}
		});
		returnData.errorFlag=errorFlag;
		return returnData;
	},
	//验证插件总体调用
	checkDatas : function(){
		var me = this,
			panelData = new Array(),
			errorMsg,
			errorData = {},
			panel;
		window.RsPanelErrorMsg = [];
		Ext.each(me.panelIds,function(panelId){
			panel = Ext.getCmp(panelId);
			Rs.Marker.unmark(panel);
			errorMsg = me.checkPanelData(panel);
			if(!Ext.isEmpty(errorMsg) && errorMsg.success == false){
				panelData.push(errorMsg);
			}
		});
		if(!Ext.isEmpty(panelData)){
			errorData.panelData=panelData;
			window.RsPanelErrorMsg = panelData;
			Rs.Marker.mark(panelData);
		}
		if(!Ext.Object.isEmpty(errorData)){
			return false;
		}else{
			return true;
		}
		//console.log(errorData);
	},
	//验证插件分面板调用
	checkPanelData : function(panel){
		var me = this,
			panelPlugins = panel.plugins,
			errorMsg,
			error = new Array(),
			errorData = {},
			errorMsgArray = new Array(),
			errorArrArray = new Array(),
			checkPlugins = new Array();
		Ext.each(panelPlugins,function(panelPlugin){
			if("griddatamustinput"==panelPlugin.ptype || 'griddatacheckrepeat'==panelPlugin.ptype || 'sumCompare'==panelPlugin.ptype || 'formulaPlu'==panelPlugin.ptype){
				checkPlugins.push(panelPlugin);
			}
		},this);
		Ext.each(checkPlugins,function(checkPlugin){
			errorMsg = {};
			if("griddatamustinput"==checkPlugin.ptype){
				errorMsg = checkPlugin.checkMustInput(panel);
			}else if("griddatacheckrepeat"==checkPlugin.ptype){
				errorMsg = checkPlugin.checkRepeat(panel);
			}else if("sumCompare"==checkPlugin.ptype){
				errorMsg = checkPlugin.headDetailSumCompareControl();
			}else if("formulaPlu"==checkPlugin.ptype){
				errorMsg = checkPlugin.formulaPlu();
			}
			if(!Ext.isEmpty(errorMsg) && errorMsg.success == false){
				error.push(errorMsg);
				//errorArrArray.push(errorMsg.errArr);
				Ext.each(errArr,function(errAr){
					errorArrArray.push(errAr)
				});
				errorMsgArray.push(errorMsg.errorMsg);
				errorData.panelId =  errorMsg.panelID;
			}
		},this);
		if(errorArrArray.length>0){
			errorData.success=false;
		}else{
			errorData.success=true;
		}
		errorData.errArr = errorArrArray;
		errorData.errorMsg = errorMsgArray;
		//Rs.Marker.mark(error[1]);
		//console.log(error);
		return errorData;
	},
	//添加控制插件
	initAddPlugins : function(){
		var me = this;
		Ext.each(me.panelIds,function(panelid){
			panel = Ext.getCmp(panelid.toString());
			if(!Ext.isEmpty(panel) && panel.isXType('grid')){
				me.addControlPlugins(panel);
			}
		});
	},
	//获取所有控制插件
	addControlPlugins:function(panel){
		var me = this,
			panelPlugins = panel.plugins,
			editPlugin,
			editControlPlugins = new Array();
		Ext.each(panelPlugins,function(panelPlugin){
			if("fieldscompare"==panelPlugin.ptype || "statecontrolf" == panelPlugin.ptype || "relatestatecontrolf" == panelPlugin.ptype
			|| "fielddiffentcontrolf" == panelPlugin.ptype || "fieldsamecontrolf" == panelPlugin.ptype || "fieldsdifferentb" == panelPlugin.ptype
			|| "fieldsamecontrolb" == panelPlugin.ptype || "calculateassign" == panelPlugin.ptype || "headdetailcalculate" == panelPlugin.ptype){
				editControlPlugins.push(panelPlugin);
			}
			if("cellediting"===panelPlugin.ptype){
				editPlugin = panelPlugin;
			}
			if("rowediting"===panelPlugin.ptype){
				editPlugin = panelPlugin;
			}
		},this);
		if(!Ext.isEmpty(editPlugin)){
			editPlugin.on('edit',function(editPlugin,context){
				me.doControPlugis(editControlPlugins,context);
			},me);
			editPlugin.on('beforeedit',function(editPlugin,context){
				var returnFlag = true;
				Ext.each(editControlPlugins,function(controlPlugin){
					returnFlag = true;
					if("statecontrolf"==controlPlugin.ptype){
						returnFlag = controlPlugin.gridStateControl(editPlugin,context.record,context.field);
					}
					if("relatestatecontrolf"==controlPlugin.ptype){
						returnFlag = controlPlugin.relateStateControl(editPlugin,context.record,context.field);
					}
					if(!returnFlag){
						return false;
					}
				});
				if(!returnFlag){
					return false;
				}
			},me);
		}
	},
	//控制插件执行
	doControPlugis:function(editControlPlugins,context){
		var returnFlag = true;
		Ext.each(editControlPlugins,function(controlPlugin){
			returnFlag = true;
			if("fieldscompare"==controlPlugin.ptype){
				returnFlag = controlPlugin.gridCompareControl(context);
			}
			if("fielddiffentcontrolf"==controlPlugin.ptype){
				returnFlag = controlPlugin.gridAttributeUnsame(context);
			}
			if("fieldsamecontrolf"==controlPlugin.ptype){
				returnFlag = controlPlugin.gridAttributeSame(context);
			}
			if("fieldsdifferentb"==controlPlugin.ptype){
				returnFlag = controlPlugin.gridFieldsDifferentControlB(context);
			}
			if("fieldsamecontrolb"==controlPlugin.ptype){
				returnFlag = controlPlugin.singleGridFunction('',context.record,context.field,context.rowIdx);
			}
			if("calculateassign"==controlPlugin.ptype){
				returnFlag = controlPlugin.gridCalculate(context);
			}
			if("headdetailcalculate"==controlPlugin.ptype){
				returnFlag = controlPlugin.headCalculate(context);
			}
			if(!returnFlag){
				return false;
			}
		});
		if(!returnFlag){
			return false;
		}
	},
	//替换总体
	replaceIdToal:function(params,responseData){
		var me = this;
		Ext.each(params.panels,function(panel){
			var panelId = panel.gridCode;
			var replacePanel = Ext.getCmp(panelId);
			var replaceStroe = replacePanel.getStore();
			if(!Ext.isEmpty(me.needReplaceFields)){
				if(!Ext.isEmpty(me.needReplaceFields[panelId])){
					var replaceString = me.needReplaceFields[panelId];
					replaceString = replaceString.substr(1);
					replaceString = replaceString.substring(0,replaceString.length-1);
					var replaceFields = replaceString.split(',');
				}else{
					var replaceFields =null;
				}
			}else{
				var replaceFields =null;
			}
			if(replaceStroe.isDynamicStore || replaceStroe.isCachedStore){
				me.replaceIdC(replaceStroe,responseData.data[panelId],replaceFields);
			}else{
				me.replaceIdN(replaceStroe,responseData.data[panelId],replaceFields);
				
			}
		});
	},
	//普通替换
	replaceIdN:function(replaceStroe,responseData,replaceFields){
		replaceStroe.each(function(record){
			if(record.deleteFlag == 'D'){
				replaceStroe.remove(record);
			}
		});
		Ext.each(responseData,function(replaceData){
			var replaceKey = Ext.Object.getKeys(replaceData);
			var record = replaceStroe.getById(replaceKey);
			record.set(replaceStroe.model.idProperty,replaceData[replaceKey][replaceStroe.model.idProperty]);
			Ext.each(replaceFields,function(field){
				if(!Ext.isEmpty(replaceData[replaceKey][field])){
					record.set(field,replaceData[replaceKey][field]);
				}
			});
			record.id = replaceData[replaceKey][replaceStroe.model.idProperty];
		});
		replaceStroe.commitChanges();
	},
	//缓存面板替换
	replaceIdC:function(replaceStroe,responseData,replaceFields){
		
		var noRelationStaticDataObj,
			pagesDataIndex,
			pageData,
			relationStaticDataArry,
			relationDataIndex,
			relationPagesData;
		if(replaceStroe.isCachedStore){
			noRelationStaticDataObj = replaceStroe.noRelationStaticDataObj;
		}else{
			noRelationStaticDataObj = replaceStroe.cachedStore.noRelationStaticDataObj;
		}
		pagesDataIndex = Object.keys(noRelationStaticDataObj);
		if(!Ext.Object.isEmpty(noRelationStaticDataObj)){
			Ext.each(pagesDataIndex, function(pageDataIndex) {
				pageData = noRelationStaticDataObj[pageDataIndex]
				Ext.each(pageData,function(record){
					if(record.deleteFlag == 'D'){
						replaceStroe.remove(record);
					}
					if(Ext.isEmpty(responseData)){
						return ;
					}
					if(record.phantom){
						if(!Ext.isEmpty(record.data[replaceStroe.model.idProperty])){
							if(!Ext.isEmpty(record.get('HUU_ID'))){
								record.set('HUU_ID',responseData[record.id].HUU_ID);
							}
							Ext.each(replaceFields,function(field){
								if(!Ext.isEmpty(responseData[record.id][field])){
									record.set(field,responseData[record.id][field]);
								}
							});
							record.set(replaceStroe.model.idProperty,responseData[record.id].UU_ID);
							record.id = record.data[replaceStroe.model.idProperty];
							
							//record.data[replaceStroe.model.idProperty]='111111';
						}
					}
				});
			});
		}else{
			if(replaceStroe.isCachedStore){
				relationStaticDataArry = replaceStroe.relationStaticDataArry;
			}else{
				relationStaticDataArry = replaceStroe.cachedStore.relationStaticDataArry;
			}
			relationDataIndex = Object.keys(relationStaticDataArry);
			Ext.each(relationDataIndex,function(cachaedPageDataIndex){
				relationPagesData = relationStaticDataArry[cachaedPageDataIndex];
				Ext.each(relationPagesData.cachedPageData.data,function(record){
					if(record.deleteFlag == 'D'){
						replaceStroe.remove(record);
					}
					if(Ext.isEmpty(responseData)){
						return ;
					}
					if(record.phantom){
						if(!Ext.isEmpty(record.data[replaceStroe.model.idProperty])){
							if(!Ext.isEmpty(record.get('HUU_ID'))){
								record.set('HUU_ID',responseData[record.id].HUU_ID);
							}
							Ext.each(replaceFields,function(field){
								if(!Ext.isEmpty(responseData[record.id][field])){
									record.set(field,responseData[record.id][field]);
								}
							});
							record.set(replaceStroe.model.idProperty,responseData[record.id].UU_ID);
							record.id = record.data[replaceStroe.model.idProperty];
							
							//record.data[replaceStroe.model.idProperty]='111111';
						}
					}
				});
			});
		}
		replaceStroe.commitChanges();
	}
});
