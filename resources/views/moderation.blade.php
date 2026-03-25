@extends('adminlte::page')

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

$btnEdit = '<a class="btn btn-xs btn-default text-primary mx-1" title="Edit" href="%s">
                <i class="fa fa-lg fa-fw fa-pen"></i>
            </a>';

$btnApprove = '<button class="btn btn-xs btn-default text-success mx-1" title="Approve" data-url="%s">
                   <i class="fa fa-lg fa-fw fa-check"></i>
               </button>';

$btnReject = '<button class="btn btn-xs btn-default text-danger mx-1" title="Reject" data-url="%s">
                  <i class="fa fa-lg fa-fw fa-times"></i>
              </button>';

   $data=collect();

    foreach ($candidates as $item) {
        $data->push([
            $item->first_name.' '.$item->last_name,
            $item->election->name,
            $item->reason_for_nomination,
            '<nobr>'.sprintf($btnEdit,route('election:candidate:edit',['candidate'=>$item,'election'=>$item->election])).
            sprintf($btnApprove,'').
            sprintf($btnReject,'').'</nobr>'
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

$btnApprove = '<button class="btn btn-xs btn-default text-success mx-1" title="Approve" data-url="%s">
                   <i class="fa fa-lg fa-fw fa-check"></i>
               </button>';

$btnReject = '<button class="btn btn-xs btn-default text-danger mx-1" title="Reject" data-url="%s">
                  <i class="fa fa-lg fa-fw fa-times"></i>
              </button>';

   $data=collect();

    foreach ($votes as $item) {
        $data->push([
            $item->candidate->first_name.' '.$item->candidate->last_name,
            $item->candidate->election->name,
            3,
            '<nobr>'.sprintf($btnApprove,'').
            sprintf($btnReject,'').'</nobr>'
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
        $(document).ready(function () {
            $('button').on('click', function () {
                const url = $(this).data('url')
                $.get(url)
            })
        })
    </script>
@endsection