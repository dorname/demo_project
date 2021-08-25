Ext.define('Rs.ext.overrides.field.Text', {
    override: 'Ext.field.Text',    
    /**
     * 目前针对已知情况只过滤的英文字符中' 单引号
     */
    maskRe: new RegExp('[^\']'),
    stripCharsRe: new RegExp('[\']', 'gi')
});
