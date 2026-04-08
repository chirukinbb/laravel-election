<?php

namespace Database\Seeders;

use App\Enums\CandidateStatusEnum;
use App\Enums\RoleEnum;
use App\Enums\VoteStatusEnum;
use App\Models\Candidate;
use App\Models\Election;
use App\Models\User;
use App\Models\Vote;
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

        $voters = User::create([
            'name' => 'Test Basic User',
            'email' => 'user@example.com',
            'shopify_user_id' => Hash::make('111')
        ])->assignRole(Role::create(['name' => RoleEnum::USER->name]));

        $election = Election::create([
            'name' => 'President of USA',
            'date_start' => '2025-03-22',
            'date_end' => '2025-03-24'
        ]);

        Candidate::create([
            'first_name' => 'Donny',
            'last_name' => 'Trump',
            'reason_for_nomination' => 'because',
            'country_code' => 'AF',
            'status' => CandidateStatusEnum::PendingReview->name,
            'election_id' => $election->id
        ]);

        $candidate = Candidate::create([
            'first_name' => 'Donny',
            'last_name' => 'Trump jr',
            'reason_for_nomination' => 'because',
            'country_code' => 'AF',
            'status' => CandidateStatusEnum::Approved->name,
            'election_id' => $election->id
        ]);

        $candidate = Candidate::create([
            'first_name' => 'Elon',
            'last_name' => 'Musk jr',
            'reason_for_nomination' => 'because',
            'country_code' => 'AF',
            'status' => CandidateStatusEnum::Approved->name,
            'election_id' => $election->id
        ]);

        Vote::create([
            'user_id' => $voters->id,
            'candidate_id' => $candidate->id,
            'status' => VoteStatusEnum::Pending->name,
            'ip_hash' => '33333333333333333333333',
            'fingerprint_hash' => '3333333333333',
        ]);

        Vote::create([
            'user_id' => $voters->id,
            'candidate_id' => $candidate->id,
            'status' => VoteStatusEnum::Verified->name,
            'ip_hash' => '33333333333333333333333',
            'fingerprint_hash' => '3333333333333',
        ]);

        Vote::create([
            'user_id' => $voters->id,
            'candidate_id' => $candidate->id,
            'status' => VoteStatusEnum::Rejected->name,
            'ip_hash' => '33333333333333333333333',
            'fingerprint_hash' => '3333333333333',
        ]);
    }
}
