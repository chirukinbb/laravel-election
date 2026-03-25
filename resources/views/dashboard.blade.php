@extends('adminlte::page')

@section('title','Dashboard')

@section('content_header')
    <h2>Welcome to your dashboard!</h2>
@endsection

@section('content')
    <div class="container-fluid">
        <div class="row">

            <!-- Total Votes -->
            <div class="col-md-4 col-xl-3">
                <x-adminlte-card>
                    <div class="card-body">
                        <h6 class="text-muted">Total Votes</h6>
                        <h2 class="fw-bold">{{number_format($totalVotes,0,'.',',')}}</h2>
                    </div>
                </x-adminlte-card>
            </div>

            <!-- Approved Candidates -->
            <div class="col-md-4 col-xl-3">
                <x-adminlte-card>
                    <div class="card-body">
                        <h6 class="text-muted">Approved Candidates</h6>
                        <h2 class="fw-bold">{{number_format($approvedCandidates,0,'.',',')}}</h2>
                    </div>
                </x-adminlte-card>
            </div>

            <!-- Pending Candidates -->
            <div class="col-md-4 col-xl-3">
                <x-adminlte-card>
                    <div class="card-body">
                        <h6 class="text-muted">Pending Candidates</h6>
                        <h2 class="fw-bold text-warning">{{number_format($pendingCandidates,0,'.',',')}}</h2>
                    </div>
                </x-adminlte-card>
            </div>

            <!-- Suspicious Votes -->
            <div class="col-md-4 col-xl-3">
                <x-adminlte-card>
                    <div class="card-body">
                        <h6 class="text-muted">Suspicious Votes</h6>
                        <h2 class="fw-bold text-danger">{{number_format($suspiciousVotes,0,'.',',')}}</h2>
                    </div>
                </x-adminlte-card>
            </div>

            <!-- Conversion -->
            <div class="col-md-6 col-xl-3">
                <x-adminlte-card>
                    <div class="card-body">
                        <h6 class="text-muted">Conversion Rate</h6>
                        <h2 class="fw-bold">{{number_format($conversion,0,'.',',')}}%</h2>
                        <small class="text-muted">Visitors → Verified Votes</small>
                    </div>
                </x-adminlte-card>
            </div>

            <!-- Top 50 -->
            <div class="col-md-6 col-xl-9">
                <x-adminlte-card>
                    <div class="card-body">
                        <h6 class="mb-3">Current Top 50</h6>

                        <div class="table-responsive">
                            <table class="table table-sm align-middle">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Country</th>
                                    <th>Name</th>
                                    <th>Votes</th>
                                </tr>
                                </thead>
                                <tbody>

                                <tr>
                                    <td>1</td>
                                    <td>🇵🇹 Portugal</td>
                                    <td>Cristiano Ronaldo</td>
                                    <td class="fw-bold">312</td>
                                </tr>

                                <tr>
                                    <td>2</td>
                                    <td>🇺🇸 USA</td>
                                    <td>Elon Musk</td>
                                    <td class="fw-bold">298</td>
                                </tr>

                                <tr>
                                    <td>3</td>
                                    <td>🇦🇷 Argentina</td>
                                    <td>Lionel Messi</td>
                                    <td class="fw-bold">287</td>
                                </tr>

                                <!-- repeat up to 50 -->

                                </tbody>
                            </table>
                        </div>

                    </div>
                </x-adminlte-card>
            </div>

        </div>
    </div>
@endsection