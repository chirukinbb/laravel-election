<?php

namespace App\Traits;

trait EnumTrait
{
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

    static function keys()
    {
        return collect(self::cases())->map(fn(\UnitEnum $enum) => $enum->name)->toArray();
    }
}