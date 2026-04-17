<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Top 50 Candidates - {{ $election->name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }

        .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 10px;
        }

        .header h2 {
            font-size: 18px;
            color: #64748b;
            font-weight: normal;
            margin-bottom: 5px;
        }

        .header .meta {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 10px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        thead {
            background-color: #2563eb;
            color: white;
        }

        thead th {
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
        }

        tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }

        tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        tbody td {
            padding: 10px 8px;
            font-size: 11px;
        }

        .rank {
            text-align: center;
            font-weight: bold;
            color: #2563eb;
        }

        .rank-top3 {
            font-size: 13px;
        }

        .candidate-name {
            font-weight: 600;
            color: #1e293b;
        }

        .candidate-details {
            font-size: 10px;
            color: #64748b;
            margin-top: 2px;
        }

        .votes-count {
            font-weight: bold;
            color: #059669;
            text-align: center;
        }

        .status {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            text-align: center;
            display: inline-block;
        }

        .status-approved {
            background-color: #dcfce7;
            color: #166534;
        }

        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .status-other {
            background-color: #f1f5f9;
            color: #475569;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
<div class="header">
    <h1>Top 50 Candidates Report</h1>
    <h2>{{ $election->name }}</h2>
    @if($election->date_start || $election->date_end)
        <div class="meta">
            @if($election->date_start)
                Election Start: {{ \Carbon\Carbon::parse($election->date_start)->format('M d, Y') }}
            @endif
            @if($election->date_end)
                | Election End: {{ \Carbon\Carbon::parse($election->date_end)->format('M d, Y') }}
            @endif
        </div>
    @endif
    <div class="meta">Generated: {{ $generatedAt }}</div>
</div>

<table>
    <thead>
    <tr>
        <th style="width: 50px;">#</th>
        <th style="width: 200px;">Candidate</th>
        <th style="width: 80px;">Country</th>
        <th style="width: 120px;">Profession</th>
        <th style="width: 100px;">Role</th>
        <th style="width: 80px;">Votes</th>
    </tr>
    </thead>
    <tbody>
    @foreach($candidates as $index => $candidate)
        <tr>
            <td class="rank {{ $index < 3 ? 'rank-top3' : '' }}">
                @if($index === 0)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                         style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10" fill="#FFD700" stroke="#DAA520" stroke-width="1.5"/>
                        <path d="M11 17V8H10M11 8L9.5 9.5" stroke="#8B6508" stroke-width="1.5" stroke-linecap="round"
                              stroke-linejoin="round" fill="none"/>
                    </svg>
                @elseif($index === 1)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                         style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10" fill="#C0C0C0" stroke="#A9A9A9" stroke-width="1.5"/>
                        <path d="M10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 10.1046 13.1046 11 12 11C11 11 10 12.1046 10 13.2092V17H14"
                              stroke="#696969" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                              fill="none"/>
                    </svg>
                @elseif($index === 2)
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                         style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10" fill="#CD7F32" stroke="#A52A2A" stroke-width="1.5"/>
                        <path d="M10 7.5H14C13 8.5 12.5 10.5 13 12C13.5 13.5 14 13.5 14 14.5C14 16 13 17 11.5 17"
                              stroke="#800000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                              fill="none"/>
                    </svg>
                @else
                    {{ $index + 1 }}
                @endif
            </td>
            <td>
                <div class="candidate-name">{{ $candidate->first_name }} {{ $candidate->last_name }}</div>
                @if($candidate->city)
                    <div class="candidate-details">{{ $candidate->city }}</div>
                @endif
            </td>
            <td>{{ strtoupper($candidate->country_code) }}</td>
            <td>{{ $candidate->profession ?? 'N/A' }}</td>
            <td>{{ $candidate->role ?? 'N/A' }}</td>
            <td class="votes-count">{{ $candidate->votes_count }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

<div class="footer">
    <p>This report was automatically generated by the Election System</p>
    <p>Total candidates shown: {{ $candidates->count() }} | Election ID: {{ $election->id }}</p>
</div>
</body>
</html>
