<?php

namespace App\Events;

class CinematicMenuEvent
{
    public array $items = [];

    public function add(array $item): self
    {
        $this->items[] = $item;
        return $this;
    }

    public function addSubItem(string $parentKey, array $subItem): self
    {
        foreach ($this->items as &$item) {
            if (($item['key'] ?? null) === $parentKey) {
                $item['children'][] = $subItem;
                break;
            }
        }
        return $this;
    }
}