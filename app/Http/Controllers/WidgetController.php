<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Repositories\CandidateRepository;
use App\Repositories\ElectionRepository;
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

        $election = Election::find(1);// $this->electionRepository->getById((int)$electionId, $shop);

        if (is_null($election))
            return view('empty');

        if ($election?->date_end > now() && $election?->date_start < now()) {
            $vote = $this->electionRepository->getUserVote($election, $request->user()?->id ?? 0);
            $candidate = $this->candidateRepository->getMyModeratingCandidate($election->id, $request->user()?->id ?? 0);

            return view('widget.ongoing', compact('election', 'vote', 'candidate'));
        } elseif ($election?->date_end < now()) {
            $vote = $this->electionRepository->getUserVote($election, $request->user()?->id ?? 0);

            return view('result', compact('election', 'vote'));
        }
    }
}
