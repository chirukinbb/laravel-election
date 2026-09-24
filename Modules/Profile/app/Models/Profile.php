<?php

namespace Modules\Profile\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    protected $fillable = ['user_id', 'name', 'languages', 'bio', 'avatar_url'];

    protected $casts = [
        'languages' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function languages()
    {
        return collect($this->languages)->map(fn($iso) => config('users.languages.' . $iso))->join(', ');
    }
}