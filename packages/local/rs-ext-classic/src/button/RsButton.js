/**
 * @class Rs.ext.button.RsButton
 * @extends Ext.button.Button
 * @author ZanShuangpeng
 * RsButton
 */
Ext.define('Rs.ext.button.RsButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.rsbutton',
	
	//_btnCls: Ext.baseCSSPrefix + 'btn-RsButton',
	//overCls: Ext.baseCSSPrefix + 'btn-RsOver',
	//_pressedCls: Ext.baseCSSPrefix + 'btn-RsPressed',
	
	initComponent: function() {
        var me = this;
			tempStyle={};
		tempStyle.background='linear-gradient(#e4f3ff 45%,#c3d9f3 50%,#c9dffa 90%,#d7ecff 95%)';
		tempStyle.borderColor='#aac8f1';
		me.style = Ext.Object.merge(tempStyle,me.style)
        // WAI-ARIA spec requires that menu buttons react to Space and Enter keys
        // by showing the menu while leaving focus on the button, and to Down Arrow key
        // by showing the menu and selecting first menu item. This behavior may conflict
        // with historical Ext JS menu button behavior if a handler or a click listener
        // is set on a button; in that case Space or Enter key would activate
        // the handler/click listener, and only Down Arrow key would open the menu.
        // To avoid the ambiguity, we check if the button has both menu *and* handler
        // or click event listener, and warn the developer in that case.
        // Note that this check does not apply to Split buttons because those now have
        // two tab stops and can effectively combine both menu and toggling/href/handler.
        //<debug>
        if (!me.isSplitButton && me.menu) {
            if (me.enableToggle || me.toggleGroup) {
                Ext.ariaWarn(
                    me,
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' behavior will conflict with " +
                    "toggling."
                );
            }
 
            if (me.href) {
                Ext.ariaWarn(
                    me,
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' cannot behave as a link."
                );
            }
 
            // Only check listeners of the component instance; there could be other
            // listeners on the EventBus inherited via hasListeners prototype.
            if (me.handler || me.hasListeners.hasOwnProperty('click')) {
                Ext.ariaWarn(
                    me,
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' should display the menu " +
                    "on SPACE and ENTER keys, which will conflict with the " +
                    "button handler."
                );
            }
        }
        //</debug>
		
        // Ensure no selection happens
        me.addCls(Ext.baseCSSPrefix + 'unselectable');
 
        me.callParent();
 
        if (me.menu) {
            // Flag that we'll have a splitCls
            me.split = true;
            me.setMenu(me.menu, /* destroyMenu */ false, true);
        }
 
        // Accept url as a synonym for href
        if (me.url) {
            me.href = me.url;
        }
 
        // preventDefault defaults to false for links
        me.configuredWithPreventDefault = me.hasOwnProperty('preventDefault');
 
        if (me.href && !me.configuredWithPreventDefault) {
            me.preventDefault = false;
        }
 
        if (Ext.isString(me.toggleGroup) && me.toggleGroup !== '') {
            me.enableToggle = true;
        }
 
        if (me.html && !me.text) {
            me.text = me.html;
            delete me.html;
        }
    },
	
	onMouseOver: function(e) {
        var me = this;
		me.el.dom.style.background='linear-gradient(#F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)';
		me.el.dom.style.borderColor='#7EA9E2';
        if (!me.disabled && !e.within(me.el, true, true)) {
            me.onMouseEnter(e);
        }
    },
	
	onMouseOut: function(e) {
        var me = this;
		me.el.dom.style.background='linear-gradient(#e4f3ff 45%,#c3d9f3 50%,#c9dffa 90%,#d7ecff 95%)';
		me.el.dom.style.borderColor='#aac8f1';
        if (!e.within(me.el, true, true)) {
            if (me.overMenuTrigger) {
                me.onMenuTriggerOut(e);
            }
 
            me.onMouseLeave(e);
        }
    },
	onMouseDown: function(e) {
        var me = this,
            activeEl;
		me.el.dom.style.background='linear-gradient(#BFD2E6 45%,#8DC0F5 50%,#98C5F5 90%,#C9DDF6 95%)';
		me.el.dom.style.borderColor='#99BBE8';
        if (Ext.isIE || Ext.isEdge || e.pointerType === 'touch') {
            // In IE the use of unselectable on the button's elements causes the element
            // to not receive focus, even when it is directly clicked.
            // On Touch devices, we need to explicitly focus on touchstart.
            if (me.deferFocusTimer) {
                Ext.undefer(me.deferFocusTimer);
            }
 
            activeEl = Ext.Element.getActiveElement();
 
            me.deferFocusTimer = Ext.defer(function() {
                var focusEl;
 
                me.deferFocusTimer = null;
 
                // We can't proceed if we've been destroyed, or the app has since controlled
                // the focus, or if we are no longer focusable.
                if (me.destroying || me.destroyed ||
                    (Ext.Element.getActiveElement() !== activeEl) || !me.canFocus()) {
                    return;
                }
 
                focusEl = me.getFocusEl();
 
                // Deferred to give other mousedown handlers the chance to preventDefault
                if (focusEl && !e.defaultPrevented) {
                    focusEl.focus();
                }
            }, 1);
        }
 
        if (!me.disabled && e.button === 0) {
            Ext.button.Manager.onButtonMousedown(me, e);
            me.removeCls(me._arrowPressedCls);
            me.addCls(me._pressedCls);
        }
    },
	onMouseUp: function(e) {
        var me = this;
		me.el.dom.style.background='linear-gradient(#F4FAFF 45%,#D2E2F7 50%,#D2E2F7 90%,#F4FAFF 95%)';
		me.el.dom.style.borderColor='#aac8f1';
        // If the external mouseup listener of the ButtonManager fires after the button
        // has been destroyed, ignore.
        if (!me.destroyed && e.button === 0) {
            if (!me.pressed) {
                me.removeCls(me._pressedCls);
            }
        }
    }
});
