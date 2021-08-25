Ext.define('Rs.ext.toolbar.FormPaging', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'formpagingtoolbar',

    alternateClassName: 'Ext.FormPagingToolbar',
    requires: [
        'Ext.toolbar.TextItem'
    ],

    displayInfo: true,
    prependButtons: true,

    initComponent: function () {
        var me = this,
        userItems = me.items || me.buttons || [],
        pagingItems;

        pagingItems = me.getPagingItems();

        if (me.prependButtons) {
            me.items = userItems.concat(pagingItems);
        } else {
            me.items = pagingItems.concat(userItems);
        }
        me.callParent();
    },
    getPagingItems: function () {
        var me = this,
        inputListeners = {
            scope: me,
            blur: me.onPagingBlur
        };

        inputListeners[Ext.supports.SpecialKeyDownRepeat ? 'keydown' : 'keypress'] =
            me.onPagingKeyDown;

        return ['->', {
                itemId: 'prev',
                iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
                disabled: false,
                handler: me.movePrevious,
                scope: me
            }, {
                disabled: true,
                width: 30
            }, {
                itemId: 'next',
                iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
                disabled: false,
                handler: me.moveNext,
                scope: me
            },  {
                disabled: true,
                width: 50
            },{
                itemId: 'add',
                iconCls: 'addAction-button-item',
                disabled: false,
                handler: me.addRecord,
                scope: me
            }, {
                disabled: true,
                width: 50
            },{
                itemId: 'delete',
                iconCls: 'deleteAction1-button-item',
                disabled: false,
                handler: me.removeRecord,
                scope: me
            },{
                disabled: true,
                width: 50
            }
        ];
    },
    addRecord: function () {
        var me = this,
        formPanel = me.up();
        formPanel.addNewRecord();

    },
    removeRecord: function () {
        var me = this,
        formPanel = me.up();
        formPanel.removeRecord();
    },
    movePrevious: function () {
        var me = this,
        formPanel = me.up();
        if (formPanel.page === 0 || Ext.isEmpty(formPanel.page)) {
            return false;
        }
        formPanel.page = formPanel.page - 1;
        //var formRecordData = Ext.getStore(formPanel.store).getAt(formPanel.page);
        var items = formPanel.items.items;
        Ext.each(items, function (item) {
            item.setValue();
        });
        var loadRecord = Ext.getStore(formPanel.store).data.items[formPanel.page];
        if (Ext.isEmpty(loadRecord)) {
            formPanel.page += 1;
            return false;
        }
        formPanel.loadRecord(loadRecord);
    },
    moveNext: function () {
        var me = this,
        formPanel = me.up();
        if (Ext.isEmpty(formPanel.page) || Ext.getStore(formPanel.store).data.length === 0 || formPanel.page === Ext.getStore(formPanel.store).data.length - 1) {
            //if(formPanel.insertFlag){
            //    formPanel.page+=1;
            //    formPanel.addNewRecord();
            //}
            return false;
        }
        formPanel.page = formPanel.page + 1;
        var formRecordData = Ext.getStore(formPanel.store).data.items[formPanel.page];
        //var formRecordData = Ext.getStore(formPanel.store).getAt(formPanel.page);
        var items = formPanel.items.items;
        Ext.each(items, function (item) {
            item.setValue();
        });
        formPanel.loadRecord(formRecordData);
    }
});
