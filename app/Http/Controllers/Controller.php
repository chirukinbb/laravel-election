<?php

namespace App\Http\Controllers;

use App\Services\SettingsService;

abstract class Controller
{
    public function __construct(
        public SettingsService $settingsService
    )
    {
        //   \Auth::login(User::find(1));
//        Candidate::whereIn('id', [4, 5, 6, 7, 8])->delete();
//        Election::where('id', 1)->update(['date_end' => '2027-05-13']);
//Vote::where('user_id',1)->delete();
    }
}
