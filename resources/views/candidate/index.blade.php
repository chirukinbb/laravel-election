@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('title','Candidates')

@section('content_header')
    <div class="d-flex justify-content-between">
        <h2>Candidates</h2>
        <div>
            <a href="{{route('election:candidate:create',compact('election'))}}" class="btn btn-primary">Create</a>
        </div>
    </div>
@endsection

@php
    $heads = [
        'Name',
        ['label' => 'Country', 'width' => 20],
        ['label' => 'Votes', 'width' => 20],
        ['label' => 'Actions', 'no-export' => true, 'width' => 5]
    ];

$btnEdit = '<a class="btn btn-xs btn-default text-primary mx-1 " title="Edit" href="%s">
                <i class="fa fa-lg fa-fw fa-pen"></i>
            </a>';
$btnDelete = '<a class="btn btn-xs btn-default text-danger mx-1 " title="Delete" href="%s">
                  <i class="fa fa-lg fa-fw fa-trash"></i>
              </a>';

   $data=collect();

    foreach ($election->candidates as $item) {
        $data->push([
            $item->first_name.' '.$item->last_name,
            config('election.countries.'.$item->country_code),
            $item->votes()->where('status',\App\Enums\VoteStatusEnum::Verified->name)->count(),
            '<nobr>'.sprintf($btnEdit,route('election:candidate:edit',['candidate'=>$item,'election'=>$election])).
            sprintf($btnDelete,route('election:candidate:delete',['candidate'=>$item,'election'=>$election])).'</nobr>'
]);
    }

    $config = [
        'data' => $data->toArray(),
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, null],
    ];
@endphp

@section('content')
    <x-adminlte-card>
        <x-adminlte-datatable id="elections" :heads="$heads">
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
