<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Facades\App;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    protected $casts = [
        'value' => 'string',
    ];

    public function translations(): MorphMany
    {
        return $this->morphMany(Translation::class, 'translatable');
    }

    public function translation(): MorphOne
    {
        return $this->morphOne(Translation::class, 'translatable')
            ->where('language', App::getLocale());
    }

    public function getValueAttribute(?string $value): ?string
    {
        if (!empty($value)) {
            return $value;
        }

        return $this->translation?->text;
    }

    /**
     * Возвращает массив всех переводов в формате ['ru' => 'Текст', 'en' => 'Text']
     */
    public function getTranslationsArrayAttribute(): array
    {
        return $this->translations->pluck('text', 'language')->toArray();
    }
}