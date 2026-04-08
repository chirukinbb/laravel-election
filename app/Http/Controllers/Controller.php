<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;

abstract class Controller
{
    public function __construct(
        public SettingsService $settingsService
    )
    {
    }
}
