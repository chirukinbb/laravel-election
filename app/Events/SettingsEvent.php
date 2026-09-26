<?php

namespace App\Events;

use App\Enums\SettingKeyEnum;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Support\Collection;

class SettingsEvent
{
    use Dispatchable;

    private Collection $settings;

    public function __construct()
    {
        $this->settings = collect([
            'main' => [
                'section' => 'Main',
                'keys' => SettingKeyEnum::cases(),
            ],
        ]);
    }

    public function getSettings(): Collection
    {
        return $this->settings;
    }

    public function setSettings(string $name, array $settings): void
    {
        if ($this->settings->has($name)) {
            $existing = $this->settings->get($name);
            $this->settings->put($name, ['section' => $existing['section'], 'keys' => array_merge($existing['keys'], $settings)]);
        } else {
            $this->settings->put(mb_strtolower($name), ['section' => $name, 'keys' => $settings]);
        }
    }
}