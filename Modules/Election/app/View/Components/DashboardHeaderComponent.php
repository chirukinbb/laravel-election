<?php

namespace Modules\Election\View\Components;

use Illuminate\View\Component;
use Illuminate\View\View;
use Modules\Election\Models\Election;

class DashboardHeaderComponent extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct()
    {
    }

    /**
     * Get the view/contents that represent the component.
     */
    public function render(): View|string
    {
        $elections = Election::orderBy('date_start', 'desc')
            ->where('user_id', auth()->id())
            ->get();

        $electionId = request('election');
        if ($electionId) {
            $selectedElection = $elections->firstWhere('id', $electionId) ?: $elections->first();
        } else {
            $selectedElection = $elections->first();
        }

        return view('election::components.dashboard.header', compact(
            'elections', 'selectedElection'
        ));
    }
}
