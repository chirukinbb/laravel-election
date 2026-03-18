<?php

namespace App\Http\Enums;

enum RoleEnum: string
{
    case ADMIN = 'Admin';
    case USER = 'User';
}