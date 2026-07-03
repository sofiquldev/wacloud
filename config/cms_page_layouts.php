<?php

/**
 * Page templates the admin can pick when creating a layout in /admin/templates.
 * Used by both Homepage and Inner page templates.
 */
return [
    'default' => 'content-right',

    'templates' => [
        [
            'id' => 'full',
            'label' => 'Full width',
            'description' => 'Single main column without sidebars.',
            'icon' => 'layout-template',
        ],
        [
            'id' => 'content-left',
            'label' => 'Left sidebar + content',
            'description' => 'Left rail with widgets, main article column on the right.',
            'icon' => 'panel-left',
        ],
        [
            'id' => 'content-right',
            'label' => 'Content + right sidebar',
            'description' => 'Main article column with a sticky right rail (profile, hotline, etc.).',
            'icon' => 'panel-right',
        ],
        [
            'id' => 'three-column',
            'label' => 'Left + content + right',
            'description' => 'Three-column homepage layout: left rail, main column, right rail.',
            'icon' => 'columns-3',
        ],
    ],
];
