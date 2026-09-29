<?php

namespace Modules\Profile\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class ProfileController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->paginate(10);
        $roles = Role::all();

        return view('profile::user.index', compact('users', 'roles'));
    }

    public function create()
    {
        $roles = Role::all();

        return view('profile::user.create', compact('roles'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('profile::index')
            ->with('success', 'User created successfully.');
    }

    public function updateRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|exists:roles,name',
        ]);

        // Sync roles (remove all current roles and assign the new one)
        $user->syncRoles([$validated['role']]);

        return redirect()->route('profile::index')
            ->with('success', 'User role updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return redirect()->route('profile::index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('profile::index')
            ->with('success', 'User deleted successfully.');
    }
}
