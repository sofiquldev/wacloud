<?php

/**
 * Shared taxonomies for admin UI and Inertia props.
 * Keep in sync with defaults in resources/js/data/adminDummyData.js when extending.
 */
return [
    'designations' => [
        'Mayor',
        'Panel Mayor (1)',
        'Panel Mayor (2)',
        'Councilor',
        'Reserved Councilor',
        'Chief Executive Officer',
        'Secretary',
        'Engineer',
    ],
    'wards' => [
        'Pourashava (city-wide)',
        'Ward 01',
        'Ward 02',
        'Ward 03',
        'Ward 04',
        'Ward 05',
        'Ward 06',
        'Ward 07',
        'Ward 08',
        'Ward 09',
        'Ward 1-2-3 (Reserved)',
        'Ward 4-5-6 (Reserved)',
        'Ward 7-8-9 (Reserved)',
    ],
    'sessions' => [
        ['id' => 's-2024', 'label' => '2024 — 2029 (6th Election)', 'current' => true],
        ['id' => 's-2019', 'label' => '2019 — 2024 (5th Election)', 'current' => false],
        ['id' => 's-2014', 'label' => '2014 — 2019 (4th Election)', 'current' => false],
        ['id' => 's-2009', 'label' => '2009 — 2014 (3rd Election)', 'current' => false],
    ],
    'pageCategories' => ['About', 'Council', 'Legal', 'Contact', 'News'],
    'serviceCategories' => [
        'Citizen Records',
        'Revenue',
        'Engineering',
        'Utilities',
        'Health',
    ],
    'noticeCategories' => [
        'Administration',
        'Engineering',
        'Health',
        'Revenue',
        'Sanitation',
    ],
    'complaintCategories' => [
        'All',
        'Drainage',
        'Electricity',
        'Sanitation',
        'Roads',
        'Water',
    ],
    'complaintWards' => [
        'All',
        'Ward 01',
        'Ward 02',
        'Ward 03',
        'Ward 05',
        'Ward 07',
    ],
];
