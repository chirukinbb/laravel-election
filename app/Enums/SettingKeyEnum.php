<?php

namespace App\Enums;

enum SettingKeyEnum: string
{
    case SiteName = 'site_name:text';
    case SiteDescription = 'site_description:textarea';
    case AdminEmail = 'admin_email:email';
    case MaintenanceMode = 'maintenance_mode:boolean';
    case RegistrationEnabled = 'registration_enabled:boolean';
    case RateLimit = 'rate_limit:number';

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
