<?php

namespace App\Enums;

enum VoteStatusEnum: string
{
    case Pending = 'Pending';
    case Verified = 'Verified';
    case Rejected = 'Rejected';
    case Suspicious = 'Suspicious';
}