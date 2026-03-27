@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('title','Moderation')

@section('content_header')
    <h2>Moderation</h2>
@endsection

@php
    $heads = [
        'Name',
        ['label' => 'Election', 'width' => 40],
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

   $data=collect();

    foreach ($candidates as $item) {
        $data->push([
            $item->first_name.' '.$item->last_name,
            $item->election->name,
            $item->reason_for_nomination,
            '<nobr>'.sprintf($btnEdit,route('election:candidate:edit',['candidate'=>$item,'election'=>$item->election])).
            sprintf($btnApprove,$item->id).
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
        ['label' => 'Election', 'width' => 40],
        ['label' => 'Anti-fraud score', 'width' => 40],
        ['label' => 'Actions', 'no-export' => true, 'width' => 5],
    ];

$btnApprove = '<button class="btn btn-xs btn-default text-success mx-1 approve-vote" title="Approve" data-id="%s">
                   <i class="fa fa-lg fa-fw fa-check"></i>
               </button>';

$btnReject = '<button class="btn btn-xs btn-default text-danger mx-1 reject-vote" title="Reject" data-id="%s">
                  <i class="fa fa-lg fa-fw fa-times"></i>
              </button>';

   $data=collect();

    foreach ($votes as $item) {
        $data->push([
            $item->candidate->first_name.' '.$item->candidate->last_name,
            $item->candidate->election->name,
            3,
            '<nobr>'.sprintf($btnApprove,$item->id).
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
        });
    </script>
@endsection