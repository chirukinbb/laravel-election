<?php

namespace App\Enums;

enum CandidateStatusEnum: string
{
    case Draft = 'Draft';
    case PendingReview = 'Pending Review';
    case Approved = 'Approved';
    case Rejected = 'Rejected';
    case Merged = 'Merged';
    case Hidden = 'Hidden';
    case Final = 'Final';
    case Top50 = 'Top 50';
}