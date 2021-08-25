/**
 * The Paging Toolbar is a specialized toolbar that is
 * bound to a `Ext.data.Store` and provides automatic paging control.
 *
 * ```javascript
 * @example({ framework: 'extjs' })
 * var store = Ext.create('Ext.data.Store', {
 *     fields: ['fname', 'lname', 'talent'],
 *     pageSize: 3,
 *     data: [
 *         { 'fname': 'Barry',  'lname': 'Allen',      'talent': 'Speedster' },
 *         { 'fname': 'Oliver', 'lname': 'Queen',      'talent': 'Archery'  },
 *         { 'fname': 'Kara',   'lname': 'Zor-El',     'talent': 'All'  },
 *         { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert'  },
 *         { 'fname': 'Hal',    'lname': 'Jordan',     'talent': 'Willpower'  },
 *     ]
 * });
 *
 * Ext.create('Ext.grid.Grid', {
 *     title: 'DC Personnel',
 *
 *     store: store,
 *     plugins: {
 *         pagingtoolbar: true
 *     },
 *
 *     columns: [
 *         { text: 'First Name', dataIndex: 'fname',  flex: 1 },
 *         { text: 'Last Name',  dataIndex: 'lname',  flex: 1 },
 *         { text: 'Talent',     dataIndex: 'talent', flex: 1 }
 *     ],
 *
 *     height: 230,
 *     layout: 'fit',
 *     fullscreen: true
 * });
 * ```
 * ```html
 * @example({framework: 'ext-web-components', packages:['ext-web-components'], tab: 1 })
 * <ext-container width="100%" height="100%">
 *     <ext-grid
 *         shadow="true"
 *         height="275"
 *         plugins='["pagingtoolbar"]'
 *         onready="paginggrid.onGridReady"
 *     >
 *         <ext-column text="First Name" dataIndex="fname" flex="1" editable="true"></ext-column>
 *         <ext-column text="Last Name" dataIndex="lname" flex="1" editable="true"></ext-column>
 *         <ext-column text="Talent" dataIndex="talent" flex="1" editable="true"></ext-column>
 *     </ext-grid>
 * </ext-container>
 * ```
 * ```javascript
 * @example({framework: 'ext-web-components', tab: 2, packages: ['ext-web-components']})
 * import '@sencha/ext-web-components/dist/ext-container.component';
 * import '@sencha/ext-web-components/dist/ext-grid.component';
 * import '@sencha/ext-web-components/dist/ext-column.component';
 *
 * Ext.require('Ext.grid.plugin.PagingToolbar');
 *
 * export default class PagingGridComponent {
 *     constructor() {
 *        this.store = new Ext.data.Store({
 *           pageSize: 3,
 *           data: [
 *               { 'fname': 'Barry',  'lname': 'Allen', 'talent': 'Speedster'},
 *               { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery'},
 *               { 'fname': 'Kara',   'lname': 'Zor-El', 'talent': 'All'},
 *               { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert'},
 *               { 'fname': 'Hal',    'lname': 'Jordan', 'talent': 'Willpower'  }
 *           ]
 *        });
 *     }
 *
 *     onGridReady(event) {
 *         this.pagingGridCmp = event.detail.cmp;
 *         this.pagingGridCmp.setStore(this.store);
 *     }
 * }
 * window.paginggrid = new PagingGridComponent();
 * ```
 * ```javascript
 * @example({framework: 'ext-react', packages:['ext-react']})
 * import React, { Component } from 'react'
 * import { ExtGrid, ExtColumn } from '@sencha/ext-react';
 *
 * Ext.require('Ext.grid.plugin.PagingToolbar');
 *
 * export default class MyExample extends Component {
 *
 *     store = new Ext.data.Store({
 *         pageSize: 3,
 *         data: [
 *             { 'fname': 'Barry',  'lname': 'Allen', 'talent': 'Speedster'},
 *             { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery'},
 *             { 'fname': 'Kara',   'lname': 'Zor-El', 'talent': 'All'},
 *             { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert'},
 *             { 'fname': 'Hal',    'lname': 'Jordan', 'talent': 'Willpower'  }
 *         ]
 *     });
 *
 *    render() {
 *        return (
 *            <ExtGrid
 *                height="180"
 *                store={this.store}
 *                plugins={['pagingtoolbar']}
 *            >
 *                <ExtColumn
 *                    text="First Name"
 *                    dataIndex="fname"
 *                    flex={1}
 *                />
 *                <ExtColumn
 *                    text="Last Name"
 *                    dataIndex="lname"
 *                    flex={1}
 *                />
 *                <ExtColumn
 *                    text="Talent"
 *                    dataIndex="talent"
 *                    flex={1}
 *                />
 *            </ExtGrid>
 *        )
 *    }
 * }
 * ```
 * ```javascript
 * @example({framework: 'ext-angular', packages:['ext-angular']})
 * import { Component } from '@angular/core'
 * declare var Ext: any;
 *
 * Ext.require('Ext.grid.plugin.PagingToolbar');
 * @Component({
 *     selector: 'app-root-1',
 *     styles: [`
 *             `],
 *     template: `
 *     <ExtContainer>
 *         <ExtGrid
 *             [height]="'180px'"
 *             [store]="this.store"
 *             [plugins]="['pagingtoolbar']"
 *         >
 *             <ExtColumn
 *                 text="First Name"
 *                 dataIndex="fname"
 *                 flex="1"
 *             ></ExtColumn>
 *             <ExtColumn
 *                 text="Last Name"
 *                 dataIndex="lname"
 *                 flex="1"
 *             ></ExtColumn>
 *             <ExtColumn
 *                 text="Talent"
 *                 dataIndex="talent"
 *                 flex="1"
 *             >
 *             </ExtColumn>
 *         </ExtGrid>
 *     </ExtContainer>
 *     `
 * })
 * export class AppComponent {
 *     store = new Ext.data.Store({
 *         pageSize: 3,
 *         data: [
 *             { 'fname': 'Barry',  'lname': 'Allen', 'talent': 'Speedster'},
 *             { 'fname': 'Oliver', 'lname': 'Queen', 'talent': 'Archery'},
 *             { 'fname': 'Kara',   'lname': 'Zor-El', 'talent': 'All'},
 *             { 'fname': 'Helena', 'lname': 'Bertinelli', 'talent': 'Weapons Expert'},
 *             { 'fname': 'Hal',    'lname': 'Jordan', 'talent': 'Willpower'  }
 *         ]
 *     });
 * }
 * ```
 */
