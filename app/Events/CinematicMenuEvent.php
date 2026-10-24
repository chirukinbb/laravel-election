<?php

namespace App\Events;

class CinematicMenuEvent
{
    public array $items = [];
    public ?string $accountUrl = null;
    public ?string $loginUrl = null;
    public ?string $registerUrl = null;

    public function add(array $item): self
    {
        $this->items[] = $item;
        return $this;
    }

    public function setAccountUrl(string $url): self
    {
        $this->accountUrl = $url;
        return $this;
    }

    public function setLoginUrl(string $url): self
    {
        $this->loginUrl = $url;
        return $this;
    }

    public function setRegisterUrl(string $url): self
    {
        $this->registerUrl = $url;
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