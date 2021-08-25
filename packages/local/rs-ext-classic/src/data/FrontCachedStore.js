/**
 * @class Rs.ext.data.FrontCachedStore
 * @extends Ext.data.Store
 * @author LiGuangqiao
 * 伴生数据存储 获取请求数据的同时会缓存到伴生静态存储（cachedStore）中
 */
Ext.define('Rs.ext.data.FrontCachedStore', {
    extend: 'Ext.data.Store',
    alias: 'store.frontcachedstore',
    configs: {
        /**
         *@cfg {object} extraParams
         *额外参数对象
         */
        extraParams: {},
        /**
         *@cfg {string} gridPanelId
         *与当前store绑定的grid列表面板ID
         */
        gridPanelId: '',
        /**
         *@cfg {string} isCacheDataToFront
         *defaultValue:false
         *是否将数据缓存到静态存储，开关打开后默认已加载过的数据不再重新请求
         */
        isCacheDataToFront: false,
        /**
         *@cfg {string} paramsFormStrict
         *defaultValue:true
         *请求的参数是否按照规范严格要求例如：params: {"sysCode":"sys","parentMenuCode":"gl20"}
         */
        paramsFormStrict: true
    },
    extraParams: {
        //"test":"haoshuohaohsuo"
    },
    isFrontCachedStore: true,
    paramsFormStrict: true,
    paramKey: "params",
    isCacheDataToFront: false,
    isDynamicStore: true,
    forceChangeStore: false,
    constructor: function (config) {
        var me = this,
        data;
        if (config) {
            if (config.buffered) {
                //<debug>
                if (this.self !== Ext.data.Store) {
                    Ext.raise('buffered config not supported on derived Store classes. ' +
                        'Please derive from Ext.data.BufferedStore.');
                }
                //</debug>

                // Hide this from Cmd
                /* eslint-disable-next-line dot-notation */
                return new Ext.data['BufferedStore'](config);
            }

            //<debug>
            if (config.remoteGroup) {
                Ext.log.warn('Ext.data.Store: remoteGroup has been removed. ' +
                    'Use remoteSort instead.');
            }
            //</debug>
        }

        /**
         * @event beforeprefetch
         * Fires before a prefetch occurs. Return `false` to cancel.
         * @param {Ext.data.Store} this
         * @param {Ext.data.operation.Operation} operation The associated operation.
         */
        /**
         * @event groupchange
         * Fired whenever the grouping in the grid changes.
         * @param {Ext.data.Store} store The store.
         * @param {Ext.util.Grouper} grouper The grouper object.
         */
        /**
         * @event prefetch
         * Fires whenever records have been prefetched.
         * @param {Ext.data.Store} this
         * @param {Ext.data.Model[]} records An array of records.
         * @param {Boolean} successful `true` if the operation was successful.
         * @param {Ext.data.operation.Operation} operation The associated operation.
         */
        /**
         * @event filterchange
         * Fired whenever the filter set changes.
         * @param {Ext.data.Store} store The store.
         * @param {Ext.util.Filter[]} filters The array of Filter objects.
         */

        me.callParent([config]);
        // See applyData for the details.
        data = me.inlineData;
        if (data) {
            delete me.inlineData;
            me.loadInlineData(data);
        }
        var proxy = me.getProxy();
        me.initCachedStore();
        //保持静态数据存储与动态请求数据存储的页码信息保持一致
        me.cachedStore.on('load', function (store) {
            var dataRemovedArray = [];
            store.totalCount = store.queryStaticDataCondintion["noRelatedDataTotalCount"];
            if (!Ext.isEmpty(store.relationStaticDataArry)) {
                Ext.each(store.relationStaticDataArry, function (recordObj, index, array) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === store.currentPage
                         && recordObj["queryRecord"] === store.queryStaticDataCondintion["queryRecord"]) {
                        if (recordObj["queryRecord"].phantom) {
                            store.totalCount = tempRecord["data"].length;
                        } else {
                            store.totalCount = tempRecord["relatedDataTotalCount"];
                        }
                    }
                    if (!Ext.isEmpty(store.getDynamicStore().removedRecord)) {
                        Ext.each(store.getDynamicStore().removedRecord, function (recordRemoved, index, itself) {
                            if (recordObj["queryRecord"] === recordRemoved) {
                                dataRemovedArray.push(recordObj);
                            }
                        });
                    }

                });
                Ext.each(dataRemovedArray, function (obj) {
                    Ext.Array.remove(store.relationStaticDataArry, obj);
                });
            }
        });
        /*
        me.cachedStore.on('clear', function (store) {
        //me.cachedDataAllClear();
        });
         */
        //当前为静态存储（cachedStore）时每次新增数据，同步到缓存数据集中
        me.cachedStore.on('add', function (store, record, index) {
            if (index === 0) {
                store.totalCount = 1;
            }
            me.synchroData(store, store);
        });

        //当前为静态存储（cachedStore）时每次删除数据，同步到缓存数据集中
        me.cachedStore.on('remove', function (store, records, index) {
            me.synchroData(store, store);
        });
        me.cachedStore.onAfter('remove', function (store, records, index, isMove) {
            var grid = Ext.getCmp(me.gridPanelId);
            if (!Ext.Object.isEmpty(grid.relationGridStoreSet)) {
                Ext.Object.eachValue(grid.relationGridStoreSet, function (relationGridStore) {
                    relationGridStore.removedRecord = records;
                });
                // grid.relationGridStore.removedRecord = records;
            }
        });
        //往关联面板传递请求参数
        me.on('beforeload', function (store) {
            var finalQueryParams = {},
            proxyParams,
            queryParams;
            proxyParams = proxy.getConfig("extraParams");
            if (!Ext.isEmpty(proxyParams)) {
                if (!Ext.isEmpty(proxyParams[me.paramKey])) {
                    if (!Ext.isEmpty(me.queryConditionField) && !Ext.isString(proxyParams[me.paramKey])) {
                        queryParams = Ext.Object.merge(proxyParams, me.queryConditionField);
                    } else if (!Ext.isEmpty(me.queryConditionField) && Ext.isString(proxyParams[me.paramKey])) {
                        queryParams = Ext.Object.merge(Ext.decode(proxyParams[me.paramKey]), me.queryConditionField);
                    } else {
                        if (Ext.isString(proxyParams[me.paramKey])) {
                            queryParams = Ext.decode(proxyParams[me.paramKey]);
                        } else {
                            queryParams = proxyParams[me.paramKey];
                        }
                    }
                } else {
                    if (!Ext.isEmpty(me.queryConditionField)) {
                        queryParams = Ext.Object.merge(proxyParams, me.queryConditionField);
                    } else {
                        queryParams = proxyParams;
                    }
                }
                Ext.Object.merge(queryParams, store.extraParams);
                if (me.paramsFormStrict && !Ext.Object.isEmpty(queryParams)) {
                    finalQueryParams[me.paramKey] = Ext.encode(queryParams);
                } else {
                    finalQueryParams = queryParams;
                }
            }
            if (proxy.type !== "memory") {
                proxy.setConfig("extraParams", finalQueryParams);
            }
        });
        me.on('clear', function (store) {
            me.cachedDataAllClear();
        });
        //每次动态store新增数据，同步到缓存数据集中
        me.on('add', function (store, record, index) {
            me.synchroData(me.getCachedStore(), me); ;
        });

        //每次动态store删除数据，同步到缓存数据集中
        me.on('remove', function (store, records, index) {
            me.synchroData(me.getCachedStore(), me);
        });
        me.onAfter('remove', function (store, records, index, isMove) {
            var grid = Ext.getCmp(store.gridPanelId);
            if (!Ext.Object.isEmpty(grid.relationGridStoreSet)) {
                Ext.Object.eachValue(grid.relationGridStoreSet, function (relationGridStore) {
                    relationGridStore.removedRecord = records;
                });
                // grid.relationGridStore.removedRecord = records;
            }
        });
        //记录数据总数，并将无关联列表数据保存到缓存store的noRelationStaticDataObj里（关联列表数据存到relationStaticDataArry里）
        me.on('load', function (store) {
            var cachedData = store.getCachedStore().getRelationStaticDataArry(),
            dataRemovedArray = [];
            if (!Ext.isEmpty(cachedData) && !Ext.isEmpty(store.removedRecord)) {
                Ext.each(cachedData, function (pageRecord, index, array) {
                    var cachedPageData = pageRecord.cachedPageData;
                    Ext.each(store.removedRecord, function (recordRemoved, index, itself) {
                        if (pageRecord["queryRecord"] === recordRemoved) {
                            dataRemovedArray.push(pageRecord);
                        }
                    });
                });
                Ext.each(dataRemovedArray, function (obj) {
                    Ext.Array.remove(store.relationStaticDataArry, obj);
                });
            }
            me.synchroData(me.getCachedStore(), me);
        });
    },
    setExtraParams: function (obj) {
        var me = this;
        me.extraParams = obj;
    },
    getExtraParams: function () {
        var me = this;
        return me.obj;
    },
    /**
     * 重写loadPage函数
     * private
     * @method loadPage
     * 逻辑简述：每次执行loadPage时先检验cachedStore中是否已有数据----->是------>使用cachedStore加载静态数据
     * 															|
     *															 ----->否------>发送请求去加载数据
     */
    loadPage: function (page, options) {
        var me = this,
        size = me.getPageSize(),
        grid = Ext.getCmp(me.gridPanelId);
        me.currentPage = page;
        if (Ext.isEmpty(options)) {
            options = {
                newRecord: false
            }
        }
        if ((options.newRecord && (!me.isHaveCachData(page))) || (me.isHaveCachData(page) && me.isCacheDataToFront && (!me.forceChangeStore))) {
            //console.log("dynamicStore to cachedStore", grid.id);
            grid.setStore(me.cachedStore);
            me.cachedStore.loadPage(page, options);
        } else {
            grid.setStore(me);
            // console.log("dynamicStore load", grid.id);
            options = Ext.apply({
                page: page,
                start: (page - 1) * size,
                limit: size,
                addRecords: !me.getClearOnPageLoad()
            }, options);
            me.read(options);
            me.forceChangeStore = false;
        }
    },
    /**
     * 重写cachedStore的loadPage函数
     * private
     * @method cachedLoadPage
     * 逻辑简述：每次执行loadPage时先检验cachedStore中是否已有数据----->是------>在cachedStore加载静态数据
     * 															|
     *															 ----->否------>使用dynamicStore去加载数据
     */
    cachedLoadPage: function (page, options) {
        var me = this,
        size = me.getPageSize(),
        grid = Ext.getCmp(me.dynamicStore.gridPanelId),
        record;
        if (Ext.isEmpty(options)) {
            options = {
                newRecord: false
            }
        }
        if ((options.newRecord && (!me.isHaveCachData(page))) || (me.isHaveCachData(page) && me.isCacheDataToFront && (!me.forceChangeStore))) {
            //console.log("cachedStore load", grid.id);
            me.removeAll();
            if (!Ext.isEmpty(me.relationStaticDataArry)) {
                Ext.each(me.relationStaticDataArry, function (recordObj) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === page
                         && recordObj["queryRecord"] === me.queryStaticDataCondintion["queryRecord"]) {
                        record = tempRecord.data;
                    }
                });
            } else {
                record = me.noRelationStaticDataObj[page];
            }
            me.currentPage = page;
            me.setData(record);
            options = Ext.apply({
                page: page,
                start: (page - 1) * size,
                limit: size,
                addRecords: true
            }, options);
            me.read(options);
        } else {
            // console.log("cachedStore to dynamicStore", grid.id);
            me.forceChangeStore = false;
            grid.setStore(me.dynamicStore);
            me.dynamicStore.loadPage(page, options);
        }
    },
    /**
     * 判断是否已经有静态数据
     * private
     * @method isHaveCachData
     * @return {boolean} true/false
     * 逻辑简述：
     * 根据relationStaticDataArry（关联查询的静态数据集，多帧页面时启用优先级大于无关联面板数据集）、
     * noRelationStaticDataObj（无关联面板的静态数据集）判断是否已经有静态数据
     *
     */
    isHaveCachData: function (page) {
        var me = this,
        flag = false;
        if (me.isDynamicStore) {
            if (!Ext.isEmpty(me.cachedStore.relationStaticDataArry)) {
                Ext.each(me.cachedStore.relationStaticDataArry, function (pageRecord, index, array) {
                    var cachedPageData = pageRecord.cachedPageData
                        if (pageRecord["currentPage"] === page
                             && pageRecord["queryRecord"] === me.cachedStore.queryStaticDataCondintion["queryRecord"]) {
                            flag = true;
                        }
                });
            }
            if (!Ext.isEmpty(me.cachedStore.noRelationStaticDataObj[page])) {
                flag = true;
            }
        }
        if (me.isCachedStore) {
            if (!Ext.isEmpty(me.relationStaticDataArry)) {
                Ext.each(me.relationStaticDataArry, function (pageRecord, index, array) {
                    var cachedPageData = pageRecord.cachedPageData
                        if (pageRecord["currentPage"] === page
                             && pageRecord["queryRecord"] === me.queryStaticDataCondintion["queryRecord"]) {
                            flag = true;
                        }
                });
            }

            if (!Ext.isEmpty(me.noRelationStaticDataObj)) {
                if (!Ext.isEmpty(me.noRelationStaticDataObj[page])) {
                    flag = true;
                }
            }
        }
        return flag;
    },
    /**
     * 初始化静态数据存储
     * private
     * @method initCachedStore
     */
    initCachedStore: function () {
        var me = this,
        cachedStore = Ext.create('Ext.data.Store', {
            id: me.id + "Cached",
            dynamicStore: me,
            isFrontCachedStore: true,
            isCachedStore: true,
            pageSize: me.getPageSize(),
            //当前grid没有被关联时的的静态数据集
            noRelationStaticDataObj: {},
            //当前grid被关联时页面静态数据集
            relationStaticDataArry: [],
            isCacheDataToFront: me.isCacheDataToFront,
            model: me.getModel(),
            queryStaticDataCondintion: {},
            proxy: {
                type: 'memory',
                enablePaging: true,
                reader: {
                    type: 'json'
                }
            },
            loadPage: me.cachedLoadPage,
            isHaveCachData: me.isHaveCachData,
            getCachedStore: me.getCachedStore,
            getDynamicStore: me.getDynamicStore,
            //获取无关联页面静态缓存数据集
            getRelationStaticDataArry: function () {
                return me.getCachedStore().relationStaticDataArry;
            },
            //获取关联查询页面静态缓存数据集
            getNoRelationStaticDataObj: function () {
                return me.getCachedStore().noRelationStaticDataObj;
            }
        });
        me.cachedStore = cachedStore;
    },
    /**
     * 返回静态缓存数据存储
     * public
     * @method getCachedStore
     * @return {Ext.data.Store} CachedStore
     */
    getCachedStore: function () {
        var me = this;
        if (me.isDynamicStore) {
            return me.cachedStore;
        }
        return me;
    },
    /**
     * 返回动态请求数据存储
     * public
     * @method getDynamicStore
     * @return {Rs.ext.data.frontCachedStore} getdynamicStore
     */
    getDynamicStore: function () {
        var me = this;
        if (me.isCachedStore) {
            return me.dynamicStore;
        }
        return me;
    },
    /**
     * 清空缓存数据
     * public
     * @method cachedDataAllClear
     */
    cachedDataAllClear: function () {
        var me = this;
        if (!Ext.isEmpty(me.getCachedStore().getRelationStaticDataArry())) {
            me.getCachedStore().getRelationStaticDataArry().length = 0;
        }
        if (!Ext.isEmpty(me.getCachedStore().getNoRelationStaticDataObj())) {
            Ext.Object.clear(me.getCachedStore().getNoRelationStaticDataObj());
        }
    },
    /**
     * 同步数据方法
     * private
     * @method synchroData
     */
    synchroData: function (cachedStore, currentStore) {
        var isPush = true;
        cachedStore.queryStaticDataCondintion["noRelatedDataTotalCount"] = currentStore.totalCount;
        if (currentStore.totalCount === 0) {
            cachedStore.queryStaticDataCondintion["noRelatedDataTotalCount"] = 1;
            currentStore.totalCount = 1;
        }
        cachedStore.queryStaticDataCondintion["currentPage"] = currentStore.currentPage;
        if (!Ext.isEmpty(cachedStore.queryStaticDataCondintion["queryRecord"])) {
            var tempObj = {
                relatedDataTotalCount: cachedStore.queryStaticDataCondintion["noRelatedDataTotalCount"],
                data: currentStore.getRange()
            },
            tempObjP = {
                currentPage: cachedStore.queryStaticDataCondintion["currentPage"],
                queryRecord: cachedStore.queryStaticDataCondintion["queryRecord"],
                cachedPageData: tempObj
            };
            if (!Ext.isEmpty(cachedStore.relationStaticDataArry)) {
                Ext.each(cachedStore.relationStaticDataArry, function (obj, index) {
                    if (obj["currentPage"] === tempObjP["currentPage"]
                         && obj["queryRecord"] === tempObjP["queryRecord"]) {
                        isPush = false;
                        //  console.log("dynamicStore queryRecord");
                        Ext.Array.replace(cachedStore.relationStaticDataArry, index, 1, [tempObjP]);
                    }
                });
                if (isPush) {
                    cachedStore.relationStaticDataArry.push(tempObjP);
                }
            } else {
                cachedStore.relationStaticDataArry.push(tempObjP);
            }
        } else {
            cachedStore.noRelationStaticDataObj[currentStore.currentPage] = currentStore.getRange();
        }
    }
});
