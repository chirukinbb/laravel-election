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
            3,
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
                    },
                    success: function (response) {
                        if (response.success) {
                            row.hide()
                        }
                    }
                });
            });

            // Candidate reject
            $('button.reject-candidate').on('click', function () {
                const row = $(this).closest('tr')
                const candidate_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.candidate.reject')}}',
                    type: 'POST',
                    data: {candidate_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    },
                    success: function (response) {
                        if (response.success) {
                            row.hide()
                        }
                    }
                });
            });

            // Vote approve
            $('button.approve-vote').on('click', function () {
                const row = $(this).closest('tr')
                const vote_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.vote.reject')}}',
                    type: 'POST',
                    data: {vote_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    },
                    success: function (response) {
                        if (response.success) {
                            row.hide()
                        }
                    }
                });
            });

            // Vote reject
            $('button.reject-vote').on('click', function () {
                const row = $(this).closest('tr')
                const vote_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.vote.reject')}}',
                    type: 'POST',
                    data: {vote_id, reason},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    },
                    success: function (response) {
                        if (response.success) {
                            row.hide()
                        }
                    }
                });
            });

            // Vote flag suspicious
            $('button.flag-suspicious-candidate').on('click', function () {
                const row = $(this).closest('tr')
                const vote_id = $(this).data('id');
                $.ajax({
                    url: '{{route('admin.vote.flag')}}',
                    type: 'POST',
                    data: {vote_id},
                    headers: {
                        'Authorization': 'Bearer ' + apiToken
                    },
                    success: function (response) {
                        if (response.success) {
                            row.hide()
                        }
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
                const row = $(this).closest('tr')

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
                    },
                    success: function (response) {
                        if (response.success) {
                            $('#modalMin').modal('hide');
                            row.hide()
                        }
                    }
                });
            });
        });
    </script>
@endsection