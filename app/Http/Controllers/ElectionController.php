<?php

namespace App\Http\Controllers;

use App\Http\Requests\ElectionRequest;
use App\Models\Election;
use Illuminate\Http\Request;

class ElectionController extends Controller
{
    public function index()
    {
        $elections = Election::all();

        return view('election.index', compact('elections'));
    }

    public function create()
    {
        return view('election.create');
    }

    public function edit(Election $election)
    {
        return view('election.edit', compact('election'));
    }

    public function show(Election $election)
    {
        return view('election.show', compact('election'));
    }

    public function store(ElectionRequest $request)
    {
        Election::create($request->only('name', 'date_end', 'date_start'));

        return redirect()->route('election:list', $request->only(
            'embedded', 'host', 'id_token', 'shop', 'locale', 'token'
        ))->with('success', 'Election was created!');
    }

    public function update(Election $election, ElectionRequest $request)
    {
        $election->update($request->only('name', 'date_end', 'date_start'));

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