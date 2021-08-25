Ext.define('Rs.ext.overrides.form.field.Text', {
    override: 'Ext.form.field.Text',    
    /**
     * 目前针对已知情况只过滤的英文字符中' 单引号
     */
    maskRe: new RegExp('[^\']'),
    stripCharsRe: new RegExp('[\']', 'gi')
});
