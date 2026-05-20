<?php

namespace App\Http\Controllers;

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
        $shop = $request->input('shop') || '';
        $electionId = $request->input('election') || '';

        $election = $this->electionRepository->getById($shop, $electionId);

        if ($election?->date_end > now()) {
            $vote = $this->electionRepository->getUserVote($election, $request->user()->id);

            return view('result', compact('election', 'vote'));
        } elseif ($election?->date_end > now() && $election?->date_start < now()) {
            $vote = $this->electionRepository->getUserVote($election, $request->user()->id);
            $candidate = $this->candidateRepository->getMyModeratingCandidate($election->id, $request->user()->id);

            return view('widget', compact('election', 'vote', 'candidate'));
        }

        return view('empty');
    }
}
