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
            if ($this->verifySignature($request)) {
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


    private function verifySignature(Request $request): bool
    {
        $queryParameters = $request->query();
        $signature = $queryParameters['signature'] ?? '';
        unset($queryParameters['signature']);
        ksort($queryParameters);
        $preparedData = [];

        foreach ($queryParameters as $key => $value) {
            $val = is_array($value) ? implode(',', $value) : $value;
            $preparedData[] = "$key=$val";
        }

        $message = implode('', $preparedData);
        $computedHmac = hash_hmac('sha256', $message, env('SHOPIFY_APP_SECRET'));

        return hash_equals($computedHmac, $signature);
    }
}
