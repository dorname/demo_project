Ext.define('Rs.ext.overrides.data.Store', {
    override: 'Ext.data.Store',
    /**
     *
     */
    checkBeforeLoad: true

    // PAGING METHODS
    /**
     * Loads a given 'page' of data by setting the start and limit values appropriately. Internally
     * this just causes a normal load operation, passing in calculated 'start' and 'limit' params.
     * @param {Number} page The number of the page to load.
     * @param {Object} [options] See options for {@link #method-load}.
     */
    /*loadPage: function(page, options) {
        var me = this,
            size = me.getPageSize();

        if(me.checkBeforeLoad && me.needsSync){
            Ext.Msg.show({
                title: '提示' ,
                msg: '存在未保存的数据,确定重新加载?',
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.QUESTION,
                fn: function(btn, text) {
                    me.un('beforeload' , me.beforeLoadCheckData , me);
                    if (btn == 'ok') {
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
                    }
                },
                scope: me
            });
            return;
        }
        me.currentPage = page;

        // Copy options into a new object so as not to mutate passed in objects
        options = Ext.apply({
            page: page,
            start: (page - 1) * size,
            limit: size,
            addRecords: !me.getClearOnPageLoad()
        }, options);

        me.read(options);
    }*/
});
