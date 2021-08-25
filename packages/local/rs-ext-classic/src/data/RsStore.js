/**
 * @class Rs.ext.data.RsStore
 * @extends Ext.data.Store
 * @author ZanShuangpeng
 * RsStore
 */
Ext.define('Rs.ext.data.RsStore', {
    extend: 'Ext.data.Store',
    alias: 'widget.rsstore',
    configs: {
        /**
         *@cfg {String} addAltText
         *是否触发load前验证
         */
        checkBeforeLoad: true,
        /**
         *@cfg {String} addIcon
         *默认值字段
         */
        defaultFieldValue: {}
    },
    loadPage: function(page, options) {
        var me = this,
            size = me.getPageSize();

        if(me.checkBeforeLoad && me.checkNeedSync()){
            Ext.Msg.show({
                title: '提示' ,
                msg: '存在未保存的数据,确定继续操作?',
                buttons: Ext.Msg.OKCANCEL,
				closable:false,
                fn: function(btn, text) {
                    //me.un('beforeload' , me.beforeLoadCheckData , me);
                    if (btn == 'ok') {
						me.checkNeedSyncFlag=true
                        me.currentPage = page;
                        // Copy options into a new object so as not to mutate passed in objects
                        options = Ext.apply({
                            page: page,
                            start: (page - 1) * size,
                            limit: size,
                            addRecords: !me.getClearOnPageLoad()
                        }, options);

                        me.read(options);
                        me.needsSync = undefined;
                    }else{
						me.checkNeedSyncFlag='';
					}
                },
                scope: me
            });
            return;
        }
		me.checkNeedSyncFlag='';
        me.currentPage = page;

        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            page: page,
            start: (page - 1) * size,
            limit: size,
            addRecords: !me.getClearOnPageLoad()
        }, options);

        me.read(options);
    },
	flushLoad: function() {
        var me = this,
            options = me.pendingLoadOptions,
            operation;
        if (me.destroying || me.destroyed) {
            return;
        }
        // If it gets called programatically before the timer fired, the listener will need
        // cancelling.
        me.clearLoadTask();
        if (!options) {
            return;
        }
        me.setLoadOptions(options);
        if (me.getRemoteSort() && options.sorters) {
            me.fireEvent('beforesort', me, options.sorters);
        }
        operation = Ext.apply({
            internalScope: me,
            internalCallback: me.onProxyLoad,
            scope: me
        }, options);
        me.lastOptions = operation;
        operation = me.createOperation('read', operation);
		if(Ext.isEmpty(me.checkNeedSyncFlag) && me.checkBeforeLoad && me.checkNeedSync()){
            Ext.Msg.show({
                title: '提示' ,
                msg: '存在未保存的数据,确定继续操作?',
                buttons: Ext.Msg.OKCANCEL,
                closable: false,
                fn: function(btn, text) {
                   // me.un('beforeload' , me.beforeLoadCheckData , me);
                    if (btn == 'ok') {
						me.checkNeedSyncFlag='';
                        if (me.fireEvent('beforeload', me, operation) !== false) {
							me.onBeforeLoad(operation);
							me.loading = true;
							// Internal event, fired after the flag is set, we need
							// to fire this beforeload is too early
							if (me.hasListeners.beginload) {
								me.fireEvent('beginload', me, operation);
							}
							operation.execute();
						} else {
							if (me.getAsynchronousLoad()) {
								operation.abort();
							}
							operation.setCompleted();
						}
                    }else{
						return ;
					}
                },
                scope: me
            });
        }else{
			me.checkNeedSyncFlag='';
			if (me.fireEvent('beforeload', me, operation) !== false) {
				me.onBeforeLoad(operation);
				me.loading = true;
				// Internal event, fired after the flag is set, we need
				// to fire this beforeload is too early
				if (me.hasListeners.beginload) {
					me.fireEvent('beginload', me, operation);
				}
				operation.execute();
			} else {
				if (me.getAsynchronousLoad()) {
					operation.abort();
				}
				operation.setCompleted();
			}
		}
    },
	checkNeedSync:function(){
		var me =this;
			modifiedRecords=me.getModifiedRecords();
			modifiedFlag=false;
			newRecord=[];
			emptyCount=0;
		if(Ext.isEmpty(modifiedRecords)){
			if(me.checkDeleteRecord()){
				return true;
			}else{
				return false;
			}
		}else{
			Ext.each(modifiedRecords,function(modifiedRecord){
				if(emptyCount>0){
					return true;
				}
				modifiedFlag = me.checkIsEmptyRecord(modifiedRecord);
				if(!modifiedFlag){
					emptyCount+=1;
					return true;
				}
			},this);
			if(modifiedFlag){
				return false;
			}else{
				return true;
			}
		}
	},
	//验证某一行是否为修改行
	checkIsEmptyRecord:function(record){
		var me = this;
		    emptyFlag=true;
		if(record.crudState=='U'){
			emptyFlag=false;
			return emptyFlag;
		}
		if(record.crudState=='D'){
			emptyFlag=true;
			return emptyFlag;
		}
		if(me.checkDeleteRecord()){
			emptyFlag=false;
			return emptyFlag;
		}
		if(record.phantom){
			var columnfields = Object.keys(record.data);
				defaultFields = Ext.isEmpty(me.defaultFieldValue)? '':Object.keys(me.defaultFieldValue);
			Ext.each(defaultFields,function(defaultField){
				var col = columnfields.indexOf(defaultField);
				if(col==-1){
					
				}else{
					columnfields.splice(col, 1);
				}
			});
			for(var i=1;i<columnfields.length;i++){
				if(!Ext.isEmpty(record.data[columnfields[i]])){
					emptyFlag=false;
					return emptyFlag;
				}
			}
		}
		return emptyFlag;
	},
	checkDeleteRecord:function(){
		var me=this;
			deleteFlag=false;
		me.each(function(record){
			if(!deleteFlag){
				if(record.deleteFlag=='D'){
					deleteFlag=true;
				}
			}
		},this);
		if(deleteFlag){
			return true;
		}else{
			return false;
		}
	}
});