Ext.define('Rs.ext.overrides.PagingToolbar', {
    override: 'Ext.grid.plugin.PagingToolbar',
    /**
     * @private
     */
    getPageData: function () {
        var grid = this.getGrid(),
        store = grid.getStore(),
		totalCount,
        pageSize = this.getLoadPages() ? store.pageSize : grid.visibleCount,
        pageCount;
        if (store.isCachedStore) {
            if (Ext.isEmpty(store.getRelationStaticDataArry())) {
                store.totalCount = store.queryStaticDataCondintion["noRelatedDataTotalCount"];
            } else {
                var arr = store.getRelationStaticDataArry();
                Ext.each(arr, function (recordObj, index, array) {
                    var tempRecord = recordObj.cachedPageData;
                    if (recordObj["currentPage"] === store.currentPage
                         && recordObj["queryRecord"] === store.queryStaticDataCondintion["queryRecord"]) {
                        if (recordObj["queryRecord"].phantom) {
                            store.totalCount = tempRecord["data"].length;
                        } else {
                            store.totalCount = tempRecord["relatedDataTotalCount"];
                        }
                    }
                });

            }
        }
		totalCount = store.getTotalCount();
        pageCount = Math.ceil(totalCount / pageSize);

        return {
            totalCount: totalCount,
            totalPages: Ext.Number.isFinite(pageCount) ? pageCount : 1,
            currentPage: store.currentPage,
            pageSize: pageSize
        };
    },

    checkPageChange: function () {
        var me = this,
        grid = me.getGrid(),
        pageSize = me.getPageSize(),
        currentPage = me.getCurrentPage(),
        topVisibleIndex = grid.topVisibleIndex,
        // on the first page topVisibleIndex is 0
        newPage = Math.ceil((topVisibleIndex + pageSize) / pageSize);

        if (grid.getStore() && !me.getLoadPages() && newPage > 0 && newPage !== currentPage) {
            me.preventGridScroll = true;
            me.setCurrentPage(newPage);
            me.preventGridScroll = false;
        }
    },

    updateBuffer: function (buffer) {
        var me = this,
        bufferTask = me.bufferTask;

        if (Ext.isNumber(buffer)) {
            me.bufferTask = bufferTask || new Ext.util.DelayedTask(me.bufferTaskRun, me);
            me.cancelBufferTask();
        } else if (bufferTask) {
            bufferTask.cancel();
            me.bufferTask = null;
        }
    },

    cancelBufferTask: function () {
        if (this.bufferTask) {
            this.bufferTask.cancel();
        }
    },

    loadCurrentPage: function () {
        this.getGrid().getStore().loadPage(this.getCurrentPage());
    },

    bufferTaskRun: function () {
        this.loadCurrentPage();
    },

    applyToolbar: function (toolbar, oldToolbar) {
        return Ext.factory(toolbar, Ext.Toolbar, oldToolbar);
    },

    updateToolbar: function (toolbar) {
        var me = this;

        if (toolbar) {
            toolbar.getSliderField().on({
                change: 'onPageChange',
                dragstart: 'onPageSliderDrag',
                drag: 'onPageSliderDrag',
                dragend: 'onPageSliderDragEnd',
                scope: me
            });

            toolbar.getNextButton().on({
                tap: 'onNextPageTap',
                scope: me
            });

            toolbar.getPrevButton().on({
                tap: 'onPreviousPageTap',
                scope: me
            });
        }
    },

    onPageChange: function (field, value) {
        this.setCurrentPage(value);
    },

    onPageSliderDrag: function (field, slider, value) {
        this.isDragging = true;
        this.setCurrentPage(Ext.isArray(value) ? value[0] : value);
    },

    onPageSliderDragEnd: function () {
        var me = this;

        me.isDragging = false;

        if (me.getBuffer() === 'dragend' || me.bufferTask.Id) {
            me.cancelBufferTask();
            me.loadCurrentPage();
        }
    },

    onNextPageTap: function () {
        var nextPage = this.getCurrentPage() + 1;

        if (nextPage <= this.getTotalPages()) {
            this.setCurrentPage(nextPage);
        }
    },

    onPreviousPageTap: function () {
        var previousPage = this.getCurrentPage() - 1;

        if (previousPage > 0) {
            this.setCurrentPage(previousPage);
        }
    },

    onTotalCountChange: function (store) {
        var me = this,
        data = me.getPageData();
        me.bulkConfigs = true;
        me.setConfig(data);
        me.bulkConfigs = false;
        me.syncSummary();
    },

    onUpdateVisibleCount: function (grid, visibleCount) {
        var store = grid.getStore(),
        totalCount;

        if (store && !this.getLoadPages()) {
            visibleCount -= 1;
            this.setPageSize(visibleCount);
			/*
            if (store.isCachedStore) {
                if (Ext.isEmpty(store.getRelationStaticDataArry())) {
                    store.totalCount = store.queryStaticDataCondintion["noRelatedDataTotalCount"];
                } else {
                    var arr = store.getRelationStaticDataArry();
                    Ext.each(arr, function (recordObj, index, array) {
                        var tempRecord = recordObj.cachedPageData;
                        if (recordObj["currentPage"] === store.currentPage
                             && recordObj["queryRecord"] === store.queryStaticDataCondintion["queryRecord"]) {
                            if (recordObj["queryRecord"].phantom) {
                                store.totalCount = tempRecord["data"].length;
                            } else {
                                store.totalCount = tempRecord["relatedDataTotalCount"];
                            }
                        }
                    });

                }
            }*/
			totalCount = store.getTotalCount();
			 if (store.isCachedStore) {
                if (Ext.isEmpty(store.getRelationStaticDataArry())) {
                   totalCount = store.queryStaticDataCondintion["noRelatedDataTotalCount"];
                } else {
                    var arr = store.getRelationStaticDataArry();
                    Ext.each(arr, function (recordObj, index, array) {
                        var tempRecord = recordObj.cachedPageData;
                        if (recordObj["currentPage"] === store.currentPage
                             && recordObj["queryRecord"] === store.queryStaticDataCondintion["queryRecord"]) {
                            if (recordObj["queryRecord"].phantom) {
                                totalCount = tempRecord["data"].length;
                            } else {
                                totalCount = tempRecord["relatedDataTotalCount"];
                            }
                        }
                    });

                }
            }
            this.setTotalPages(Math.ceil(totalCount / visibleCount));
        }
    },

    updateTotalPages: function () {
        if (!this.isConfiguring) {
            this.syncSummary();
        }
    },

    updateCurrentPage: function (page) {
        var me = this,
        isDragging = me.isDragging,
        bufferTask = me.bufferTask,
        buffer = me.getBuffer();

        if (!me.isConfiguring) {
            if (me.getLoadPages()) {
                if (bufferTask && Ext.isNumber(buffer) && isDragging) {
                    bufferTask.delay(buffer);
                } else if (buffer !== 'dragend' || !isDragging) {
                    me.getGrid().getStore().loadPage(page);
                }
            } else {
                me.syncSummary();
            }
        }
    },

    updateTotalCount: function (totalCount) {
        if (!this.isConfiguring) {
            this.syncSummary();
        }
    },

    getPageTopRecord: function (page) {
        var grid = this.getGrid(),
        store = grid && grid.getStore(),
        pageSize = this.getPageSize(),
        pageTopRecordIndex = (page - 1) * pageSize;

        return store && store.getAt(pageTopRecordIndex);
    },

    privates: {
        syncSummary: function () {
            var me = this,
            grid = me.getGrid(),
            toolbar = me.getToolbar(),
            sliderField = toolbar.getSliderField(),
            currentPage = me.getCurrentPage(),
            totalPages = me.getTotalPages(),
            pageTopRecord;

            if (me.bulkConfigs) {
                return;
            }

            // TODO: Calling setHtml causes a performance issue while live scrolling,
            // this might be worth looking into.
            toolbar.getSummaryComponent().element.dom.innerHTML = currentPage + ' / ' + totalPages;

            sliderField.setMaxValue(totalPages || 1);
            sliderField.setValue(currentPage);
            sliderField.setDisabled(totalPages <= 1);

            pageTopRecord = me.getPageTopRecord(currentPage);

            if (grid && !me.preventGridScroll && pageTopRecord) {
                grid.scrollToRecord(pageTopRecord);
            }

            toolbar.getNextButton().setDisabled(currentPage === totalPages);
            toolbar.getPrevButton().setDisabled(currentPage === 1);
        }
    }
});
