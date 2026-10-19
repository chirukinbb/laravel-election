<?php

namespace Modules\Election\Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Enums\VoteStatusEnum;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\CandidateContribution;
use Modules\Election\Models\CandidateLink;
use Modules\Election\Models\Election;
use Modules\Election\Models\Vote;
use Spatie\Permission\Models\Role;

class ElectionDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'election-admin@example.com'],
            [
                'name' => 'Election Admin',
                'password' => Hash::make('secret123'),
            ]
        );
        $admin->assignRole(Role::firstOrCreate(['name' => RoleEnum::ADMIN->name]));

        $election = Election::firstOrCreate(
            ['name' => 'Global Community Awards 2026'],
            [
                'user_id' => $admin->id,
                'date_start' => '2026-10-01',
                'date_end' => '2026-10-31',
            ]
        );

        $nominees = [
            [
                'first_name' => 'Alma', 'last_name' => 'Aranda', 'country' => 'AR', 'city' => 'Buenos Aires',
                'activity' => ['en' => 'Community organizer', 'es' => 'Organizadora comunitaria'],
                'reason' => 'She combines local action with a strong focus on education and public trust.',
                'contributions' => [
                    ['what' => 'Technology access programs', 'when' => '2024-01-15', 'forWhom' => 'Local families'],
                    ['what' => 'Youth mentoring', 'when' => '2025-04-01', 'forWhom' => 'Students'],
                ],
                'links' => [
                    ['label' => 'Profile', 'url' => 'https://example.com/alma'],
                ],
            ],
            [
                'first_name' => 'Callum', 'last_name' => 'Bennett', 'country' => 'AU', 'city' => 'Sydney',
                'activity' => ['en' => 'Civic innovation', 'es' => 'Innovación cívica'],
                'reason' => 'He builds practical tools that make public participation easier and more transparent.',
                'contributions' => [
                    ['what' => 'Digital participation', 'when' => '2023-09-10', 'forWhom' => 'Residents'],
                    ['what' => 'Open data policy', 'when' => '2024-11-23', 'forWhom' => 'Municipal teams'],
                ],
                'links' => [
                    ['label' => 'Portfolio', 'url' => 'https://example.com/callum'],
                ],
            ],
            [
                'first_name' => 'Amélie', 'last_name' => 'Aubry', 'country' => 'FR', 'city' => 'Paris',
                'activity' => ['en' => 'Public health advocacy', 'es' => 'Defensa de salud pública'],
                'reason' => 'She connects grassroots volunteers with institutions and keeps local communities informed.',
                'contributions' => [
                    ['what' => 'Health access campaigns', 'when' => '2022-05-12', 'forWhom' => 'Rural communities'],
                    ['what' => 'Volunteer networks', 'when' => '2024-07-09', 'forWhom' => 'Care volunteers'],
                ],
                'links' => [
                    ['label' => 'Media', 'url' => 'https://example.com/amelie'],
                ],
            ],
            [
                'first_name' => 'Aditi', 'last_name' => 'Batra', 'country' => 'IN', 'city' => 'Delhi',
                'activity' => ['en' => 'Sustainability projects', 'es' => 'Proyectos de sostenibilidad'],
                'reason' => 'Her approach shows how practical green policies can improve daily life for families.',
                'contributions' => [
                    ['what' => 'Urban gardens', 'when' => '2021-03-08', 'forWhom' => 'School children'],
                    ['what' => 'School outreach', 'when' => '2025-02-05', 'forWhom' => 'Parents'],
                ],
                'links' => [
                    ['label' => 'Project page', 'url' => 'https://example.com/aditi'],
                ],
            ],
            [
                'first_name' => 'Amani', 'last_name' => 'Kamau', 'country' => 'KE', 'city' => 'Nairobi',
                'activity' => ['en' => 'Youth mobilization', 'es' => 'Movilización juvenil'],
                'reason' => 'She energizes communities through inclusive leadership and local accountability.',
                'contributions' => [
                    ['what' => 'Community forums', 'when' => '2020-11-20', 'forWhom' => 'Young leaders'],
                    ['what' => 'Leadership training', 'when' => '2024-08-17', 'forWhom' => 'Neighborhood groups'],
                ],
                'links' => [
                    ['label' => 'Community hub', 'url' => 'https://example.com/amani'],
                ],
            ],
            [
                'first_name' => 'Akari', 'last_name' => 'Aoki', 'country' => 'JP', 'city' => 'Tokyo',
                'activity' => ['en' => 'Cultural inclusion', 'es' => 'Inclusión cultural'],
                'reason' => 'She connects creative communities with civic projects and helps neighbors participate in public life.',
                'contributions' => [
                    ['what' => 'Cultural exchange programs', 'when' => '2023-06-04', 'forWhom' => 'Students'],
                    ['what' => 'Neighborhood workshops', 'when' => '2024-10-11', 'forWhom' => 'Migrant families'],
                ],
                'links' => [
                    ['label' => 'Events', 'url' => 'https://example.com/akari'],
                ],
            ],
        ];

        $candidateIds = [];
        foreach ($nominees as $nominee) {
            $candidate = Candidate::firstOrCreate(
                [
                    'election_id' => $election->id,
                    'first_name' => $nominee['first_name'],
                    'last_name' => $nominee['last_name'],
                ],
                [
                    'country' => $nominee['country'],
                    'city' => $nominee['city'],
                    'activity' => $nominee['activity'],
                    'reason' => $nominee['reason'],
                    'nominator_name' => 'Community Committee',
                    'show_nominator' => true,
                    'status' => CandidateStatusEnum::Approved->name,
                    'proposed_by' => $admin->id,
                    'portrait_url' => 'https://picsum.photos/seed/' . strtolower($nominee['first_name']) . '/400/500',
                ]
            );

            foreach ($nominee['contributions'] as $contribution) {
                CandidateContribution::firstOrCreate(
                    [
                        'candidate_id' => $candidate->id,
                        'what' => $contribution['what'],
                    ],
                    [
                        'when' => $contribution['when'],
                        'for_whom' => $contribution['forWhom'],
                    ]
                );
            }

            foreach ($nominee['links'] as $link) {
                CandidateLink::firstOrCreate(
                    [
                        'candidate_id' => $candidate->id,
                        'label' => $link['label'],
                    ],
                    [
                        'url' => $link['url'],
                    ]
                );
            }

            $candidateIds[] = $candidate->id;
        }

        $voters = [
            ['name' => 'Nora Clarke', 'email' => 'nora.clarke@example.com'],
            ['name' => 'Mateo Silva', 'email' => 'mateo.silva@example.com'],
            ['name' => 'Priya Nair', 'email' => 'priya.nair@example.com'],
            ['name' => 'Lukas Weber', 'email' => 'lukas.weber@example.com'],
            ['name' => 'Sofia Hassan', 'email' => 'sofia.hassan@example.com'],
            ['name' => 'Dario Lopez', 'email' => 'dario.lopez@example.com'],
            ['name' => 'Mila Petrov', 'email' => 'mila.petrov@example.com'],
            ['name' => 'Ethan Brooks', 'email' => 'ethan.brooks@example.com'],
            ['name' => 'Lina Adebayo', 'email' => 'lina.adebayo@example.com'],
            ['name' => 'Yusuf Rahman', 'email' => 'yusuf.rahman@example.com'],
        ];

        foreach ($voters as $voterData) {
            $user = User::firstOrCreate(
                ['email' => $voterData['email']],
                [
                    'name' => $voterData['name'],
                    'password' => Hash::make('secret123'),
                ]
            );
            $user->assignRole(Role::firstOrCreate(['name' => RoleEnum::USER->name]));

            $candidateId = $candidateIds[array_rand($candidateIds)];

            Vote::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'candidate_id' => $candidateId,
                ],
                [
                    'status' => VoteStatusEnum::Verified->name,
                    'ip_hash' => hash('sha256', $user->email . ':' . $candidateId),
                    'fingerprint_hash' => hash('sha256', $user->id . ':' . $candidateId),
                    'anti_fraud_score' => random_int(0, 12),
                ]
            );
        }
    }
}
