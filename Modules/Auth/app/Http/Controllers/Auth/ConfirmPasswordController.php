<?php

namespace Modules\Auth\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ConfirmPasswordController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Show the confirm password view.
     */
    public function showConfirmForm()
    {
        return view('auth::auth.passwords.confirm');
    }

    /**
     * Confirm the password.
     */
    public function confirm(Request $request)
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        // Store the password confirmation in session
        session()->put('auth.password_confirmed_at', time());

        return redirect()->intended('/dashboard');
    }
}
