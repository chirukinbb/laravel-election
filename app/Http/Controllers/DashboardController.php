<?php

namespace App\Http\Controllers;

use App\Events\DashboardWidgetEvent;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dashboard = new  DashboardWidgetEvent();

        event($dashboard);

        return view('dashboard', compact('dashboard'));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        abort(404);
    }
}
