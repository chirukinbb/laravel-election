@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('plugins.BootstrapSelect', true)

@section('title','Moderation')

@section('content_header')
    <h2>Moderation</h2>
@endsection

@php
    $heads = [
        'Name',
        ['label' => 'Election', 'width' => 20],
        'Reason for Nomination',
        ['label' => 'Actions', 'no-export' => true, 'width' => 5],
    ];

$btnEdit = '<a class="btn btn-xs btn-default text-primary mx-1 candidate" title="Edit" href="%s">
                <i class="fa fa-lg fa-fw fa-pen"></i>
            </a>';

$btnApprove = '<button class="btn btn-xs btn-default text-success mx-1 approve-candidate" title="Approve" data-id="%s">
                   <i class="fa fa-lg fa-fw fa-check"></i>
               </button>';

$btnReject = '<button class="btn btn-xs btn-default text-danger mx-1 reject-candidate" title="Reject" data-id="%s">
                  <i class="fa fa-lg fa-fw fa-times"></i>
              </button>';

$btnMerge = '<button class="btn btn-xs btn-default text-primary mx-1 merge-candidate" title="Merge" data-id="%s" data-toggle="modal" data-target="#modalMin">
                <i class="fa fa-lg fa-fw fa-object-group"></i>
            </button>';

   $data=collect();

    foreach ($candidates as $item) {
        $data->push([
            $item->first_name.' '.$item->last_name,
            $item->election->name,
            $item->reason_for_nomination,
            '<nobr>'.sprintf($btnEdit,route('election:candidate:edit',['candidate'=>$item,'election'=>$item->election])).
            sprintf($btnApprove,$item->id).sprintf($btnMerge,$item->id).
            sprintf($btnReject,$item->id).'</nobr>'
]);
    }

    $config = [
        'data' => $data->toArray(),
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, ['orderable' => false]],
    ];
@endphp
@php
    $heads2 = [
        'Vote for',
        ['label' => 'Election', 'width' => 20],
        ['label' => 'Anti-fraud score', 'width' => 20],
        ['label' => 'Actions', 'no-export' => true, 'width' => 5],
    ];

$btnApprove = '<button class="btn btn-xs btn-default text-success mx-1 approve-vote" title="Approve" data-id="%s">
                   <i class="fa fa-lg fa-fw fa-check"></i>
               </button>';

$btnReject = '<button class="btn btn-xs btn-default text-danger mx-1 reject-vote" title="Reject" data-id="%s">
                  <i class="fa fa-lg fa-fw fa-times"></i>
              </button>';

$btnFlagSuspicious = '<button class="btn btn-xs btn-default text-warning mx-1 flag-suspicious-candidate" title="Suspicious" data-id="%s">
                         <i class="fa fa-lg fa-fw fa-flag"></i>
                     </button>';

   $data=collect();

    foreach ($votes as $item) {
        $data->push([
            $item->candidate->first_name.' '.$item->candidate->last_name,
            $item->candidate->election->name,
            $item->anti_fraud_score,
            '<nobr>'.sprintf($btnApprove,$item->id).sprintf($btnFlagSuspicious,$item->id).
            sprintf($btnReject,$item->id).'</nobr>'
]);
    }

    $config2 = [
        'data' => $data->toArray(),
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, ['orderable' => false]],
    ];
@endphp

