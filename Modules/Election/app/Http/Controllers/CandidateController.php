<?php

namespace Modules\Election\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Election\Enums\CandidateStatusEnum;
use Modules\Election\Http\Requests\CandidateRequest;
use Modules\Election\Models\Candidate;
use Modules\Election\Models\Election;

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
            'status' => CandidateStatusEnum::Approved->name,
            'reason_for_nomination' => 'from admin'
        ]));

        return redirect()->route('election:candidate:create', array_merge(
            compact('election'),
            $request->only('embedded', 'host', 'id_token', 'shop', 'locale', 'token')
        ))->with('success', 'Candidate was created!');
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
        ));

        if ($request->post('status') === CandidateStatusEnum::Merged->name) {
            $targetCandidate = Candidate::find($request->post('merge_with'));
            if ($targetCandidate) {
                $candidate->mergeInto($targetCandidate);
            }
        }

        return redirect()->route('election:candidate:list', array_merge(
            compact('election'),
            $request->only('embedded', 'host', 'id_token', 'shop', 'locale', 'token')
        ))->with('success', 'Candidate was updated!');
    }

    public function delete(Election $election, Candidate $candidate, Request $request)
    {
        $candidate->delete();

        return redirect()->route('election:candidate:list', array_merge(
            compact('election'),
            $request->only('embedded', 'host', 'id_token', 'shop', 'locale', 'token')
        ))->with('success', 'Candidate was deleted!');
    }

    public function unbounded(): \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
    {
        $candidates = Candidate::where('election_id', 0)->get();
        $elections = Election::where('date_end', '>', now())->get();

        return view('candidate.unbounded', compact('candidates', 'elections'));
    }

    function proposedBy(Election $election, Candidate $candidate)
    {
        $user = $candidate->proposedBy;

        if (is_null($user))
            return redirect()->route('election:candidate:list', compact('election'))->with('error', 'User not found!');

        return view('candidate.proposedBy', compact('user'));
    }
}