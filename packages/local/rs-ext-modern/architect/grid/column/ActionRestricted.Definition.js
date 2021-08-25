{
    classAlias: "widget.rs-action-column-restricted",
    className: "Rs.ext.grid.column.ActionRestricted",
    inherits: "Ext.grid.column.Column",
    autoName: "MyActionRestricted Column",

    toolbox: {
        name: "ActionRestricted Column",
        groups: ["Grids"],
        category: "Grid Columns"
    },
    configs: [{
            name: 'addDisabled',
            type: 'boolean',
            doc: '新增操作是否可用'
        }, {
            name: 'addHidden',
            type: 'boolean',
            doc: '是否隐藏新增操作'
        }, {
            name: 'addToolTip',
            type: 'string',
            doc: '新增操作提示'
        }, {
            name: 'addDefaultValue',
            type: 'object',
            doc: '新增行的默认值设置'
        }, {
            name: 'extraAddHandler',
            type: 'function',
            params: [{
                    "name": "addObj",
                    "type": "Ext.Object"
                }
            ],
            alternates: [{
                    "type": "string"
                }
            ],
            doc: '额外新增逻辑（不影响原有的新增逻辑）'
        }, {
            name: 'extraRemoveHandler',
            type: 'function',
            params: [{
                    "name": "removeObj",
                    "type": "Ext.Object"
                }
            ],
            alternates: [{
                    "type": "string"
                }
            ],
            doc: '额外删除逻辑（不影响原有的删除逻辑）'
        }, {
            name: 'addHandler',
            type: 'function',
            params: [{
                    "name": "addObj",
                    "type": "Ext.Object"
                }
            ],
            alternates: [{
                    "type": "string"
                }
            ],
            doc: '新增逻辑重定义'
        }, {
            name: 'deleteDisabled',
            type: 'boolean',
            doc: '删除操作是否可用'
        }, {
            name: 'deleteHidden',
            type: 'boolean',
            doc: '是否隐藏删除操作'
        }, {
            name: 'deleteToolTip',
            type: 'string',
            doc: '删除操作提示'
        }, {
            name: 'deleteHandler',
            type: 'function',
            params: [{
                    "name": "removeObj",
                    "type": "Ext.Object"
                }
            ],
            alternates: [{
                    "type": "string"
                }
            ],
            doc: '删除逻辑重定义'
        }
    ]
}
