<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Vote;
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

        if (!$election) {
            return view('empty');
        }

        $voted = Vote::where('user_id', $request->user()?->id)
            ->whereHas('candidate', function ($query) use ($election) {
                $query->where('election_id', $election->id);
            })
            ->exists();

        return view('widget', compact('election', 'voted'));
    }
}
