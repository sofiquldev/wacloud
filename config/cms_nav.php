<?php

/**
 * Built-in (system) destinations for the main nav. Paths can be upgraded when public routes exist.
 */
return [
    'system' => [
        ['key' => 'home', 'label' => 'Home', 'path' => '/', 'implemented' => true],
        ['key' => 'notices', 'label' => 'Notices', 'path' => '/notices', 'implemented' => false],
        ['key' => 'services', 'label' => 'Services directory', 'path' => '/services', 'implemented' => false],
        ['key' => 'members', 'label' => 'Members', 'path' => '/members', 'implemented' => false],
        ['key' => 'events', 'label' => 'Events', 'path' => '/events', 'implemented' => false],
        ['key' => 'gallery', 'label' => 'Gallery', 'path' => '/gallery', 'implemented' => false],
        ['key' => 'tenders', 'label' => 'Tenders', 'path' => '/tenders', 'implemented' => false],
        ['key' => 'complaints', 'label' => 'Complaints', 'path' => '/complaints', 'implemented' => false],
    ],
];
