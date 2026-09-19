<?php

namespace App\Services;

use App\Enums\SettingKeyEnum;
use App\Enums\VoteStatusEnum;
use App\Models\Vote;

class VoteService
{
    public function __construct(
        public SettingsService $settingsService
    )
    {
    }

    function create(int $candidate_id, int $user_id, int $election_id, string $ipHash, string $fingerprintHash)
    {

        $antiFraudService = new AntiFraudService(
            ipWeight: (int)$this->settingsService->get(SettingKeyEnum::ScoreIP),
            fpWeight: (int)$this->settingsService->get(SettingKeyEnum::ScoreFP),
            ipFreqWeight: (int)$this->settingsService->get(SettingKeyEnum::RateLimitIP),
            fpFreqWeight: (int)$this->settingsService->get(SettingKeyEnum::RateLimitFP),
            approveLimit: (int)$this->settingsService->get(SettingKeyEnum::VoteApproveLimit),
            rejectLimit: (int)$this->settingsService->get(SettingKeyEnum::VoteRejectLimit)
        );

        $vote = $antiFraudService->analyzeVote([
            'candidate_id' => $candidate_id,
            'user_id' => $user_id,
            'status' => VoteStatusEnum::Pending->name,
            'ip_hash' => $ipHash,
            'fingerprint_hash' => $fingerprintHash,
            'election_id' => $election_id
        ]);

        $vote = Vote::create($vote);
    }
}