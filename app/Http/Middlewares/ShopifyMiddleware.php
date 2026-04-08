<?php

namespace App\Http\Middlewares;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ShopifyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $shop = $request->input('shop');
        $loggedCustomer = $request->input('logged_in_customer_id');
        $timestamp = $request->input('timestamp');
        $signature = $request->input('signature');

        if ($shop && $timestamp && $signature) {
            $data = [
                'shop' => $shop,
                'logged_in_customer_id' => $loggedCustomer,
                'path_prefix' => $request->input('path_prefix'),
                'timestamp' => $timestamp,
            ];

            if ($this->verifySignature($data, $signature)) {
                if ($loggedCustomer) {
                    $user = User::firstOrCreate(
                        ['shopify_user_id' => $loggedCustomer],
                        [
                            'name' => 'Shopify Customer ' . $loggedCustomer,
                            'email' => "customer-{$loggedCustomer}@shopify.local",
                            'password' => Hash::make(uniqid()),
                        ]
                    );

                    Auth::login($user);
                }
            }
        }

        return $next($request);
    }

    private function verifySignature(array $data, string $signature): bool
    {
        $hmac = hash_hmac('sha256', http_build_query($data), env('SHOPIFY_APP_KEY'));

        return hash_equals($hmac, $signature);
    }
}
