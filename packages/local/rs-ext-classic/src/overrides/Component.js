Ext.define('Rs.ext.overrides.Component', {
    override: 'Ext.Component',
	
    initComponent: function () {
        var me = this;
        me.callParent();
        me.initLanguage(Rs.LANG);
    },

    translations: {},

    initLanguage: function (lang) {
        var me = this;
        if (me.isContainer) { return; }
        me.translate(lang);
    },
	
    translate: function (lang) {
        var me = this;
        me.statics().doTranslation(me, me.translations, lang);
    }
}, function (Cls) {
    var Labels = [{
        name: 'button',
        func: 'setText'
    }, {
        name: 'field',
        func: 'setFieldLabel'
    }, {
        name: 'fieldcontainer',
        func: 'setFieldLabel'
    }, {
        name: 'panel',
        func: 'setTitle'
    }, {
        name: 'gridcolumn',
        func: 'setText'
    }];

    Cls.addStatics({
		getDecimals: function (id) {
			var decmals = Rs.DECIMALS || {};
			return decmals[id];
		},
		getLanguage: function (id) {
			var language = Rs.MULTILANGUAGE || {};
			return language[id];
		},
        doTranslation: function (cmp, items, lang, isItemId) {
            var prefix =  isItemId ? '#' : '';
            Ext.iterate(items, function (query, langs) {
                var item = query == '' ? cmp : cmp.down(prefix + query);
                if(!Ext.isEmpty(item)) {
                    Ext.each(Labels, function(label) {
                        if(item.isXType(label.name)) {
                            item[label.func](langs[lang]);
                            return false;
                        }
                    });
                }
            });
        }
    });
});