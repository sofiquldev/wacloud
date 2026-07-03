<?php

/**
 * CMS content catalog for nav pickers and validation.
 * Keep slugs in sync with resources/js/data/adminDummyData.js (INITIAL_PAGES, INITIAL_SERVICES).
 */
return [
    'pages' => [
        ['id' => 1, 'title' => 'About Pourashava', 'slug' => 'about'],
        ['id' => 2, 'title' => 'Council & Committees', 'slug' => 'council'],
        ['id' => 3, 'title' => 'Privacy Policy', 'slug' => 'privacy'],
        ['id' => 4, 'title' => 'Contact Us', 'slug' => 'contact'],
    ],
    'services' => [
        ['id' => 1, 'title' => 'Birth Registration', 'slug' => 'birth'],
        ['id' => 6, 'title' => 'Death Registration', 'slug' => 'death'],
        ['id' => 2, 'title' => 'Holding Tax', 'slug' => 'tax'],
        ['id' => 3, 'title' => 'Trade License', 'slug' => 'trade-license'],
        ['id' => 5, 'title' => 'Water Billing', 'slug' => 'water'],
        ['id' => 4, 'title' => 'Building Approval', 'slug' => 'building'],
    ],
];
