<?php

namespace App\Traits;

trait AntiFraud
{
    function fingerprintHash(): bool|string
    {
        $fingerprintData = [
            'user_agent' => $this->userAgent(),
            'accept_language' => $this->header('Accept-Language'),
            'accept_encoding' => $this->header('Accept-Encoding'),
            'accept' => $this->header('Accept'),
            'connection' => $this->header('Connection'),
            'sec_ch_ua' => $this->header('sec-ch-ua'),
            'sec_ch_ua_mobile' => $this->header('sec-ch-ua-mobile'),
            'sec_ch_ua_platform' => $this->header('sec-ch-ua-platform'),
        ];

        return hash('sha256', json_encode($fingerprintData));
    }

    function ipHash()
    {
        $ipAddress = $this->ip();

        return hash('sha256', $ipAddress);
    }
}