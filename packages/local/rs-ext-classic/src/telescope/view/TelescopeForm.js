Ext.define('Rs.ext.telescope.view.TelescopeForm', {
    extend: 'Ext.form.Panel',

    layout: 'column',
	
	defaults: {
		margin: 4,
		minWidth: 100
	},
	
	mixins: [
		'Ext.util.StoreHolder'
    ],
	
	bodyPadding: 4,
	collapsible: true,
	titleCollapse: true,
	//animCollapse: false,
	
	onSpecialkey: function (field, e) {
		console.log('onEnterKey', this, field);
		var me = this;
		if (e.getKey() == e.ENTER) {
			me.doQuery();
		}
	},
	
	dockedItems: [{
		xtype: 'toolbar',
		dock: 'bottom',
		items: [{
			xtype: 'tbfill'
		}, {
			xtype: 'button',
			itemId: 'reset',
			text: '重置'
		}, '-', {
			xtype: 'button',
			itemId: 'query',
			text: '查询'
		}]
	}],

    initComponent: function () {
		this.callParent(arguments);
		var me = this, 
			toolbar = me.getDockedItems('toolbar')[0],
			reset = toolbar.child('#reset'),
			query = toolbar.child('#query');
		
		reset.handler = me.reset.bind(me, reset);
		query.handler = me.doQuery.bind(me, query);
    },
	
	setFields: function (fields) {
		var me = this;
		me.suspendLayout = true;
		me.removeAll();
		var toolbar = me.getDockedItems('toolbar')[0];
		if (Ext.isArray(fields) && fields.length) {
			Ext.each(fields, function (field, idx) {
				fields[idx] = field = Ext.create(Ext.apply(field, {
					xtype: 'textfield',
					columnWidth: 0.25
				}));
				me.mon(field, 'specialkey', me.onSpecialkey, me);
			});
			toolbar.show();
		} else {
			toolbar.hide();
		}
		me.suspendLayout = false;
		this.add(fields);
	},
	
	doQuery: function (btn) {
		var me = this,
			store = me.getStore(),
			values = me.getValues();
		me.fireEvent('query', values);
		store.loadPage(1);
	}
});