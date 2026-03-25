<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class DB extends Command
{
    protected $signature = 'app:db';

    protected $description = 'Command description';

    public function handle()
    {
        Artisan::call('db:wipe');
        Artisan::call('migrate');
        Artisan::call('db:seed');
    }
}
