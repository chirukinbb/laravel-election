<?php

namespace Database\Seeders;

use App\Enums\RoleEnum;
use App\Enums\SettingKeyEnum;
use App\Models\Setting;
use App\Models\Translation;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::create([
            'name' => 'Test Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('000')
        ])->assignRole(Role::create(['name' => RoleEnum::ADMIN->name]));

        $voters = User::create([
            'name' => 'Test Basic User',
            'email' => 'user@example.com',
            'shopify_user_id' => Hash::make('111')
        ])->assignRole(Role::create(['name' => RoleEnum::USER->name]));

        $siteTitle = Setting::create([
            'key' => SettingKeyEnum::SITE_TITLE->value,
            'value' => null
        ]);
        Translation::create([
            'language' => 'en',
            'translatable_id' => $siteTitle->id,
            'translatable_type' => Setting::class,
            'text' => 'Tree of Unity'
        ]);

        $siteDescription = Setting::create([
            'key' => SettingKeyEnum::SITE_DESCRIPTION->value,
            'value' => null
        ]);
        Translation::create([
            'language' => 'en',
            'translatable_id' => $siteDescription->id,
            'translatable_type' => Setting::class,
            'text' => 'A symbol of humanity'
        ]);

        $this->call(\Modules\Election\Database\Seeders\ElectionDatabaseSeeder::class);
    }
}
