<?php

namespace App\Enums;

use App\Traits\EnumTrait;

enum SettingKeyEnum: string
{
    use EnumTrait;

    case SITE_TITLE = 'site_title:string';
    case SITE_DESCRIPTION = 'site_description:string';
    case META_TITLE = 'meta_title:string';
    case META_DESCRIPTION = 'meta_description:string';
    case SOCIAL_MEDIA = 'social_media:string';
}
