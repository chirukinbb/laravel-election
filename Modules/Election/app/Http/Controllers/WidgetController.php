<?php

namespace Modules\Election\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
    public function __construct(
        SettingsService             $settingsService,
        private ElectionRepository  $electionRepository,
        private CandidateRepository $candidateRepository
    )
    {
        parent::__construct($settingsService);
    }

    /**
     * Display the widget with active election
     */
    public function index(Request $request)
    {
        $shop = $request->input('shop');
        $electionId = $request->input('election');

        $election = $this->electionRepository->getById((int)$electionId, $shop);

        if (is_null($election))
            return view('empty');

        $vote = $this->electionRepository->getUserVote($election, $request->user()?->id ?? 0);
        $candidate = $this->candidateRepository->getMyModeratingCandidate($election->id, $request->user()?->id ?? 0);

        if ($election?->date_end > now() && $election?->date_start < now()) {
            return view('widget.ongoing', compact('election', 'vote', 'candidate'));
        } elseif ($election?->date_end < now()) {
            return view('widget.result', compact('election', 'vote'));
        } else return view('widget.upcoming', compact('election', 'vote', 'candidate'));
    }
}
