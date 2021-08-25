
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
         *@cfg {String} relationGridPanelId
         *关联的面板id
         */
        relationGridPanelId: '',
        /**
         *@cfg {array} relationGridQueryFieldArray
         *关联字段
         */
        relationGridQueryFieldArray: [],
        /**
         *@cfg {Boolean} addIcon
         *无数据时默认新增
         */
        insertFlag: false
    },
    relationGridPanelId: "",
    relationGridQueryFieldArray: [],
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
    layout: 'anchor',

    bodyAriaRole: 'form',

    basicFormConfigs: [
        /**
         * @cfg api
         * @inheritdoc Ext.form.Basic#cfg!api
         */
        'api',

        /**
         * @cfg baseParams
         * @inheritdoc Ext.form.Basic#cfg!baseParams
         */
        'baseParams',

        /**
         * @cfg errorReader
         * @inheritdoc Ext.form.Basic#cfg!errorReader
         */
        'errorReader',

        /**
         * @cfg jsonSubmit
         * @inheritdoc Ext.form.Basic#cfg!jsonSubmit
         */
        'jsonSubmit',

        /**
         * @cfg method
         * @inheritdoc Ext.form.Basic#cfg!method
         */
        'method',

        /**
         * @cfg paramOrder
         * @inheritdoc Ext.form.Basic#cfg!paramOrder
         */
        'paramOrder',

        /**
         * @cfg paramsAsHash
         * @inheritdoc Ext.form.Basic#cfg!paramsAsHash
         */
        'paramsAsHash',

        /**
         * @cfg reader
         * @inheritdoc Ext.form.Basic#cfg!reader
         */
        'reader',

        /**
         * @cfg standardSubmit
         * @inheritdoc Ext.form.Basic#cfg!standardSubmit
         */
        'standardSubmit',

        /**
         * @cfg timeout
         * @inheritdoc Ext.form.Basic#cfg!timeout
         */
        'timeout',

        /**
         * @cfg trackResetOnLoad
         * @inheritdoc Ext.form.Basic#cfg!trackResetOnLoad
         */
        'trackResetOnLoad',

        /**
         * @cfg url
         * @inheritdoc Ext.form.Basic#cfg!url
         */
        'url',

        /**
         * @cfg waitMsgTarget
         * @inheritdoc Ext.form.Basic#cfg!waitMsgTarget
         */
        'waitMsgTarget',

        /**
         * @cfg waitTitle
         * @inheritdoc Ext.form.Basic#cfg!waitTitle
         */
        'waitTitle'
    ],
    storePage: 1,
    initComponent: function () {
        var me = this;

        if (me.frame) {
            me.border = false;
        }
        if (Ext.isEmpty(me.insertFlag)) {
            me.insertFlag = false;
        }
        me.initFieldAncestor();
        me.callParent();

        me.relayEvents(me.form, [
                /**
                 * @event beforeaction
                 * @inheritdoc Ext.form.Basic#beforeaction
                 */
                'beforeaction',

                /**
                 * @event actionfailed
                 * @inheritdoc Ext.form.Basic#actionfailed
                 */
                'actionfailed',

                /**
                 * @event actioncomplete
                 * @inheritdoc Ext.form.Basic#actioncomplete
                 */
                'actioncomplete',

                /**
                 * @event validitychange
                 * @inheritdoc Ext.form.Basic#validitychange
                 */
                'validitychange',

                /**
                 * @event dirtychange
                 * @inheritdoc Ext.form.Basic#dirtychange
                 */
                'dirtychange'
            ]);

        // Start polling if configured
        if (me.pollForChanges) {
            me.startPolling(me.pollInterval || 500);
        }

        if (me.store) {
            var store = Ext.getStore(me.store);
            var model = store.model;
            var idProperty = Ext.create('Ext.form.field.Text', {
                name: model.idProperty,
                hidden: true
            });
            me.items.items.push(idProperty);
            if (!Ext.isEmpty(me.relationGridPanelId)) {
                me.on('recordChange', function (record) {
                    var obj = me.getRelationObj(me.relationGridPanelId, me.relationGridQueryFieldArray);
                    me.loadGridPanel(obj, record);
                });
            }
            store.on('load', function (store, records, options) {
                if (!Ext.isEmpty(records) && records.length > 0) {
                    me.page = 0;
                    me.loadRecord(records[0]);
                    //Ext.loadRecord(Ext.getStore(component.store).data.items[0]);
                } else {
                    if (me.insertFlag) {
                        me.addNewRecord();
                    }
                }
            });
        }
        //store.add({});
    },
    setStore: function (store) {
        this.store = store.id;
    },
    getRelationObj: function (relationGridPanelId, relationGridQueryFieldArray) {
        var relationGridPanel = Ext.getCmp(relationGridPanelId),
        relationGridStore = relationGridPanel.getStore().getDynamicStore(),
        cachedStore = relationGridStore.getCachedStore(),
        obj = {
            relationGridPanel: relationGridPanel,
            relationGridPanelId: relationGridPanelId,
            relationGridQueryFieldArray: relationGridQueryFieldArray,
            cachedStore: cachedStore,
            relationGridStore: relationGridStore
        };
        relationGridStore.queryConditionField = {};
        return obj;
    },
    loadGridPanel: function (relatedObj, record, fn) {
        Ext.each(relatedObj.relationGridQueryFieldArray, function (fieldName, index, array) {
            if (Ext.isObject(fieldName)) {
                if (!Ext.isEmpty(record.data[fieldName.upField])) {
                    relatedObj.relationGridStore.queryConditionField[fieldName.downField] = record.data[fieldName.upField];
                } else {
                    relatedObj.relationGridStore.queryConditionField[fieldName.downField] = "null";
                }
            } else {
                if (!Ext.isEmpty(record.data[fieldName])) {
                    relatedObj.relationGridStore.queryConditionField[fieldName] = record.data[fieldName];
                } else {
                    relatedObj.relationGridStore.queryConditionField[fieldName] = "null";
                }
            }

        });
        relatedObj.cachedStore.queryStaticDataCondintion["queryRecord"] = record;
        relatedObj.relationGridStore.loadPage(1, {
            newRecord: record.phantom,
            callback: function () {}
        });
    },
    initItems: function () {
        // Create the BasicForm
        this.callParent();
        this.initMonitor();
        this.form = this.createForm();
    },

    // Initialize the BasicForm after all layouts have been completed.
    afterFirstLayout: function () {
        this.callParent(arguments);
        this.form.initialize();
    },

    /**
     * @private
     */
    createForm: function () {
        var cfg = {},
        props = this.basicFormConfigs,
        len = props.length,
        i = 0,
        prop;

        for (; i < len; ++i) {
            prop = props[i];
            cfg[prop] = this[prop];
        }

        return new Ext.form.Basic(this, cfg);
    },

    /**
     * Provides access to the {@link Ext.form.Basic Form} which this Panel contains.
     * @return {Ext.form.Basic} The {@link Ext.form.Basic Form} which this Panel contains.
     */
    getForm: function () {
        return this.form;
    },

    /**
     * Loads an {@link Ext.data.Model} into this form (internally just calls
     * {@link Ext.form.Basic#loadRecord}).
     * See also {@link Ext.form.Basic#trackResetOnLoad trackResetOnLoad}. The fields in the model
     * are mapped to  fields in the form by matching either the {@link Ext.form.field.Base#name}
     * or {@link Ext.Component#itemId}.
     * @param {Ext.data.Model} record The record to load
     * @return {Ext.form.Basic} The Ext.form.Basic attached to this FormPanel
     */
    loadRecord: function (record) {
        this.fireEvent('recordChange', record);
        return this.getForm().loadRecord(record);
    },

    /**
     * Returns the currently loaded Ext.data.Model instance if one was loaded via
     * {@link #loadRecord}.
     * @return {Ext.data.Model} The loaded instance
     */
    getRecord: function () {
        return this.getForm().getRecord();
    },

    /**
     * Persists the values in this form into the passed {@link Ext.data.Model} object
     * in a beginEdit/endEdit block. If the record is not specified, it will attempt to update
     * (if it exists) the record provided to {@link #loadRecord}.
     * @param {Ext.data.Model} [record] The record to edit
     * @return {Ext.form.Basic} The Ext.form.Basic attached to this FormPanel
     */
    updateRecord: function (record) {
        //if(Ext.isEmpty(this.getRecord())){
        //	return false;
        //}
        return this.getForm().updateRecord(record);
    },

    /**
     * @method getValues
     * Convenience function for fetching the current value of each field in the form.
     * This is the same as calling {@link Ext.form.Basic#getValues this.getForm().getValues()}.
     *
     * @inheritdoc Ext.form.Basic#getValues
     */
    getValues: function (asString, dirtyOnly, includeEmptyText, useDataValues) {
        return this.getForm().getValues(asString, dirtyOnly, includeEmptyText, useDataValues);
    },

    /**
     * @method isDirty
     * Convenience function to check if the form has any dirty fields. This is the same as calling
     * {@link Ext.form.Basic#isDirty this.getForm().isDirty()}.
     *
     * @inheritdoc Ext.form.Basic#isDirty
     */
    isDirty: function () {
        return this.form.isDirty();
    },

    /**
     * @method isValid
     * Convenience function to check if the form has all valid fields. This is the same as calling
     * {@link Ext.form.Basic#isValid this.getForm().isValid()}.
     *
     * @inheritdoc Ext.form.Basic#isValid
     */
    isValid: function () {
        return this.form.isValid();
    },

    /**
     * @method reset
     * Convenience function reset the form. This is the same as calling
     * {@link Ext.form.Basic#reset this.getForm().reset()}.
     *
     * @inheritdoc Ext.form.Basic#reset
     */
    reset: function (resetRecord) {
        return this.form.reset(resetRecord);
    },

    /**
     * @method hasInvalidField
     * Convenience function to check if the form has any invalid fields. This is the same as calling
     * {@link Ext.form.Basic#hasInvalidField this.getForm().hasInvalidField()}.
     *
     * @inheritdoc Ext.form.Basic#hasInvalidField
     */
    hasInvalidField: function () {
        return this.form.hasInvalidField();
    },

    doDestroy: function () {
        this.stopPolling();
        this.form.destroy();

        this.callParent();
    },

    /**
     * This is a proxy for the underlying BasicForm's {@link Ext.form.Basic#load} call.
     * @param {Object} options The options to pass to the action (see {@link Ext.form.Basic#load}
     * and {@link Ext.form.Basic#doAction} for details)
     */
    load: function (options) {
        this.form.load(options);
    },

    /**
     * This is a proxy for the underlying BasicForm's {@link Ext.form.Basic#submit} call.
     * @param {Object} options The options to pass to the action (see {@link Ext.form.Basic#submit}
     * and {@link Ext.form.Basic#doAction} for details)
     */
    submit: function (options) {
        this.form.submit(options);
    },

    /**
     * Start an interval task to continuously poll all the fields in the form for changes in their
     * values. This is normally started automatically by setting the {@link #pollForChanges} config.
     * @param {Number} interval The interval in milliseconds at which the check should run.
     */
    startPolling: function (interval) {
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
    stopPolling: function () {
        var task = this.pollTask;

        if (task) {
            Ext.util.TaskManager.stop(task, true);
            this.pollTask = null;
        }
    },

    /**
     * Forces each field within the form panel to
     * {@link Ext.form.field.Field#checkChange check if its value has changed}.
     */
    checkChange: function () {
        var fields = this.form.getFields().items,
        f,
        fLen = fields.length;

        for (f = 0; f < fLen; f++) {
            fields[f].checkChange();
        }
        if (this.isDirty()) {
            var record = this.getRecord();
            if (Ext.isEmpty(record)) {
                if (this.insertFlag) {
                    this.addNewRecord();
                } else {
                    return false;
                }
            }
            this.updateRecord(this.getRecord());
        } else {
            var record = this.getRecord();
            if (!Ext.isEmpty(record) && !Ext.isEmpty(record.crudState) && !Ext.isEmpty(record.modified)) {
                if (record.crudState === 'U') {
                    //this.revertModified(this.getRecord());
                    this.updateRecord(this.getRecord());
                } else if (record.crudState === 'C') {
                    this.updateRecord(this.getRecord());
                }
            }
        }
    },
    getStore: function () {
        return Ext.getStore(this.store);
    },
    revertModified: function (record) {
        var revertFieds = Object.keys(record.modified);
        Ext.each(revertFieds, function (revertFied) {
            record.set(revertFied, record.modified[revertFied]);
        })
    },
    setNullValue: function (record, store, items, forceFlag) {
        if (record.phantom || forceFlag) {
            if (store.data.length > 1) {
                Ext.each(items, function (item) {
                    item.setValue();
                });
            }
        }
    },
    removeRecord: function () {
        var store = Ext.getStore(this.store),
        page = this.page,
        record = store.getRange()[page],
        preRecord = store.getRange()[page - 1],
        nextRecord = store.getRange()[page + 1],
        items = this.items.items;
        store.remove(record);
        if (page === 0) {
            this.loadRecord(nextRecord);
            this.setNullValue(nextRecord, store, items);
            this.page = page + 1;
        } else {
            this.loadRecord(preRecord);
            this.setNullValue(preRecord, store, items);
            this.page = page - 1;
        }
    },
    addNewRecord: function () {
        var store = Ext.getStore(this.store),
        model = store.model,
        record = Ext.create(model, {}),
        items = this.items.items;
        if (this.page != undefined) {
            this.page += 1;
        } else {
            this.page = 0;
        }
        store.insert(this.page, record);
        this.setNullValue(record, store, items, true);
        this.loadRecord(record);
    }
});
