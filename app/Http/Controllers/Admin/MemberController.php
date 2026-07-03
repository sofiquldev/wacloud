<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMemberRequest;
use App\Http\Requests\Admin\UpdateMemberRequest;
use App\Models\Member;
use App\Support\DefaultMemberPhoto;
use App\Support\MemberPhotoStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Members');
    }

    public function store(StoreMemberRequest $request, MemberPhotoStorage $photos): RedirectResponse
    {
        $data = $request->validated();
        $member = new Member();
        $this->fillMemberFromValidated($member, $data);
        $member->save();
        $this->applyMemberPhoto($request, $member, $data['photoUrl'] ?? null, $photos);
        if ($member->isDirty('photo_path')) {
            $member->save();
        }

        return redirect()->route('admin.members.index')->with('status', 'member-created');
    }

    public function update(UpdateMemberRequest $request, Member $member, MemberPhotoStorage $photos): RedirectResponse
    {
        $data = $request->validated();
        $this->fillMemberFromValidated($member, $data);
        $member->save();
        $this->applyMemberPhoto($request, $member, $data['photoUrl'] ?? null, $photos);
        if ($member->isDirty('photo_path')) {
            $member->save();
        }

        return redirect()->route('admin.members.index')->with('status', 'member-updated');
    }

    public function destroy(Member $member, MemberPhotoStorage $photos): RedirectResponse
    {
        $photos->delete($member->photo_path);
        $member->delete();

        return redirect()->route('admin.members.index')->with('status', 'member-deleted');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function fillMemberFromValidated(Member $member, array $data): void
    {
        $member->fill([
            'name' => $data['name'],
            'designation' => $data['designation'],
            'ward' => $data['ward'] ?? null,
            'session_id' => $data['sessionId'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'status' => $data['status'],
            'public_message' => isset($data['publicMessage']) && trim((string) $data['publicMessage']) !== ''
                ? trim((string) $data['publicMessage'])
                : null,
            'party' => $data['party'] ?? null,
        ]);
    }

    private function applyMemberPhoto(
        Request $request,
        Member $member,
        ?string $photoUrl,
        MemberPhotoStorage $photos,
    ): void {
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            if ($file !== null) {
                $photos->delete($member->photo_path);
                $stored = $photos->storeUpload($member, $file);
                if ($stored !== '') {
                    $member->photo_path = $stored;
                }
            }

            return;
        }

        if ($photoUrl === null) {
            return;
        }

        if ($photoUrl === '') {
            $photos->delete($member->photo_path);
            $member->photo_path = null;

            return;
        }

        if (
            $photoUrl === DefaultMemberPhoto::url()
            || str_starts_with($photoUrl, 'http://')
            || str_starts_with($photoUrl, 'https://')
            || str_starts_with($photoUrl, '/storage/')
            || str_starts_with($photoUrl, '/'.MemberPhotoStorage::PUBLIC_SUBDIR.'/')
        ) {
            return;
        }

        if (preg_match('#^data:image/#i', $photoUrl)) {
            $stored = $photos->storeBase64($member, $photoUrl);
            if ($stored !== null) {
                $photos->delete($member->photo_path);
                $member->photo_path = $stored;
            }
        }
    }
}
