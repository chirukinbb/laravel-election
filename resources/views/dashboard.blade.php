@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('title','Dashboard')

@section('content_header')
    <div class="d-flex justify-content-between align-items-center">
        <h2>Dashboard</h2>
        <div>
            <form action="{{ route('dashboard') }}" method="GET" class="form-inline">
                <select name="election" class="form-control form-control-sm" onchange="this.form.submit()">
                    @forelse($elections as $elec)
                        <option value="{{ $elec->id }}" {{ $selectedElection && $selectedElection->id == $elec->id ? 'selected' : '' }}>
                            {{ $elec->name }} ({{ $elec->date_start }} - {{ $elec->date_end }})
                        </option>
                    @empty
                        <option disabled>No elections available</option>
                    @endforelse
                </select>
            </form>
        </div>
    </div>
@endsection

@section('content')
    <div class="container-fluid">

        @if($selectedElection)
            <div class="row mb-3">
                <div class="col-12">
                    <div class="alert alert-info py-2 mb-0">
                        <strong>Election:</strong> {{ $selectedElection->name }}
                        <span class="text-muted">| {{ $selectedElection->date_start }} - {{ $selectedElection->date_end }}</span>
                    </div>
                </div>
            </div>
        @endif

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
                        <h2 class="fw-bold">{{number_format($conversion,2,'.',',')}}%</h2>
                        <small class="text-muted">Users → Verified Votes</small>
                    </div>
                </x-adminlte-card>
            </div>

        </div>

        <!-- Top 50 Candidates Table -->
        <div class="row">
            <div class="col-12">
                <x-adminlte-card>
                    <div class="table-responsive">
                        <table id="topCandidatesTable" class="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Country</th>
                                <th>Name</th>
                                <th style="width: 10%">Votes</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </x-adminlte-card>
            </div>
        </div>

    </div>
@endsection

@section('js')
    <script>
        $(document).ready(function () {
            let electionId = {{ $selectedElection ? $selectedElection->id : 'null' }};

            // Initialize DataTable
            let table = $('#topCandidatesTable').DataTable({
                processing: true,
                serverSide: false,
                ajax: {
                    url: '{{ route("dashboard.candidates") }}',
                    type: 'GET',
                    data: function (d) {
                        d.election_id = electionId;
                    },
                    dataSrc: function (response) {
                        if (response.success) {
                            return response.data;
                        }
                        return [];
                    },
                    error: function (xhr, error, thrown) {
                        console.error('Error loading candidates:', error);
                    }
                },
                columns: [
                    {data: 'rank', name: 'rank', orderable: false},
                    {data: 'country', name: 'country', orderable: true},
                    {data: 'name', name: 'name', orderable: true},
                    {data: 'votes', name: 'votes', orderable: true}
                ],
                order: [[3, 'desc']],
                pageLength: 10,
                columnDefs: [
                    {targets: 0, width: '5%'}
                ],
                language: {
                    processing: '<i class="fas fa-spinner fa-spin"></i> Loading candidates...',
                    emptyTable: 'No candidates available',
                    zeroRecords: 'No matching candidates found'
                }
            });

            // Reload table when election changes
            $('select[name="election"]').on('change', function () {
                electionId = $(this).val();
                table.ajax.reload();
            });
        });
    </script>
@endsection