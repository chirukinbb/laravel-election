<?php

namespace App\Http\Middlewares;

use App\Models\Election;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckElectionOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $election = $request->route('election');

        if ($election instanceof Election && $election->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
