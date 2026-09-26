<?php

namespace Modules\Election\Enums;

use App\Traits\EnumTrait;

enum SettingKeyEnum: string
{
    use EnumTrait;

    case RateLimitIP = 'rate_limit_ip:number';
    case RateLimitFP = 'rate_limit_fp:number';
    case ScoreIP = 'ip_score:number';
    case ScoreFP = 'fp_score:number';
    case VoteApproveLimit = 'vote_approve_limit:number';
    case VoteRejectLimit = 'vote_reject_limit:number';
}
