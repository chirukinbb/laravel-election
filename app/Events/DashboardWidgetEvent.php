<?php

namespace App\Events;

use Illuminate\View\View;

class DashboardWidgetEvent
{
    private View|string $widgets = '';
    private View|string $header = '';

    public function addWidget(View|string $widget): void
    {
        $this->widgets .= $widget;
    }

    public function renderWidgets(): string
    {
        return $this->widgets;
    }

    public function addHeader(View|string $header): void
    {
        $this->header .= $header;
    }

    public function renderHeader(): string
    {
        return $this->header;
    }
}