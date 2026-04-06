<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Show login form
    public function showLoginForm()
    {
        return view("auth.login");
    }

    // Handle login request with static credentials (demo only)
    public function login(Request $request)
    {
        $request->validate([
            "email" => "required|email",
            "password" => "required",
        ]);

        if (Auth::attempt(['email' => $request->post('email'), 'password' => $request->post('password')], true)) {

            return redirect()->intended("/dashboard");
        }

        return back()->withErrors([
            "email" => "The provided credentials do not match our records.",
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            "email" => "required|email|unique:users,email",
            "name" => "required",
            "password" => "required|confirmed",
        ]);

        Auth::login(User::create($request->only('email', 'password', 'name')));

        return redirect()->intended("/dashboard");
    }

    // Handle logout
    public function logout()
    {
        Auth::logout();

        return redirect("");
    }
}
