<?php

namespace App\Services;

use App\Enums\SettingKeyEnum;
use App\Models\Setting;

class SettingsService
{
    private array $settings = [];

    public function __construct(bool $isFull)
    {
        $this->loadSettings($isFull);
    }

    private function loadSettings(bool $isFull): void
    {
        foreach (SettingKeyEnum::cases() as $keyEnum) {
            $setting = Setting::with('translations')->where('key', $keyEnum->key())->first();
            $value = $setting->value;

            if (isset($setting->translations_array)) {
                $value = $isFull ? $setting->translations_array : $setting->translations_array[app()->getLocale()];
            }

            $this->settings[$keyEnum->key()] = $value;
        }
    }

    public function get(\UnitEnum $key): string|array|null
    {
        return $this->settings[$key->key()] ?? null;
    }

    public function set(SettingKeyEnum $key, string|array $value): void
    {
        $setting = Setting::firstOrCreate(
            ['key' => $key->key()]
        );

        if (is_array($value)) {
            $setting->update(['value' => null]);

            foreach ($value as $locale => $text) {
                $setting->translations()->updateOrCreate(
                    ['language' => $locale],
                    ['text' => $text]
                );
            }
        } else {
            $setting->update(['value' => $value]);
        }

        $this->settings[$key->key()] = $value;
    }

    public function has(SettingKeyEnum $key): bool
    {
        return isset($this->settings[$key->key()]) && $this->settings[$key->key()] !== null;
    }

    public function all(): array
    {
        return $this->settings;
    }

    public function refresh(): void
    {
        $this->loadSettings(true);
    }
}
