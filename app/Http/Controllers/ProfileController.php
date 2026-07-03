<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateCatalogTaxonomiesRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Support\CmsCatalogResolver;
use App\Support\SiteSettingsRepository;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'siteSettings' => app(SiteSettingsRepository::class)->forAdmin(),
        ]);
    }

    /**
     * Update public site appearance (branding, footer, favicon).
     */
    public function updateSiteAppearance(Request $request, SiteSettingsRepository $repo): RedirectResponse
    {
        $validated = $request->validate([
            'appTitleBn' => ['required', 'string', 'max:500'],
            'appTitleEn' => ['required', 'string', 'max:500'],
            'logoMode' => ['required', Rule::in(['builtin', 'image'])],
            'logoSealLine1' => ['nullable', 'string', 'max:32'],
            'logoSealLine2' => ['nullable', 'string', 'max:32'],
            'logoShowBanglaTitle' => ['sometimes', 'boolean'],
            'logoShowEnglishTitle' => ['sometimes', 'boolean'],
            'logoBuiltinPreset' => ['required', Rule::in(['official', 'classic'])],
            'logoShowTitles' => ['sometimes', 'boolean'],
            'logoAlign' => ['required', 'string', Rule::in(['left', 'center', 'right'])],
            'noticeTickerEnabled' => ['sometimes', 'boolean'],
            'footerIntroTitle' => ['required', 'string', 'max:200'],
            'footerIntroBody' => ['required', 'string', 'max:2000'],
            'footerAddress' => ['required', 'string', 'max:500'],
            'footerPhone' => ['required', 'string', 'max:120'],
            'footerEmail' => ['required', 'string', 'max:200'],
            'footerCreditLine' => ['required', 'string', 'max:300'],
            'footerCopyrightTemplate' => ['required', 'string', 'max:500'],
            'footerOrganizationShort' => ['required', 'string', 'max:200'],
            'logoImage' => ['nullable', 'file', 'max:5120', 'mimes:jpeg,jpg,png,webp,gif'],
            'favicon' => ['nullable', 'file', 'max:2048', 'mimes:png,ico,svg,webp,x-icon'],
            'removeLogoImage' => ['sometimes', 'boolean'],
            'removeFavicon' => ['sometimes', 'boolean'],
        ]);

        $data = $repo->load();

        $data['appTitleBn'] = $validated['appTitleBn'];
        $data['appTitleEn'] = $validated['appTitleEn'];
        $data['logoMode'] = $validated['logoMode'];
        $data['logoSealLine1'] = $validated['logoSealLine1'] ?? 'POURA';
        $data['logoSealLine2'] = $validated['logoSealLine2'] ?? 'SEAL';
        $data['logoShowBanglaTitle'] = $request->boolean('logoShowBanglaTitle');
        $data['logoShowEnglishTitle'] = $request->boolean('logoShowEnglishTitle');
        $data['logoBuiltinPreset'] = $validated['logoBuiltinPreset'];
        $data['logoShowTitles'] = $request->boolean('logoShowTitles');
        $data['logoAlign'] = $validated['logoAlign'];
        $data['noticeTickerEnabled'] = $request->boolean('noticeTickerEnabled');
        $data['footerIntroTitle'] = $validated['footerIntroTitle'];
        $data['footerIntroBody'] = $validated['footerIntroBody'];
        $data['footerAddress'] = $validated['footerAddress'];
        $data['footerPhone'] = $validated['footerPhone'];
        $data['footerEmail'] = $validated['footerEmail'];
        $data['footerCreditLine'] = $validated['footerCreditLine'];
        $data['footerCopyrightTemplate'] = $validated['footerCopyrightTemplate'];
        $data['footerOrganizationShort'] = $validated['footerOrganizationShort'];

        if ($request->boolean('removeLogoImage') && ! empty($data['logoImagePath'])) {
            Storage::disk('public')->delete($data['logoImagePath']);
            $data['logoImagePath'] = null;
        }

        if ($request->boolean('removeFavicon') && ! empty($data['faviconPath'])) {
            Storage::disk('public')->delete($data['faviconPath']);
            $data['faviconPath'] = null;
        }

        if ($request->hasFile('logoImage')) {
            if (! empty($data['logoImagePath'])) {
                Storage::disk('public')->delete($data['logoImagePath']);
            }
            $data['logoImagePath'] = $request->file('logoImage')->store('site', 'public');
        }

        if ($request->hasFile('favicon')) {
            if (! empty($data['faviconPath'])) {
                Storage::disk('public')->delete($data['faviconPath']);
            }
            $data['faviconPath'] = $request->file('favicon')->store('site', 'public');
        }

        try {
            $repo->save($data);
        } catch (\Throwable $e) {
            report($e);

            return Redirect::route('profile.edit')->withErrors([
                'site' => 'Could not save settings. Ensure storage/app is writable and run php artisan storage:link for uploads.',
            ]);
        }

        return Redirect::route('profile.edit')->with('status', 'Site appearance saved.');
    }

    /**
     * Update optional custom CSS / HTML for the public site (citizen-facing pages only).
     */
    public function updateSiteCustomCode(Request $request, SiteSettingsRepository $repo): RedirectResponse
    {
        $validated = $request->validate([
            'customHeadCss' => ['nullable', 'string', 'max:65535'],
            'customBodyJs' => ['nullable', 'string', 'max:65535'],
        ]);

        $data = $repo->load();
        $data['customHeadCss'] = $validated['customHeadCss'] ?? '';
        $data['customBodyJs'] = $validated['customBodyJs'] ?? '';

        try {
            $repo->save($data);
        } catch (\Throwable $e) {
            report($e);

            return Redirect::route('profile.edit')->withErrors([
                'custom_code' => 'Could not save custom code. Ensure storage/app is writable.',
            ]);
        }

        return Redirect::route('profile.edit')->with('status', 'Custom code saved.');
    }

    /**
     * Persist designations and ward labels (used by members, elections, filters).
     */
    public function updateCatalogTaxonomies(UpdateCatalogTaxonomiesRequest $request, CmsCatalogResolver $resolver): RedirectResponse
    {
        $validated = $request->validated();
        $designations = $resolver->normalizeStringList($validated['designations']);
        $wards = $resolver->normalizeStringList($validated['wards']);
        if ($designations === [] || $wards === []) {
            return Redirect::route('profile.edit')->withErrors([
                'designations' => 'At least one designation and one ward are required.',
            ]);
        }
        try {
            $resolver->saveTaxonomies($designations, $wards);
        } catch (\Throwable $e) {
            report($e);

            return Redirect::route('profile.edit')->withErrors([
                'designations' => 'Could not save taxonomies. Ensure the cms_settings table exists.',
            ]);
        }

        return Redirect::route('profile.edit')->with('status', 'Designations and wards saved.');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (filled($validated['password'] ?? null)) {
            $user->password = $validated['password'];
        }

        unset($validated['password'], $validated['password_confirmation']);

        if (! Schema::hasColumn($user->getTable(), 'phone')) {
            unset($validated['phone']);
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
