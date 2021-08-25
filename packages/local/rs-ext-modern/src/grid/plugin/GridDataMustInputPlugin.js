Ext.define('Rs.ext.grid.plugin.GridDataMustInputPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.griddatamustinput',
	requires: [
		// 'Rs.ext.button.RsButton'
	],
	configs:{
		/**
		*@cfg {array} fields
		*必输字段数组
		*/
		fields:[],
		/**
		*@cfg {String} panelID
		*面板id
		*/
		panelID:'',
		/**
		*@cfg {String} url
		*其它附加的验证条件，书写格式示例 '([record_man_name]=="小刚" || [record_man_name]=="小华") && ["aa","bb","cc"].includes([serve_type_name])'
		*/
		otherCdt:'',
		/**
		*@cfg {array} url
		*异常编码
		*/
		errCode:[]
	},
	//初始化
	init:function(){
		
	},
	checkMustInput: function(panel){
		var me = this;
			me.panel = panel,
			panelID = me.panelID,//异常面板
			fields = me.fields,//验证字段
			errCode = me.errCode,//异常编码
			errArr = [];//异常uuid和字段
		if(fields!==null && !Ext.isEmpty(fields)){
			var ret = me.checkFieldsConfig(fields);
			if(ret){
				var retv = me.checkMustInputDo(fields);
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
	//验证必输
	checkMustInputDo:function(fields){
		var me =this,
			retVlaue = {},
	    	store = me.panel.getStore(),
			errUUID = [],
			errArr = [],
			keyIds = store.getModel().idProperty,
			otherCdt = me.otherCdt,//其它特定条件
			records = new Ext.util.MixedCollection();
		//条件拆分
		store.each(function(record, index, store){
			if(me.checkIsValidRec(record)){
				Ext.each(fields, function(field, fIndex, fields){
					var joinKey = field;
					var data = record.get(field);
					if(otherCdt){
						var flag = true;
							flag = me.checkComp(record,otherCdt);
						if(!flag){//不符合附加条件，则可为空
							flag = false;
						}
						if(flag&&!data){//满足附加条件时，需必输 保留行号，UUID，空字段，空字段名称
							if(errUUID.indexOf(record.get(keyIds)) == -1){
								errUUID.push(record.get(keyIds));
								errArr.push({uuid:record.get(keyIds),checkField:[joinKey], index:index})
							}else{
								for(var p in errArr){
									if(errArr[p].uuid == record.get(keyIds)){
										errArr[p].checkField.push(joinKey)
										break
									}
								}
							}
						}
					}else{
						if(!data){//没有附件条件，必输 保留行号，UUID，空字段，空字段名称
							if(errUUID.indexOf(record.get(keyIds)) == -1){
								errUUID.push(record.get(keyIds));
								errArr.push({uuid:record.get(keyIds),checkField:[joinKey], index:index})
							}else{
								for(var p in errArr){
									if(errArr[p].uuid == record.get(keyIds)){
										errArr[p].checkField.push(joinKey)
										break
									}
								}
							}
						}
					}
				}, this);
			}
		})
		
		if(errArr.length>0){
			retVlaue = {success: false, errArr: errArr};
		}else{
			retVlaue = {success: true, errArr: errArr};
		}
		
		return retVlaue;
	},
	//检查必输字段有效性
	checkFieldsConfig:function(fields){
		var me = this,
			store = me.panel.getStore(),
			sFields = store.getModel().fields.items,
			allFields = [],
			myDataIndex = [];
		if(Ext.isArray(fields)){
			for(var i=0;i<sFields.length;i++){
				allFields[i] = sFields[i].getName();
			}
			for(var k in fields){
				if(allFields.indexOf(fields[k]) == -1){
					console.log('您的必输字段配置错误，请检查');
					return false;
				}
			}
		}else{
			console.log('您的必输字段配置错误，请检查');
			return false;
		}
		
		if(me.panel.isXType('grid')){
			Ext.each(me.panel.getColumns(), function(column){
				if(!Ext.isEmpty(column.dataIndex)){
					myDataIndex.push(column.dataIndex);
				}
			});
		}else{
			myDataIndex = allFields;
		}
		
		me.myDataIndex = myDataIndex;//所有显示字段dataIndex
		return true;
	},
	//检查数据行是否需要验证必输(当前行是非删除行)
	checkIsValidRec:function(record){
		var me = this,validFlag=false;
		if(record.dirty){
			var modifieds = Object.keys(record.modified);
			Ext.each(modifieds,function(modified){
				if(!Ext.isEmpty(record.data[modified])){
					validFlag=true;
					return false;
				}
			});
		}
		//删除行不验证
		if(record.deleteFlag == 'D'){
			validFlag=false;
		}else{
			//原有行需要验证
			if(record.crudState == 'R' || record.crudState == 'U'){
				validFlag=true;
			}
		}
		return validFlag;
	},
	//字符串作为可执行代码运行
	doStr:function(fn) {
		var Fn = Function;  //一个变量指向Function，防止有些前端编译工具报错
		return new Fn("return " + fn)();
	},
	//是否符合附加条件 1 =; 2 !=; 3 >; 4 <; 5 >=; 6 <=; 7 in ; 8 not in
	checkComp:function(record,otherCdt){
		var re = this.strReplace(otherCdt,[])
		var sd = this.strFeArr;
		for(var i=0;i<sd.length;i++){
			otherCdt = otherCdt.replaceAll("["+sd[i]+"]",'"'+record.get(sd[i])+'"')
		}
		var retv = this.doStr(otherCdt);
		return retv;
	},
	strReplace:function(str,strFeArr){
		strFeArr = strFeArr || [];
		var sr = str.substring(str.indexOf("[") + 1, str.indexOf("]"));
		if(str.indexOf("[") == -1 || str.indexOf("]") == -1){
			return 1
		}
		if(this.myDataIndex.indexOf(sr)==-1){
			var ix = str.indexOf("]");
			var s2 = str.substring(ix+1)
			return this.strReplace(s2,this.strFeArr);
		}else{
			var ix = str.indexOf("]");
			var s2 = str.substring(ix+1)
			strFeArr.push(sr)
			this.strFeArr = strFeArr;
			return this.strReplace(s2,this.strFeArr);
		}
	}
});
