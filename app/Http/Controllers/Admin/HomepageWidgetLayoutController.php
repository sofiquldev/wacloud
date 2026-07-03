<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateHomepageWidgetLayoutRequest;
use App\Support\HomepageWidgetLayoutRepository;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HomepageWidgetLayoutController extends Controller
{
    public function index(): Response
    {
        $layout = null;
        try {
            $layout = app(HomepageWidgetLayoutRepository::class)->load();
        } catch (\Throwable $e) {
            report($e);
        }

        return Inertia::render('Admin/Templates', [
            'widgetLayout' => $layout,
        ]);
    }

    public function update(UpdateHomepageWidgetLayoutRequest $request): RedirectResponse
    {
        app(HomepageWidgetLayoutRepository::class)->save($request->layoutPayload());

        return redirect()->route('admin.templates.index')->with('status', 'templates-saved');
    }
}
