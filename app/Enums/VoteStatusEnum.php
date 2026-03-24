<?php

namespace App\Enums;

enum VoteStatus: string
{
    case Pending = 'pending';         // Ожидает проверки (высокий fraud_score или ручная модерация)
    case Verified = 'verified';       // Подтвержден, учитывается в рейтинге Top 50
    case Rejected = 'rejected';       // Отклонен (дубликат или решение модератора)
    case Fraud = 'fraud';             // Помечен как явная атака ботов (автоматически)
    case Invalidated = 'invalidated'; // Был подтвержден, но позже аннулирован администратором
}