<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php($site = $page['props']['site'] ?? null)
        @php($fav = is_array($site ?? null) ? ($site['faviconUrl'] ?? null) : null)
        @if(! empty($fav))
            <link rel="icon" href="{{ e($fav) }}">
        @endif

        @php($seo = $page['props']['seo'] ?? [])
        @if(! empty($seo['description']))
            <meta name="description" content="{{ e($seo['description']) }}">
        @endif
        @if(! empty($seo['keywords']))
            <meta name="keywords" content="{{ e($seo['keywords']) }}">
        @endif
        @if(! empty($seo['canonical']))
            <link rel="canonical" href="{{ e($seo['canonical']) }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
