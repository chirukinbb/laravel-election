<?php

namespace Database\Seeders;

use App\Http\Enums\RoleEnum;
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

        User::create([
            'name' => 'Test Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('000')
        ])->assignRole(Role::create(['name' => RoleEnum::ADMIN->name]));

        User::create([
            'name' => 'Test Basic User',
            'email' => 'user@example.com',
            'password' => Hash::make('111')
        ])->assignRole(Role::create(['name' => RoleEnum::USER->name]));
    }
}
