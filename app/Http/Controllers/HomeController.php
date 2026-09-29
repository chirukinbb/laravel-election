<?php

namespace App\Http\Controllers;

use App\Enums\SettingKeyEnum;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('HomePage', [
            'title' => $this->settingsService->get(SettingKeyEnum::SITE_TITLE) . ' - ' . $this->settingsService->get(SettingKeyEnum::SITE_DESCRIPTION),
            'meta' => [
                'title' => $this->settingsService->get(SettingKeyEnum::META_TITLE),

                'description' => $this->settingsService->get(SettingKeyEnum::META_DESCRIPTION),
                'media' => $this->settingsService->get(SettingKeyEnum::SOCIAL_MEDIA)
            ]
        ]);
    }
}