@section('content')
    <x-adminlte-card title="New Candidates">
        <x-adminlte-datatable id="candidates" :heads="$heads">
            @foreach($config['data'] as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{!! $cell !!}</td>
                    @endforeach
                </tr>
            @endforeach
        </x-adminlte-datatable>
    </x-adminlte-card>

    <x-adminlte-card title="New Votes">
        <x-adminlte-datatable id="votes" :heads="$heads2">
            @foreach($config2['data'] as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{!! $cell !!}</td>
                    @endforeach
                </tr>
            @endforeach
        </x-adminlte-datatable>
    </x-adminlte-card>
    @php
        $config = [
            "liveSearch" => true,
            "liveSearchPlaceholder" => "Search...",
            "showTick" => true,
            "actionsBox" => true,
        ];
    @endphp

    {{-- Minimal --}}
    <x-adminlte-modal id="modalMin" title="Merge with...">
        <div>
            <x-adminlte-select-bs id="merge_with" name="merge_with" :config="$config">
            </x-adminlte-select-bs>
        </div>
        <x-slot name="footerSlot">
            <x-adminlte-button class="mr-auto" theme="success" label="Merge" id="merge_btn"/>
            <x-adminlte-button theme="danger" label="Cancel" data-dismiss="modal"/>
        </x-slot>
    </x-adminlte-modal>
@endsection

@section('js')
    <script src="https://js.pusher.com/8.2.0/pusher.min.js"></script>
    <script src="https://unpkg.com/laravel-echo/dist/echo.iife.js"></script>
    <script>
        window.Echo = new Echo.default({
            broadcaster: 'reverb',
            key: '{{ env("VITE_REVERB_APP_KEY") }}',
            wsHost: window.location.hostname,
            wsPort: 8080,
            wssPort: 8080,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
        });
    </script>
    <script>
        const apiToken = '{{auth()->user()->createToken(\App\Enums\RoleEnum::ADMIN->name)->plainTextToken}}';

        $(document).ready(function () {
            // Candidate approve
            $('button.approve-candidate').on('click', function () {
                const row = $(this).closest('tr')
                const candidate_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.candidate.approve')}}',
                    type: 'POST',
                    data: {candidate_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    }
                });
            });

            // Candidate reject
            $('button.reject-candidate').on('click', function () {
                const candidate_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.candidate.reject')}}',
                    type: 'POST',
                    data: {candidate_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    }
                });
            });

            // Vote approve
            $('button.approve-vote').on('click', function () {
                const vote_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.vote.approve')}}',
                    type: 'POST',
                    data: {vote_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    }
                });
            });

            // Vote reject
            $('button.reject-vote').on('click', function () {
                const vote_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.vote.reject')}}',
                    type: 'POST',
                    data: {vote_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    }
                });
            });

            // Vote flag suspicious
            $('button.flag-suspicious-candidate').on('click', function () {
                const vote_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.vote.flag')}}',
                    type: 'POST',
                    data: {vote_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    }
                });
            });
        });
    </script>
    <script>
        $(document).ready(function () {
            let currentMergeCandidateId = null;
            const row = null

            $('button.merge-candidate').on('click', function () {
                currentMergeCandidateId = $(this).data('id');

                // Clear existing options
                $('#merge_with').empty();

                // Dynamically load candidates from API
                $.ajax({
                    url: '{{route('voting.candidates')}}',
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    },
                    success: function (response) {
                        if (response.success && response.data) {
                            response.data.forEach(function (candidate) {
                                if (candidate.id !== currentMergeCandidateId) {
                                    $('#merge_with').append(
                                        '<option value="' + candidate.id + '">' +
                                        candidate.first_name + ' ' + candidate.last_name +
                                        '</option>'
                                    );
                                }
                            });
                            $('#merge_with').selectpicker('refresh');
                        }
                    }
                });
            });

            // Handle merge button in modal footer
            $('#merge_btn').on('click', function () {
                const merge_with = $('#merge_with').val();
                console.log(merge_with, currentMergeCandidateId)
                if (!merge_with || !currentMergeCandidateId) {
                    return;
                }

                $.ajax({
                    url: '{{route('admin.candidate.merge')}}',
                    type: 'POST',
                    data: {
                        source_candidate_id: currentMergeCandidateId,
                        target_candidate_id: merge_with
                    },
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    }
                });
            });
        });
    </script>
    <script>
        // Real-time updates via Laravel Reverb
        $(document).ready(function () {
            // Initialize Echo if not already available
            if (typeof window.Echo === 'undefined') {
                console.error('Laravel Echo is not initialized');
                return;
            }

            // Listen for vote approval events
            window.Echo.channel('admin')
                .listen('.vote.approved', (data) => {
                    console.log('Vote approved:', data);

                    // Find and remove the vote row from the table
                    const voteRow = $(`button.approve-vote[data-id="${data.vote_id}"]`).closest('tr');
                    if (voteRow.length) {
                        voteRow.css('background-color', '#d4edda');
                        voteRow.fadeOut(1000, function () {
                            $(this).remove();

                            // Update the DataTable if it exists
                            if ($.fn.DataTable.isDataTable('#votes')) {
                                $('#votes').DataTable().draw();
                            }
                        });

                        showToast(`Vote for ${data.candidate_name} was approved`, 'success');
                    }
                })
                .listen('.vote.rejected', (data) => {
                    console.log('Vote rejected:', data);

                    const voteRow = $(`button.approve-vote[data-id="${data.vote_id}"]`).closest('tr');
                    if (voteRow.length) {
                        voteRow.css('background-color', '#f8d7da');
                        voteRow.fadeOut(1000, function () {
                            $(this).remove();

                            if ($.fn.DataTable.isDataTable('#votes')) {
                                $('#votes').DataTable().draw();
                            }
                        });

                        showToast(`Vote for ${data.candidate_name} was rejected`, 'error');
                    }
                })
                .listen('.vote.flagged', (data) => {
                    console.log('Vote flagged:', data);

                    const voteRow = $(`button.approve-vote[data-id="${data.vote_id}"]`).closest('tr');
                    if (voteRow.length) {
                        voteRow.css('background-color', '#fff3cd');
                        voteRow.fadeOut(1000, function () {
                            $(this).remove();

                            if ($.fn.DataTable.isDataTable('#votes')) {
                                $('#votes').DataTable().draw();
                            }
                        });

                        showToast(`Vote for ${data.candidate_name} was flagged as suspicious`, 'warning');
                    }
                })
                .listen('.candidate.approved', (data) => {
                    console.log('Candidate approved:', data);

                    const candidateRow = $(`button.approve-candidate[data-id="${data.candidate_id}"]`).closest('tr');
                    if (candidateRow.length) {
                        candidateRow.css('background-color', '#d4edda');
                        candidateRow.fadeOut(1000, function () {
                            $(this).remove();

                            if ($.fn.DataTable.isDataTable('#candidates')) {
                                $('#candidates').DataTable().draw();
                            }
                        });

                        showToast(`Candidate ${data.candidate_name} was approved`, 'success');
                    }
                })
                .listen('.candidate.rejected', (data) => {
                    console.log('Candidate rejected:', data);

                    const candidateRow = $(`button.approve-candidate[data-id="${data.candidate_id}"]`).closest('tr');
                    if (candidateRow.length) {
                        candidateRow.css('background-color', '#f8d7da');
                        candidateRow.fadeOut(1000, function () {
                            $(this).remove();

                            if ($.fn.DataTable.isDataTable('#candidates')) {
                                $('#candidates').DataTable().draw();
                            }
                        });

                        showToast(`Candidate ${data.candidate_name} was rejected`, 'error');
                    }
                })
                .listen('.candidate.merged', (data) => {
                    console.log('Candidate merged:', data);

                    const sourceRow = $(`button.merge-candidate[data-id="${data.source_candidate_id}"]`).closest('tr');
                    if (sourceRow.length) {
                        sourceRow.css('background-color', '#d1ecf1');
                        sourceRow.fadeOut(1000, function () {
                            $(this).remove();

                            if ($.fn.DataTable.isDataTable('#candidates')) {
                                $('#candidates').DataTable().draw();
                            }
                        });

                        showToast(`Candidate ${data.source_candidate_name} merged into ${data.target_candidate_name}`, 'info');
                    }
                });
        });

        // Toast notification helper
        function showToast(message, type = 'info') {
            const colors = {
                success: '#28a745',
                error: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8'
            };

            const toast = $(`
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${colors[type]};
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                ">
                    ${message}
                </div>
            `);

            $('body').append(toast);

            setTimeout(() => {
                toast.fadeOut(500, function () {
                    $(this).remove();
                });
            }, 3000);
        }
    </script>
    <style>
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    </style>
@endsection