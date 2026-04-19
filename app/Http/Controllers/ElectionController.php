<?php

namespace App\Http\Controllers;

use App\Http\Requests\ElectionRequest;
use App\Models\Election;
use Illuminate\Http\Request;

class ElectionController extends Controller
{
    public function index()
    {
        $elections = Election::where('user_id', auth()->id())->get();

        return view('election.index', compact('elections'));
    }

    public function create()
    {
        $minDate = now()->startOf('day');

        $lastElection = Election::where('user_id', auth()->id())
            ->orderBy('date_end', 'desc')
            ->first();

        if ($lastElection) {
            $afterLastElection = \Carbon\Carbon::parse($lastElection->date_end)->addDay()->startOf('day');
            if ($afterLastElection->gt($minDate)) {
                $minDate = $afterLastElection;
            }
        }

        return view('election.create', compact('minDate'));
    }

    public function edit(Election $election)
    {
        $minDate = now()->startOf('day');

        $lastOtherElection = Election::where('user_id', auth()->id())
            ->where('id', '!=', $election->id)
            ->orderBy('date_end', 'desc')
            ->first();

        if ($lastOtherElection) {
            $afterLastElection = \Carbon\Carbon::parse($lastOtherElection->date_end)->addDay()->startOf('day');
            if ($afterLastElection->gt($minDate)) {
                $minDate = $afterLastElection;
            }
        }

        return view('election.edit', compact('election', 'minDate'));
    }

    public function show(Election $election)
    {
        return view('election.show', compact('election'));
    }

    public function store(ElectionRequest $request)
    {
        Election::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'date_start' => $request->date_start,
            'date_end' => $request->date_end
        ]);

        return redirect()->route('election:list', $request->only(
            'embedded', 'host', 'id_token', 'shop', 'locale', 'token'
        ))->with('success', 'Election was created!');
    }

    public function update(Election $election, ElectionRequest $request)
    {
        $election->update([
            'name' => $request->name,
            'date_start' => $request->date_start,
            'date_end' => $request->date_end
        ]);

        return redirect()->route('election:list', array_merge(
            ['election' => $election],
            $request->only('embedded', 'host', 'id_token', 'shop', 'locale', 'token')
        ))->with('success', 'Election was updated!');
    }

    public function delete(Election $election, Request $request)
    {
        $election->delete();

        return redirect()->route('election:list', $request->only(
            'embedded', 'host', 'id_token', 'shop', 'locale', 'token'
        ))->with('success', 'Election was deleted!');
    }

    public function report(Election $election)
    {
        $filePath = storage_path("app/election_{$election->id}_top50_report.pdf");

        if (!file_exists($filePath)) {
            abort(404, 'Report not found');
        }

        return response()->file($filePath);
    }
}