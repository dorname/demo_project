/**
 * @class Rs.ext.form.PagePanel
 * @extends Ext.form.Panel
 * @author Zanshuangpeng
 * 卡片页面板；根据pc端修改；
 *
 * ****
 * 数据加载：通过 initialize-->loadRecord 将store里面的数据加载页面
 * 数据修改：初始化时，设置了 startPolling 循环事件，每隔500ms将页面修改数据写回store；
 * ****
 */
Ext.define('Rs.ext.form.PagePanel', {
    extend: 'Ext.form.Panel',
    alias: 'widget.Pageform',
    alternateClassName: ['Ext.PageFormPanel', 'Ext.form.PageFormPanel'],
	
	configs: {
        /**
         *@cfg {String} store
         *数据源
         */
        store: '',
        /**
         *@cfg {Boolean} addIcon
         *无数据时默认新增;针对维护界面，当为true时，维护界面可以新添加数据。否则，*维护界面添加不进去数据
         */
        insertFlag:false
    },
    /**
     * @cfg {Boolean} pollForChanges
     * If set to `true`, sets up an interval task (using the {@link #pollInterval}) in which the
     * panel's fields are repeatedly checked for changes in their values. This is in addition
     * to the normal detection each field does on its own input element, and is not needed
     * in most cases. It does, however, provide a means to absolutely guarantee detection
     * of all changes including some edge cases in some browsers which do not fire native events.
     * Defaults to `false`.
     */

    /**
     * @cfg {Number} pollInterval
     * Interval in milliseconds at which the form's fields are checked for value changes. Only used
     * if the {@link #pollForChanges} option is set to `true`. Defaults to 500 milliseconds.
     */

    /**
     * @cfg {Ext.enums.Layout/Object} layout
     * The {@link Ext.container.Container#layout} for the form panel's immediate child items.
     */
    layout: 'auto',

    bodyAriaRole: 'form',

    	
    initialize : function() {
        var me = this;
		
		if(Ext.isEmpty(me.insertFlag)){
			me.insertFlag=false;
		}
		
		this.callParent();
        this.element.on('submit', 'onSubmit', this);
		
		if(me.store){
			var store = Ext.getStore(me.store);
			var model = store.model;
			var idProperty = Ext.create('Ext.field.Text',{
				name:model.idProperty,
				hidden:true
			});
			// me.items.items.push(idPropertys);
			
			store.on('load',function(store,records,options){
				if(!Ext.isEmpty(records) && records.length>0){
					me.page=0;
					me.loadRecord(records[0]);
					//Ext.loadRecord(Ext.getStore(component.store).data.items[0]);
				}else{
					if(me.insertFlag){
						me.addNewRecord();
					}
				}
			});
			me.startPolling( 500);
		}
		//store.add({});
    },

	 /**
     * Start an interval task to continuously poll all the fields in the form for changes in their
     * values. This is normally started automatically by setting the {@link #pollForChanges} config.
     * @param {Number} interval The interval in milliseconds at which the check should run.
     */
    startPolling: function(interval) {
        this.stopPolling();

        this.pollTask = Ext.util.TaskManager.start({
            interval: interval,
            run: this.checkChange,
            scope: this
        });
    },

    /**
     * Stop a running interval task that was started by {@link #startPolling}.
     */
    stopPolling: function() {
        var task = this.pollTask;

        if (task) {
            Ext.util.TaskManager.stop(task, true);
            this.pollTask = null;
        }
    },
    
  
  
    /**
     * Loads an {@link Ext.data.Model} into this form by calling {@link #setValues} with the
     * {@link Ext.data.Model#getData record data}. The fields in the model are mapped to 
     * fields in the form by matching either the {@link Ext.form.field.Base#name} or
     * {@link Ext.Component#itemId}.  See also {@link #trackResetOnLoad}. 
     * @param {Ext.data.Model} record The record to load
     * @return {Ext.form.Basic} this
     */
    loadRecord: function(record) {
        this._record = record;
        return this.setValues(record.getData());
    },
 
    /**
     * Returns the last Ext.data.Model instance that was loaded via {@link #loadRecord}
     * @return {Ext.data.Model} The record
     */
    getRecord: function() {
        return this._record;
    },
	/**
	* lined at @Ext.form.Basic-method-updateRecord
	*/
	updateRecord: function(record) {
        record = record || this._record;
 
        if (!record) {
            //<debug>
            Ext.raise("A record is required.");
            //</debug>
 
            return this;
        }
 
        // eslint-disable-next-line vars-on-top
        var fields = record.self.fields,
            values = this.getValues(),
            obj = {},
            i = 0,
            len = fields.length,
            name;
 
        for (; i < len; ++i) {
            name = fields[i].name;
 
            if (values.hasOwnProperty(name)) {
                obj[name] = values[name];
            }
        }
 
        record.beginEdit();
        record.set(obj);
        record.endEdit();
 
        return this;
    },
	
    /**
     * Forces each field within the form panel to
     * {@link Ext.form.field.Field#checkChange check if its value has changed}.
     */
    checkChange: function() {
	    var fields = this._record,
            f;
            

        // for (f = 0; f < fLen; f++) {
            // fields[f].checkChange();
        // }
		if(this.isDirty()){
			var record = this._record;
			if(Ext.isEmpty(record)){
				if(this.insertFlag){
					this.addNewRecord();
				}else{
					return false;
				}
			}
			this.updateRecord(this._record);
		}else{
			var record = this._record;
			if(!Ext.isEmpty(record) && !Ext.isEmpty(record.crudState) && !Ext.isEmpty(record.modified)){
				if(record.crudState ==='U'){
					//this.revertModified(this.getRecord());
					this.updateRecord(this._record);
				}else if(record.crudState ==='C'){
					this.updateRecord(this._record);
				}
			}
		}
    },
	getStore:function(){
		return Ext.getStore(this.store);
	},
	revertModified:function(record){
		var revertFieds = Object.keys(record.modified);
		Ext.each(revertFieds,function(revertFied){
			record.set(revertFied,record.modified[revertFied]);
		})
	},
	addNewRecord:function(){
		var store = Ext.getStore(this.store),
			model = store.model,
			record = Ext.create(model,{}),
			items = this.items.items;
		if(this.page!=undefined){
			this.page+=1;
		}else{
			this.page=0;
		}
		store.insert(this.page,record);
		if(store.data.length>1){
			Ext.each(items,function(item){
				item.setValue();
			});
		}
		this.loadRecord(record);
	}
});
