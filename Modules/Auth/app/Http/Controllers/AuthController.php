<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Socialite;
use Modules\Auth\Services\UserService;

class AuthController extends Controller
{
    // Show login form
    public function showLoginForm(): \Inertia\Response
    {
        return Inertia::render('LoginPage', [
            'loginUrl' => route('login'),
            'registerUrl' => route('register'),
            'forgotPasswordUrl' => route('password.request'),
            'signUpUrl' => route('signup'),
            'signinUrl' => route('signin'),
        ]);
    }

    public function showRegisterForm(): \Inertia\Response
    {
        return Inertia::render('RegisterPage', [
            'loginUrl' => route('login'),
            'registerUrl' => route('register'),
            'forgotPasswordUrl' => route('password.request'),
            'signUpUrl' => route('signup'),
            'signinUrl' => route('signin'),
        ]);
    }

    // Handle login request with static credentials (demo only)
    public function login(Request $request): \Illuminate\Http\RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, true)) {
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard', [], false) ?? '/dashboard');
        }

        return back()
            ->withErrors([
                'email' => 'The provided credentials do not match our records.',
            ])
            ->onlyInput('email');
    }

    public function register(Request $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        $password = Str::random(12);
        $user = (new UserService())->signup(
            $data['name'],
            $data['email'],
            $password,
        );

        if ($user instanceof \Exception) {
            return back()
                ->withErrors([
                    'email' => 'Unable to create the account. Please try again.',
                ])
                ->withInput();
        }

        $user->notify(new \Modules\Auth\Notifications\NewUserNotification($password));

        Auth::login($user);

        return redirect()->intended(route('dashboard', [], false) ?? '/dashboard');
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
