<?php

namespace App\Services;

use App\Enums\SettingKeyEnum;
use App\Models\Setting;

class SettingsService
{
    private array $settings = [];

    public function __construct()
    {
        $this->loadSettings();
    }

    private function loadSettings(): void
    {
        foreach (SettingKeyEnum::cases() as $keyEnum) {
            $setting = Setting::where('key', $keyEnum->key())->first();
            $this->settings[$keyEnum->key()] = $setting?->value;
        }
    }

    public function get(SettingKeyEnum $key): ?string
    {
        return $this->settings[$key->key()] ?? null;
    }

    public function set(SettingKeyEnum $key, ?string $value): void
    {
        Setting::updateOrCreate(
            ['key' => $key->key()],
            ['value' => $value]
        );

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
        $this->loadSettings();
    }
}
