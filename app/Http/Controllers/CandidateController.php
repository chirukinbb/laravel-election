<?php

namespace App\Http\Controllers;

use App\Http\Requests\CandidateRequest;
use App\Models\Candidate;
use App\Models\Election;

class CandidateController extends Controller
{
    public function index(Election $election)
    {
        return view('candidate.index', compact('election'));
    }

    public function create(Election $election)
    {
        return view('candidate.create', compact('election'));
    }

    public function edit(Election $election, Candidate $candidate)
    {
        return view('candidate.edit', compact('election', 'candidate'));
    }

    public function store(Election $election, CandidateRequest $request)
    {
        $election->candidates()->create(array_merge($request->only(
            'election_id',
            'first_name',
            'last_name',
            'country_code',
            'city',
            'profession',
            'role',
            'website',
            'socials',
            'photo_url',
        ), [
            'approved' => true,
            'reason_for_nomination' => 'from admin'
        ]));

        return redirect()->route('election:candidate:create', compact('election'))->with('success', 'Candidate was created!');
    }

    public function update(Election $election, Candidate $candidate, CandidateRequest $request)
    {
        $candidate->update($request->only(
            'first_name',
            'last_name',
            'country_code',
            'city',
            'profession',
            'role',
            'website',
            'socials',
            'photo_url',
            'reason_for_nomination',
            'approved'
        ));

        return redirect()->route('election:candidate:list', compact('election'))->with('success', 'Candidate was updated!');
    }

    public function delete(Election $election, Candidate $candidate)
    {
        $candidate->delete();

        return redirect()->route('election:candidate:list', compact('election'))->with('success', 'Candidate was deleted!');
    }
}