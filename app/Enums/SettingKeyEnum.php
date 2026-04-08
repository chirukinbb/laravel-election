<?php

namespace App\Enums;

enum SettingKeyEnum: string
{
    case SiteName = 'site_name:text';
    case SiteDescription = 'site_description:textarea';
    case AdminEmail = 'admin_email:email';
    case MaintenanceMode = 'maintenance_mode:boolean';
    case RegistrationEnabled = 'registration_enabled:boolean';
    case RateLimitIP = 'rate_limit_ip:number';
    case RateLimitFP = 'rate_limit_fp:number';
    case ScoreIP = 'ip_score:number';
    case ScoreFP = 'fp_score:number';
    case VoteApproveLimit = 'vote_approve_limit:number';
    case VoteRejectLimit = 'vote_reject_limit:number';

    public function key(): string
    {
        return explode(':', $this->value)[0];
    }

    public function type(): string
    {
        return explode(':', $this->value)[1];
    }

    public function label(): string
    {
        return ucwords(str_replace('_', ' ', $this->key()));
    }
}
