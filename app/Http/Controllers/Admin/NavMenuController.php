<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\CmsContentCatalog;
use App\Support\NavMenuRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class NavMenuController extends Controller
{
    public function index(NavMenuRepository $menus, CmsContentCatalog $catalog): Response
    {
        $doc = $menus->loadDocument();

        return Inertia::render('Admin/Menus', [
            'items' => $doc['items'],
            'pages' => $catalog->pages(),
            'services' => $catalog->services(),
            'systemOptions' => config('cms_nav.system'),
            'storageWritable' => Schema::hasTable('cms_settings') || is_writable(storage_path('app')),
        ]);
    }

    public function update(Request $request, NavMenuRepository $menus): RedirectResponse
    {
        $items = $request->input('items');
        if (! is_array($items)) {
            return back()->withErrors(['items' => 'Invalid menu payload.']);
        }

        try {
            $menus->saveItems($items);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Throwable $e) {
            report($e);

            return back()->withErrors([
                'menu' => 'Could not save the menu. If the database is unavailable, ensure storage/app is writable; otherwise check application logs.',
            ]);
        }

        return redirect()->route('admin.menus.index')->with('status', 'Menu saved.');
    }
}
