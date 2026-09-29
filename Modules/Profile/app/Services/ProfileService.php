<?php

namespace Modules\Profile\Services;

use App\Models\User;

class ProfileService
{
    public function __construct(private User $user)
    {
    }

    public function update(array $data)
    {
        if (isset($data['avatar'])) {
            $data['avatar_url'] = asset($data['avatar']->store('avatars', 'public'));
            unset($data['avatar']);
        }

        $this->user->profile->update($data);
    }
}