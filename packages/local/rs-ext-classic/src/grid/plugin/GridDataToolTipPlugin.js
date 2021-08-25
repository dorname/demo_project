	/**
	 * @Rs.ext.grid.plugin.GridDataToolTipPlugin
	 * @extends Ext.plugin.Abstract
	 * @author LiGuangqiao
	 * 单元格数据放大镜
	 */
Ext.define('Rs.ext.grid.plugin.GridDataToolTipPlugin',{
	extend:'Ext.plugin.Abstract',
	alias:'plugin.datatooltip',
	requires:'Ext.tip.ToolTip',
	configs:{
		fontSize:undefined,
		color:'',
		fontWeight:undefined
	},
	init:function(grid){
		var me = this;
		me.grid = grid;
		me.grid.on('afterrender',function(){
			 me.initDataToolTip(me.fontSize,me.fontWeight,me.color);
		});
	},
	initDataToolTip:function(size,weight,color){
		var me = this, 
		grid = me.grid,
		view = grid.getView(),
		tip = Ext.create('Ext.tip.ToolTip', {
			// The overall target element.
			target: view.el,
			// Each grid row causes its own separate show and hide.
			delegate: '.x-grid-cell-inner ',
			// Moving within the row should not hide the tip.
			trackMouse: true,
			// Render immediately so that tip.body can be referenced prior to the first show.
			renderTo: Ext.getBody(),
			listeners: {
				// Change content dynamically depending on which element triggered the show.
				beforeshow: function updateTipBody(tip) {
					//console.log(tip.triggerElement.innerText);
					//console.log(view.getRecord(tip.triggerElement));
					tip.update('<p style="font-size:'+size+'px;font-weight:'+weight+';color:'+color+';">'+tip.triggerElement.innerText+'</p>');
				}
			}
		});
	}
});