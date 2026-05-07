<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Election;
use App\Models\Vote;
use App\Services\VoteService;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
    /**
     * Display the widget with active election
     */
    public function index(Request $request)
    {
        $shop = $request->input('shop');
        $voted = true;

        if (env('APP_ENV') === 'local') {
            $election = Election::where('date_start', '<=', now())
                ->where('date_end', '>=', now())
                ->first();
        } else {
            $election = Election::where('date_start', '<=', now())
                ->whereRelation('user', 'name', $shop)
                ->where('date_end', '>=', now())
                ->first();
        }

        if ($request->exists('vote_for')) {
            $voteService = new VoteService($this->settingsService);

            $user = $request->user();
            $ipAddress = $request->ip();
            $ipHash = hash('sha256', $ipAddress);

            $fingerprintData = [
                'user_agent' => $request->userAgent(),
                'accept_language' => $request->header('Accept-Language'),
                'accept_encoding' => $request->header('Accept-Encoding'),
                'accept' => $request->header('Accept'),
                'connection' => $request->header('Connection'),
                'sec_ch_ua' => $request->header('sec-ch-ua'),
                'sec_ch_ua_mobile' => $request->header('sec-ch-ua-mobile'),
                'sec_ch_ua_platform' => $request->header('sec-ch-ua-platform'),
            ];
            $fingerprintHash = hash('sha256', json_encode($fingerprintData));

            $voteService->create(
                $request->get('vote_for'),
                $user->id,
                $election->id,
                $ipHash, $fingerprintHash
            );
        }

        // If no active election exists, return null response
        if (!$election) {
            return view('empty');
        }

        $voted = Vote::where('candidate_id', 'in', collect($election->candidates)->map(fn(Candidate $candidate) => $candidate->id)->join(','))
                ->where('user_id', $request->user()->id)
                ->exists() || \Auth::check();

        return view('widget', compact('election', 'voted'));
    }
}
