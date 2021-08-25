Ext.define('Rs.ext.panel.plugin.SaveDraftPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.savedraftplugin',
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
			me.initAddButton(bar);
	},
	//初始化保存按钮
	initAddButton:function(bar){
		var me = this,
			style = {},
			style = Ext.Object.merge(style,me.buttonStyle);
			if(Ext.isEmpty(me.buttonIcon)){
				me.buttonIcon = 'saveAction-button-item';
			}
			if(Ext.isEmpty(me.buttonText)){
				me.buttonText = '保存草稿';
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
			bar.insert(3,addbutton);
		}else{
			bar.add(addbutton);
		}
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
		//验证是否有修改数据
		if(!me.checkPanelsModified(me.panelIds)){
			return false;
		}
		//整合数据
		Ext.each(me.panelIds,function(panelId){
			panel = Ext.getCmp(panelId);
			store = Ext.getStore(panel.store);
			panels.push(me.integratedData(panelId,store));
		});
		var first = me.url.indexOf("auto/");
		var last = me.url.indexOf("/crud");
		params.pagCode = me.url.substring(first+5,last);
		params.funCode = me.id;
		params.panels = panels;
		params.draftFlag = true;
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
					if(!Ext.isEmpty(newRecordsP.recordData) || !Ext.isEmpty(deleteRecordsP.recordData) || !Ext.isEmpty(updateRecordsP.recordData)){
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
										if(record.data[modified] ==null && record.modified[modified] =='undefined'){
												
											}else{
												dirtyFlag=true;
												return false;
											}
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
							}
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
		}else{
			panelData.newRecords = this.getNewRecordsData(store);
			panelData.deleteRecords = this.getDeleteRecordsData(store);
			panelData.updateRecords = this.getUpdateRecordsData(store);
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
					var newRecData = newRecord.data;
					newRecData.DRA_FLAG = 'Y';
					if(me.comFlag){
						newRecData.COM_CODE = me.comCode;
					}
					if(me.updFlag){
						newRecData.UPD_CODE = me.userCode;
						newRecData.UPD_NAME = me.userName; 
					}
					if(me.personFlag){
						newRecData[me.personCodeField] = me.userCode;
						newRecData[me.personNameField] = me.userName; 
					}
					newRecordsData.push(newRecData);
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
				var deleRecData = record.data;
				deleRecData.DRA_FLAG = 'Y';
				deleteRecordsData.push(deleRecData);
			}
		});
		deleteRecords.recordData = deleteRecordsData;
		return deleteRecords;
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
			Ext.each(fiedNameS,function(fiedName){
				if(Ext.isEmpty(record.modified[fiedName]) && Ext.isEmpty(record.data[fiedName])){
					
				}else{
					modifiedData[fiedName] = record.data[fiedName];
				}
			});
			if(!Ext.Object.isEmpty(modifiedData)){
				modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
				modifiedData.DRA_FLAG = 'Y';
				var upRecData = record.data;
				upRecData.DRA_FLAG = 'Y';
				if(me.updFlag){
					upRecData.UPD_CODE = me.userCode; 
					upRecData.UPD_NAME = me.userName;
					modifiedData.UPD_CODE = me.userCode; 
					modifiedData.UPD_NAME = me.userName;
				}
				if(me.personFlag){
					upRecData[me.personCodeField] = me.userCode; 
					upRecData[me.personNameField] = me.userName;
					modifiedData[me.personCodeField] = me.userCode; 
					modifiedData[me.personNameField] = me.userName;
				}
				
				modifieds.push(modifiedData);
				recordsData.push(upRecData);
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
			returnOjbect = {},
			newRecordsData = new Array(),
			modifiedsData = new Array(),
			recordsData = new Array(),
			deleteRecordsData = new Array();
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
				}else{
					Ext.each(pageData,function(record){
						if(record.crudState=='R' && record.deleteFlag!='D'){
						}else if(record.deleteFlag=='D'){
							var deleRecData = record.data;
							deleRecData.DRA_FLAG = 'Y';
							deleteRecordsData.push(deleRecData)
						}else if(record.crudState=='U'){
							fiedNameS = Object.keys(record.modified);
							modifiedData = {};
							Ext.each(fiedNameS,function(fiedName){
								modifiedData[fiedName] = record.data[fiedName];
							});
							modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
							modifiedData.DRA_FLAG = 'Y';
							var upRecData = record.data;
							upRecData.DRA_FLAG = 'Y';
							
							if(me.updFlag){
								upRecData.UPD_CODE = me.userCode; 
								upRecData.UPD_NAME = me.userName; 
								modifiedData.UPD_CODE = me.userCode; 
								modifiedData.UPD_NAME = me.userName; 
							}
							if(me.personFlag){
								upRecData[me.personCodeField] = me.userCode; 
								upRecData[me.personNameField] = me.userName;
								modifiedData[me.personCodeField] = me.userCode; 
								modifiedData[me.personNameField] = me.userName;
							}
							modifiedsData.push(modifiedData);
							recordsData.push(upRecData);
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
									var newRecData = record.data;
									newRecData.DRA_FLAG = 'Y';
									if(me.comFlag){
										newRecData.COM_CODE = me.comCode;
									}
									if(me.updFlag){
										newRecData.UPD_CODE = me.userCode;
										newRecData.UPD_NAME = me.userName; 
									}
									if(me.personFlag){
										newRecData[me.personCodeField] = me.userCode; 
										newRecData[me.personNameField] = me.userName;
									}
									newRecordsData.push(newRecData);
								}
							}
						}
					});
					
				}
			});
			updateRecords.modifieds = modifiedsData;
			updateRecords.recordData = recordsData;
			deleteRecords.recordData = deleteRecordsData;
			newRecords.recordData=newRecordsData;
			updateRecords = Ext.Object.merge(updateRecords,updateRecordsP),
			deleteRecords = Ext.Object.merge(deleteRecords,deleteRecordsP),
			newRecords = Ext.Object.merge(newRecords,newRecordsP),
			returnOjbect.newRecords=newRecords;
			returnOjbect.deleteRecords=deleteRecords;
			returnOjbect.updateRecords=updateRecords;
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
						var deleRecData = record.data;
						deleRecData.DRA_FLAG = 'Y';
						deleteRecordsData.push(deleRecData)
					}else if(record.crudState=='U'){
						fiedNameS = Object.keys(record.modified);
						modifiedData = {};
						Ext.each(fiedNameS,function(fiedName){
							modifiedData[fiedName] = record.data[fiedName];
						});
						modifiedData[store.model.idProperty] = record.data[store.model.idProperty];
						modifiedData.DRA_FLAG = 'Y';
						var upRecData = record.data;
						upRecData.DRA_FLAG = 'Y';
						
						if(me.updFlag){
							upRecData.UPD_CODE = me.userCode; 
							upRecData.UPD_NAME = me.userName; 
							modifiedData.UPD_CODE = me.userCode; 
							modifiedData.UPD_NAME = me.userName; 
						}
						if(me.personFlag){
							upRecData[me.personCodeField] = me.userCode; 
							upRecData[me.personNameField] = me.userName;
							modifiedData[me.personCodeField] = me.userCode; 
							modifiedData[me.personNameField] = me.userName;
						}
						modifiedsData.push(modifiedData);
						recordsData.push(upRecData);
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
								var newRecData = record.data;
								newRecData.FUU_ID = relationPagesData.queryRecord.id;
									newRecData.DRA_FLAG = 'Y';
								if(me.comFlag){
									newRecData.COM_CODE = me.comCode;
								}
								if(me.updFlag){
									newRecData.UPD_CODE = me.userCode;
									newRecData.UPD_NAME = me.userName; 
								}
								if(me.personFlag){
									newRecData[me.personCodeField] = me.userCode; 
									newRecData[me.personNameField] = me.userName;
								}
									newRecordsData.push(newRecData);
							}
						}
					}
				});
			});
			updateRecords.modifieds = modifiedsData;
			updateRecords.recordData = recordsData;
			deleteRecords.recordData = deleteRecordsData;
			newRecords.recordData=newRecordsData;
			updateRecords = Ext.Object.merge(updateRecords,updateRecordsP),
			deleteRecords = Ext.Object.merge(deleteRecords,deleteRecordsP),
			newRecords = Ext.Object.merge(newRecords,newRecordsP),
			returnOjbect.newRecords=newRecords;
			returnOjbect.deleteRecords=deleteRecords;
			returnOjbect.updateRecords=updateRecords;
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
		Ext.Ajax.request({
			url: url,
			async:false,
			jsonData : JSON.stringify(params),
			method:'POST',
			dataType:"json",
			success: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(obj.success){
					if(!Ext.isEmpty(me.executeSuccess)){
						me.executeSuccess(me,response);
					}else{
						errorFlag = false;
					}
				}else{
					if(!Ext.isEmpty(me.executeFailures)){
						me.executeFailures(me,response);
					}else{
						Rs.Marker.mark(obj.data);
						//Rs.Msg.messageAlert({title:'提示',message:obj.message,modal:true,buttons:Ext.MessageBox.OK});
					}
					errorFlag = true;
				}
			},
			failure: function(response, opts) {
				var obj = Ext.decode(response.responseText);
				if(!Ext.isEmpty(me.executeFailures)){
					me.executeFailures(me,response);
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
	replaceIdN:function(replaceStroe,responseData){
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
	replaceIdC:function(replaceStroe,responseData){
		//if(Ext.isEmpty(responseData)){
		//	return ;
		//}
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
						}
					}
				});
			});
		}
		replaceStroe.commitChanges();
	}
});
