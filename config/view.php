<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Most templating systems load templates from disk. Here you may specify
    | an array of paths that should be checked for your views. Of course, the
    | usual Laravel view path has already been registered for you.
    |
    */

    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    |
    | Use storage_path() only (not realpath): on fresh deploys the directory
    | may not exist yet; realpath() returns false and breaks view:clear /
    | optimize:clear when storage/framework/views was not uploaded (e.g. FTP
    | excludes compiled blades).
    |
    | Use `env(...) ?: default` so an empty VIEW_COMPILED_PATH= in .env does not
    | wipe the default (that would trigger "Please provide a valid cache path").
    |
    */

    'compiled' => env('VIEW_COMPILED_PATH') ?: storage_path('framework/views'),

];
