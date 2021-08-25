Ext.define('Rs.ext.overrides.panel.Panel', {
    override: 'Ext.panel.Panel',

    initComponent: function () {
        var me = this;
        me.callParent();
        me.initPanelLanguage();
		me.initPanelDecimals();
    },

    initPanelLanguage: function (language) {
        var me = this;
		me.translate(Rs.LANG);
    },
	
	translate: function (lang) {
        var me = this, language = Ext.Component.getLanguage(me.id);
        Ext.Component.doTranslation(me, language, lang, true);
		me.callParent(arguments);
    },
	
	initPanelDecimals: function () {
		var me = this, decimals = Ext.Component.getDecimals(me.id);
		
		Ext.iterate(decimals, function (itemId, presicsion) {
			var comp = me.down('#' + itemId);
			//numbercolumn 特殊处理
			comp && (comp.decimalPrecision = presicsion);
		});
		
	}
});