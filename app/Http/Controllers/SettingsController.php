<?php

namespace App\Http\Controllers;

use App\Enums\SettingKeyEnum;
use App\Events\SettingsEvent;
use Illuminate\Http\Request;

// Используем сервис для считывания/сохранения значений

class SettingsController extends Controller
{

    public function index()
    {
        $event = new SettingsEvent();
        event($event);

        $sections = $event->getSettings();

        $values = [];
        foreach ($sections as $section) {
            foreach ($section['keys'] as $keyEnum) {
                if ($keyEnum instanceof SettingKeyEnum) {
                    $values[$keyEnum->key()] = $this->settingsService->get($keyEnum);
                }
            }
        }

        return view('settings', [
            'sections' => $sections,
            'values' => $values,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            $keyEnum = $this->findEnumByKey($key);

            if ($keyEnum) {
                $this->settingsService->set($keyEnum, $value);
            }
        }

        return redirect()->route('settings', $request->only([
            'embedded', 'host', 'id_token', 'shop', 'locale', 'token'
        ]))->with('success', 'Settings saved successfully');
    }

    /**
     * Поиск enum по ключу (вместо конкатенации строки в from())
     */
    private function findEnumByKey(string $key): ?SettingKeyEnum
    {
        foreach (SettingKeyEnum::cases() as $keyEnum) {
            if ($keyEnum->key() === $key) {
                return $keyEnum;
            }
        }

        return null;
    }
}