@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('title','Elections')

@section('content_header')
    <div class="d-flex justify-content-between">
        <h2>Elections</h2>
        <div>
            <a href="{{route('election:create')}}" class="btn btn-primary">Create</a>
        </div>
    </div>
@endsection

@php
    $heads = [
        'Name',
        ['label' => 'Start at', 'width' => 20],
        ['label' => 'End at', 'width' => 20],
        ['label' => 'Actions', 'no-export' => true, 'width' => 5]
    ];

$btnView = '<a class="btn btn-xs btn-default text-primary mx-1 " title="View" href="%s">
                <i class="fa fa-lg fa-fw fa-eye"></i>
            </a>';
$btnEdit = '<a class="btn btn-xs btn-default text-primary mx-1 " title="Edit" href="%s">
                <i class="fa fa-lg fa-fw fa-pen"></i>
            </a>';
$btnDelete = '<a class="btn btn-xs btn-default text-danger mx-1 " title="Delete" href="%s">
                  <i class="fa fa-lg fa-fw fa-trash"></i>
              </a>';
$btnDetails = '<a class="btn btn-xs btn-default text-teal mx-1 " title="Candidates" href="%s">
                   <i class="fa fa-lg fa-fw fa-users"></i>
               </a>';

   $data=collect();

    foreach ($elections as $item) {
        $data->push([
            $item->name,
            $item->date_start,
            $item->date_end,
            '<nobr>'.sprintf($btnEdit,route('election:edit',['election'=>$item])).
            sprintf($btnDetails,route('election:candidate:list',['election'=>$item])).
            sprintf($btnView,route('election:show',['election'=>$item])).
            sprintf($btnDelete,route('election:delete',['election'=>$item])).'</nobr>'
]);
    }

    $config = [
        'data' => $data->toArray(),
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, ['colspan' => 2]],
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