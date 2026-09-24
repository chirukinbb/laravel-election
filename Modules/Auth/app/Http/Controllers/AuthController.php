<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Socialite;
use Modules\Auth\Services\UserService;

class AuthController extends Controller
{
    // Show login form
    public function showLoginForm(): \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
    {
        return view("auth::login");
    }

    public function showRegisterForm(): \Illuminate\Contracts\View\View|\Illuminate\Contracts\View\Factory
    {
        return view("auth::register");
    }

    // Handle login request with static credentials (demo only)
    public function login(Request $request): \Illuminate\Http\RedirectResponse
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

    public function register(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            "email" => "required|email|unique:users,email",
            "name" => "required"
        ]);

        $password = Str::random(12);
        (new UserService())->signup($request->name, $request->email, $password);

        return redirect()->intended("/dashboard");
    }

    // Handle logout
    public function logout(): \Illuminate\Routing\Redirector|\Illuminate\Http\RedirectResponse
    {
        Auth::logout();

        return redirect("");
    }

    public function redirectToProvider($provider): \Symfony\Component\HttpFoundation\RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        return Socialite::driver($provider)->redirect();
    }

    // Обработка ответа от провайдера
    public function handleProviderCallback($provider): \Illuminate\Http\RedirectResponse
    {
        $socialUser = Socialite::driver($provider)->user();

        $user = User::updateOrCreate([
            'email' => $socialUser->getEmail(),
        ], [
            'name' => $socialUser->getName() ?? $socialUser->getNickname(),
            'provider_id' => $socialUser->getId(),
            'provider_name' => $provider,
        ]);

        Auth::login($user);

        return redirect()->to('/dashboard');
    }
}
