
/**
 * 重写Extjs原生组件使其符合RS10规范及做相应定制化
 */
(function() {
	Ext.apply(Ext.ns('Rs'), {
		LANG: 'zh',
		DECIMALS: {}
	});
		
    Ext.syncRequire([
		'Rs.ext.overrides.Component',
		'Rs.ext.overrides.form.field.Text',
		'Rs.ext.overrides.data.Store',
		'Rs.ext.overrides.data.Model',
		'Rs.ext.overrides.panel.Panel',
		'Rs.ext.overrides.grid.CellEditor',
		'Rs.ext.overrides.grid.column.Number',
		'Rs.ext.window.MessageAlert',
		'Rs.ext.util.Marker'
    ]);	
	
	var man = Ext.manifest, locale = man.locale || 'zh_CN';
	Ext.Loader.loadScript({
		//url: man.paths['Rs.ext'] + '/../locale/' + locale + '/rs-ext-locale-' + locale + '.js'
		url: '/packages/local/rs-ext-classic/locale/' + locale + '/rs-ext-locale-' + locale + '.js'
	});
}());
