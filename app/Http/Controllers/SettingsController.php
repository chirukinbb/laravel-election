<?php

namespace App\Http\Controllers;

use App\Enums\SettingKeyEnum;
use App\Services\SettingsService;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function __construct(
        private SettingsService $settingsService
    )
    {
    }

    public function index()
    {
        $settings = [];
        foreach (SettingKeyEnum::cases() as $keyEnum) {
            $settings[$keyEnum->key()] = $this->settingsService->get($keyEnum);
        }

        return view('settings', [
            'settingKeys' => SettingKeyEnum::cases(),
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            $keyEnum = SettingKeyEnum::from($key . ':' . $this->getTypeByKey($key));
            $this->settingsService->set($keyEnum, $value);
        }

        return redirect()->route('settings')->with('success', 'Settings saved successfully');
    }

    private function getTypeByKey(string $key): string
    {
        foreach (SettingKeyEnum::cases() as $keyEnum) {
            if ($keyEnum->key() === $key) {
                return $keyEnum->type();
            }
        }
        return 'text';
    }
}