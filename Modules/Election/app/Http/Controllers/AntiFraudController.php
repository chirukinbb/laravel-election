<?php

namespace Modules\Election\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;

class AntiFraudController extends Controller
{
    public function index()
    {
        $path = storage_path('logs/fraud.log');

        if (!File::exists($path)) {
            File::put($path, '');;
        }

        $content = File::get($path);

        return view('logs', ['logs' => explode("\n", $content)]);
    }

    public function clean()
    {
        File::put(storage_path('logs/fraud.log'), '');

        return redirect()->back()->with('success', 'Successfully clear');
    }
}