<?php

namespace Modules\Election\Database\Seeders;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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
            [
                'first_name' => 'Noah', 'last_name' => 'Carter', 'country' => 'US', 'city' => 'Chicago',
                'activity' => ['en' => 'Education access', 'es' => 'Acceso a la educación'],
                'reason' => 'He creates mentoring networks that help students from low-income neighborhoods reach their goals.',
                'contributions' => [
                    ['what' => 'STEM scholarship circles', 'when' => '2022-08-14', 'forWhom' => 'High school students'],
                    ['what' => 'Mentor matching platform', 'when' => '2025-03-21', 'forWhom' => 'Young professionals'],
                ],
                'links' => [
                    ['label' => 'Impact report', 'url' => 'https://example.com/noah'],
                ],
            ],
            [
                'first_name' => 'Sofia', 'last_name' => 'Moreno', 'country' => 'ES', 'city' => 'Madrid',
                'activity' => ['en' => 'Digital inclusion', 'es' => 'Inclusión digital'],
                'reason' => 'She bridges skill gaps with practical training and public support for everyday digital literacy.',
                'contributions' => [
                    ['what' => 'Neighborhood tech workshops', 'when' => '2021-09-03', 'forWhom' => 'Seniors'],
                    ['what' => 'Digital skills labs', 'when' => '2024-04-17', 'forWhom' => 'Unemployed adults'],
                ],
                'links' => [
                    ['label' => 'Workshop archive', 'url' => 'https://example.com/sofia'],
                ],
            ],
            [
                'first_name' => 'Daniel', 'last_name' => 'Okafor', 'country' => 'NG', 'city' => 'Lagos',
                'activity' => ['en' => 'Community safety', 'es' => 'Seguridad comunitaria'],
                'reason' => 'He turns local concern into practical safety programs that bring residents and institutions closer together.',
                'contributions' => [
                    ['what' => 'Neighborhood watch network', 'when' => '2020-02-11', 'forWhom' => 'Residents'],
                    ['what' => 'Youth safety training', 'when' => '2024-07-09', 'forWhom' => 'School communities'],
                ],
                'links' => [
                    ['label' => 'Safety programs', 'url' => 'https://example.com/daniel'],
                ],
            ],
            [
                'first_name' => 'Elena', 'last_name' => 'Petrova', 'country' => 'BG', 'city' => 'Sofia',
                'activity' => ['en' => 'Local governance', 'es' => 'Gobernanza local'],
                'reason' => 'Her work helps residents understand institutions and take part in public decisions with confidence.',
                'contributions' => [
                    ['what' => 'Town hall listening sessions', 'when' => '2023-01-20', 'forWhom' => 'Citizens'],
                    ['what' => 'Public budget literacy', 'when' => '2025-05-18', 'forWhom' => 'Parents'],
                ],
                'links' => [
                    ['label' => 'Public forum', 'url' => 'https://example.com/elena'],
                ],
            ],
            [
                'first_name' => 'Mateo', 'last_name' => 'Costa', 'country' => 'BR', 'city' => 'Rio de Janeiro',
                'activity' => ['en' => 'Environmental action', 'es' => 'Acción ambiental'],
                'reason' => 'He focuses on practical solutions that clean public spaces and build ownership within neighborhoods.',
                'contributions' => [
                    ['what' => 'Community cleanup drives', 'when' => '2021-06-07', 'forWhom' => 'Local residents'],
                    ['what' => 'River restoration project', 'when' => '2024-12-02', 'forWhom' => 'School groups'],
                ],
                'links' => [
                    ['label' => 'Project diary', 'url' => 'https://example.com/mateo'],
                ],
            ],
            [
                'first_name' => 'Hana', 'last_name' => 'Kim', 'country' => 'KR', 'city' => 'Seoul',
                'activity' => ['en' => 'Cross-cultural outreach', 'es' => 'Alcance intercultural'],
                'reason' => 'She brings communities together through language access, inclusion, and practical neighborhood support.',
                'contributions' => [
                    ['what' => 'Community translation network', 'when' => '2022-10-05', 'forWhom' => 'Immigrant families'],
                    ['what' => 'Civic onboarding events', 'when' => '2024-09-27', 'forWhom' => 'New residents'],
                ],
                'links' => [
                    ['label' => 'Outreach profile', 'url' => 'https://example.com/hana'],
                ],
            ],
            [
                'first_name' => 'Yusuf', 'last_name' => 'El-Sayed', 'country' => 'EG', 'city' => 'Cairo',
                'activity' => ['en' => 'Urban resilience', 'es' => 'Resiliencia urbana'],
                'reason' => 'He develops community-based projects that improve infrastructure and strengthen local trust.',
                'contributions' => [
                    ['what' => 'Shade and water points', 'when' => '2021-05-12', 'forWhom' => 'Market vendors'],
                    ['what' => 'Flood response volunteer network', 'when' => '2024-11-08', 'forWhom' => 'District families'],
                ],
                'links' => [
                    ['label' => 'Field notes', 'url' => 'https://example.com/yusuf'],
                ],
            ],
            [
                'first_name' => 'Lucía', 'last_name' => 'Fernández', 'country' => 'MX', 'city' => 'Guadalajara',
                'activity' => ['en' => 'Women\'s leadership', 'es' => 'Liderazgo femenino'],
                'reason' => 'She designs support systems that help women lead local projects and shape community decisions.',
                'contributions' => [
                    ['what' => 'Leadership circles', 'when' => '2020-12-18', 'forWhom' => 'Women entrepreneurs'],
                    ['what' => 'Neighborhood grant workshops', 'when' => '2025-01-30', 'forWhom' => 'Community organizers'],
                ],
                'links' => [
                    ['label' => 'Leadership blog', 'url' => 'https://example.com/lucia'],
                ],
            ],
            [
                'first_name' => 'Omar', 'last_name' => 'Haddad', 'country' => 'LB', 'city' => 'Beirut',
                'activity' => ['en' => 'Public space renewal', 'es' => 'Renovación del espacio público'],
                'reason' => 'He connects residents, artists, and local leaders to restore public spaces with inclusive design.',
                'contributions' => [
                    ['what' => 'Open-air community art', 'when' => '2022-04-22', 'forWhom' => 'Youth groups'],
                    ['what' => 'Park revival program', 'when' => '2024-08-10', 'forWhom' => 'Families'],
                ],
                'links' => [
                    ['label' => 'Urban renewal', 'url' => 'https://example.com/omar'],
                ],
            ],
            [
                'first_name' => 'Inês', 'last_name' => 'Marques', 'country' => 'PT', 'city' => 'Lisbon',
                'activity' => ['en' => 'Inclusive migration support', 'es' => 'Apoyo inclusivo a la migración'],
                'reason' => 'She builds support pathways for migrants and ensures communities benefit from new voices and skills.',
                'contributions' => [
                    ['what' => 'Integration workshops', 'when' => '2021-11-09', 'forWhom' => 'Refugee families'],
                    ['what' => 'Local language support', 'when' => '2025-02-12', 'forWhom' => 'Children'],
                ],
                'links' => [
                    ['label' => 'Support network', 'url' => 'https://example.com/ines'],
                ],
            ],
            [
                'first_name' => 'Jonas', 'last_name' => 'Keller', 'country' => 'DE', 'city' => 'Berlin',
                'activity' => ['en' => 'Sustainable mobility', 'es' => 'Movilidad sostenible'],
                'reason' => 'He advocates for safe, low-carbon transportation options that improve everyday life in dense neighborhoods.',
                'contributions' => [
                    ['what' => 'Bike lane advocacy', 'when' => '2020-07-19', 'forWhom' => 'Cyclists'],
                    ['what' => 'School mobility plan', 'when' => '2024-03-11', 'forWhom' => 'Parents'],
                ],
                'links' => [
                    ['label' => 'Mobility map', 'url' => 'https://example.com/jonas'],
                ],
            ],
            [
                'first_name' => 'Chika', 'last_name' => 'Okafor', 'country' => 'GH', 'city' => 'Accra',
                'activity' => ['en' => 'Youth entrepreneurship', 'es' => 'Emprendimiento juvenil'],
                'reason' => 'She creates practical pathways for young people to turn ideas into local enterprises and stable income.',
                'contributions' => [
                    ['what' => 'Micro-grant incubator', 'when' => '2021-02-28', 'forWhom' => 'Young founders'],
                    ['what' => 'Business coaching labs', 'when' => '2024-06-18', 'forWhom' => 'University students'],
                ],
                'links' => [
                    ['label' => 'Enterprise forum', 'url' => 'https://example.com/chika'],
                ],
            ],
            [
                'first_name' => 'Marina', 'last_name' => 'Solis', 'country' => 'CL', 'city' => 'Santiago',
                'activity' => ['en' => 'Food security', 'es' => 'Seguridad alimentaria'],
                'reason' => 'She partners with local growers and schools to make healthy food a practical right for all families.',
                'contributions' => [
                    ['what' => 'School food gardens', 'when' => '2022-09-09', 'forWhom' => 'Children'],
                    ['what' => 'Community pantry network', 'when' => '2025-01-12', 'forWhom' => 'Low-income households'],
                ],
                'links' => [
                    ['label' => 'Food equity program', 'url' => 'https://example.com/marina'],
                ],
            ],
            [
                'first_name' => 'Leo', 'last_name' => 'Verhoeven', 'country' => 'BE', 'city' => 'Brussels',
                'activity' => ['en' => 'Affordable housing', 'es' => 'Vivienda asequible'],
                'reason' => 'He brings data, residents, and institutions together to design more stable and fair housing policies.',
                'contributions' => [
                    ['what' => 'Tenant support clinics', 'when' => '2021-08-24', 'forWhom' => 'Families'],
                    ['what' => 'Housing data dashboard', 'when' => '2024-10-03', 'forWhom' => 'Municipal teams'],
                ],
                'links' => [
                    ['label' => 'Housing brief', 'url' => 'https://example.com/leo'],
                ],
            ],
            [
                'first_name' => 'Tania', 'last_name' => 'Rahimi', 'country' => 'IR', 'city' => 'Tehran',
                'activity' => ['en' => 'Public health literacy', 'es' => 'Alfabetización en salud pública'],
                'reason' => 'She provides trusted, community-level information that helps families act early and make healthier choices.',
                'contributions' => [
                    ['what' => 'Wellness education series', 'when' => '2022-05-19', 'forWhom' => 'Mothers'],
                    ['what' => 'Clinic outreach guides', 'when' => '2024-11-15', 'forWhom' => 'Young adults'],
                ],
                'links' => [
                    ['label' => 'Health guide', 'url' => 'https://example.com/tania'],
                ],
            ],
            [
                'first_name' => 'Samuel', 'last_name' => 'Johnson', 'country' => 'ZA', 'city' => 'Cape Town',
                'activity' => ['en' => 'Rural connectivity', 'es' => 'Conectividad rural'],
                'reason' => 'He works on community networks and local infrastructure so isolated places are not left behind.',
                'contributions' => [
                    ['what' => 'Rural Wi-Fi hubs', 'when' => '2020-06-25', 'forWhom' => 'Farm communities'],
                    ['what' => 'Digital access clinics', 'when' => '2025-04-08', 'forWhom' => 'Students'],
                ],
                'links' => [
                    ['label' => 'Connectivity map', 'url' => 'https://example.com/samuel'],
                ],
            ],
            [
                'first_name' => 'Priya', 'last_name' => 'Nandi', 'country' => 'IN', 'city' => 'Kolkata',
                'activity' => ['en' => 'Climate adaptation', 'es' => 'Adaptación climática'],
                'reason' => 'She translates climate risks into local actions that protect livelihoods, homes, and public trust.',
                'contributions' => [
                    ['what' => 'Rainwater harvesting drives', 'when' => '2023-07-01', 'forWhom' => 'Neighborhoods'],
                    ['what' => 'Heat resilience workshops', 'when' => '2025-03-08', 'forWhom' => 'Street vendors'],
                ],
                'links' => [
                    ['label' => 'Climate notes', 'url' => 'https://example.com/priya'],
                ],
            ],
            [
                'first_name' => 'Emilija', 'last_name' => 'Dobrev', 'country' => 'RS', 'city' => 'Belgrade',
                'activity' => ['en' => 'Civic education', 'es' => 'Educación cívica'],
                'reason' => 'She helps citizens understand rights, responsibilities, and how to shape local government fairly.',
                'contributions' => [
                    ['what' => 'Community civics labs', 'when' => '2022-02-15', 'forWhom' => 'Young adults'],
                    ['what' => 'School election workshops', 'when' => '2024-05-29', 'forWhom' => 'Students'],
                ],
                'links' => [
                    ['label' => 'Civic resources', 'url' => 'https://example.com/emilija'],
                ],
            ],
            [
                'first_name' => 'Theo', 'last_name' => 'Laurent', 'country' => 'FR', 'city' => 'Lyon',
                'activity' => ['en' => 'Volunteer coordination', 'es' => 'Coordinación voluntaria'],
                'reason' => 'He organizes volunteer networks in a way that keeps service practical, local, and accountable.',
                'contributions' => [
                    ['what' => 'Disaster readiness teams', 'when' => '2021-12-04', 'forWhom' => 'Residents'],
                    ['what' => 'Community care hotline', 'when' => '2025-02-21', 'forWhom' => 'Seniors'],
                ],
                'links' => [
                    ['label' => 'Volunteer hub', 'url' => 'https://example.com/theo'],
                ],
            ],
            [
                'first_name' => 'Rina', 'last_name' => 'Takahashi', 'country' => 'JP', 'city' => 'Osaka',
                'activity' => ['en' => 'Social innovation', 'es' => 'Innovación social'],
                'reason' => 'She builds community-first tools that help neighbors solve local problems with less friction and more trust.',
                'contributions' => [
                    ['what' => 'Local issue matching platform', 'when' => '2023-03-14', 'forWhom' => 'Residents'],
                    ['what' => 'Volunteer dashboards', 'when' => '2024-10-28', 'forWhom' => 'Associations'],
                ],
                'links' => [
                    ['label' => 'Innovation lab', 'url' => 'https://example.com/rina'],
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
                    'uuid' => (string)Str::uuid(),
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
            ['name' => 'Ava Thompson', 'email' => 'ava.thompson@example.com'],
            ['name' => 'Mateusz Kowalski', 'email' => 'mateusz.kowalski@example.com'],
            ['name' => 'Leila Haddad', 'email' => 'leila.haddad@example.com'],
            ['name' => 'Oscar Bennett', 'email' => 'oscar.bennett@example.com'],
            ['name' => 'Nadia Saleh', 'email' => 'nadia.saleh@example.com'],
            ['name' => 'Thiago Almeida', 'email' => 'thiago.almeida@example.com'],
            ['name' => 'Mira Stefanova', 'email' => 'mira.stefanova@example.com'],
            ['name' => 'Hugo Martin', 'email' => 'hugo.martin@example.com'],
            ['name' => 'Anika Patel', 'email' => 'anika.patel@example.com'],
            ['name' => 'Rafael Costa', 'email' => 'rafael.costa@example.com'],
            ['name' => 'Zahra Karim', 'email' => 'zahra.karim@example.com'],
            ['name' => 'Joao Pereira', 'email' => 'joao.pereira@example.com'],
            ['name' => 'Carmen Diaz', 'email' => 'carmen.diaz@example.com'],
            ['name' => 'Adam Novak', 'email' => 'adam.novak@example.com'],
            ['name' => 'Fatima Al-Mansoor', 'email' => 'fatima.almansoor@example.com'],
            ['name' => 'Ibrahim Noor', 'email' => 'ibrahim.noor@example.com'],
            ['name' => 'Sara Mikkelsen', 'email' => 'sara.mikkelsen@example.com'],
            ['name' => 'Tariq Hughes', 'email' => 'tariq.hughes@example.com'],
            ['name' => 'Eva Moreau', 'email' => 'eva.moreau@example.com'],
            ['name' => 'Kenji Sato', 'email' => 'kenji.sato@example.com'],
            ['name' => 'Maya Ibrahim', 'email' => 'maya.ibrahim@example.com'],
            ['name' => 'Nicolas Roy', 'email' => 'nicolas.roy@example.com'],
            ['name' => 'Olivia Reed', 'email' => 'olivia.reed@example.com'],
            ['name' => 'Arjun Mehta', 'email' => 'arjun.mehta@example.com'],
            ['name' => 'Isabel Costa', 'email' => 'isabel.costa@example.com'],
            ['name' => 'Samir Benali', 'email' => 'samir.benali@example.com'],
            ['name' => 'Tessa van der Meer', 'email' => 'tessa.vandermeer@example.com'],
            ['name' => 'Dmytro Shevchenko', 'email' => 'dmytro.shevchenko@example.com'],
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
