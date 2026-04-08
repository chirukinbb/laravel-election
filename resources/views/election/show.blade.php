@extends('adminlte::page')

@section('title','Election')

@section('content_header')
    <h2>Election "{{$election->name}}"</h2>
@endsection

@php
    $heads = [
        ['label' => '#', 'width' => 5],
        'Name',
        'Country',
        ['label' => 'Votes', 'width' => 20],
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

foreach (
    $election->candidates()
        ->whereHas('votes', function ($q) {
            $q->where('status', \App\Enums\VoteStatusEnum::Verified->name);
        })
        ->withCount([
            'votes as approved_votes_count' => function ($q) {
                $q->where('status', \App\Enums\VoteStatusEnum::Verified->name);
            }
        ])
        ->orderByDesc('approved_votes_count')
        ->limit(50)
        ->get() as $place=>$item
) {
        $data->push([
            $place+1,
            $item->first_name.' '.$item->last_name,
            config('election.countries.'.$item->country_code),
            $item->votes()->where('status',\App\Enums\VoteStatusEnum::Verified->name)->count(),
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

@section('content')
    <x-adminlte-card>
        <div class="row">
            <div class="col-6">
                <h4>Start Date</h4>
                <p>{{$election->date_start}}</p>
            </div>
            <div class="col-6">
                <h4>End Date</h4>
                <p>{{$election->date_end}}</p>
            </div>
        </div>
    </x-adminlte-card>
    <x-adminlte-card title="CandidatesTOP50">
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
@endsection
