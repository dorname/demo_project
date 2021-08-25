/**
 * 重写Extjs原生组件使其符合RS10规范及做相应定制化
 */
(function() {
    Ext.require([
		'Rs.ext.overrides.field.Text',
		'Rs.ext.window.MessageAlert',
		'Rs.ext.util.Marker',
		'Rs.ext.overrides.PagingToolbar'
	]);
	
	var man = Ext.manifest, locale = man.locale;
	Ext.Loader.loadScript({
		url: man.paths['Rs.ext'] + '/../locale/' + locale + '/rs-ext-locale-' + locale + '.js'
	});
}());
