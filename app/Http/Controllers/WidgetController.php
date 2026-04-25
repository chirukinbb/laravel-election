<?php

namespace App\Http\Controllers;

use App\Models\Election;
use Illuminate\Http\Request;

class WidgetController extends Controller
{
    /**
     * Display the widget with active election
     */
    public function index(Request $request)
    {
        $shop = $request->input('shop');

        $election = Election::where('date_start', '<=', now())
            ->whereRelation('user', 'name', $shop)
            ->where('date_end', '>=', now())
            ->first();

        // If no active election exists, return null response
        if (!$election) {
            return view('empty');
        }

        return view('widget', compact('election'));
    }
}
