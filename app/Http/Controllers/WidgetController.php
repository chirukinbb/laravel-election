<?php

namespace App\Http\Controllers;

use App\Repositories\ElectionRepository;
use App\Services\SettingsService;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
    public function __construct(
        SettingsService            $settingsService,
        private ElectionRepository $electionRepository
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

        $election = $this->electionRepository->getOngoingElection($shop);

        if (!$election) {
            $election = $this->electionRepository->getLastElection($shop);

            if ($election) {
                $vote = $this->electionRepository->getUserVote($election, $request->user()->id);

                return view('result', compact('election', 'vote'));
            }

            return view('empty');
        }

        $vote = $this->electionRepository->getUserVote($election, $request->user()->id);

        return view('widget', compact('election', 'vote'));
    }
}
