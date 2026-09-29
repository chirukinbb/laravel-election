@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('title','Elections')

@section('content_header')
    <div class="d-flex justify-content-between">
        <h2>Elections</h2>
        <div>
            <a href="{{route('election:create',request()->all())}}" class="btn btn-primary">Create</a>
        </div>
    </div>
@endsection

@php
    $heads = [
        ['label' => 'ID', 'width' => 5],
        'Name',
        ['label' => 'Status', 'width' => 10],
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
$btnReport = '<a class="btn btn-xs btn-default text-success mx-1 " title="Report" href="%s" target="_blank">
                <i class="fa fa-lg fa-fw fa-file-pdf"></i>
            </a>';

   $data=collect();

    foreach ($elections as $item) {
        $reportPath = storage_path("app/election_{$item->id}_top50_report.pdf");
        $reportButton = file_exists($reportPath) 
            ? sprintf($btnReport, route('election:report', array_merge(['election' => $item],request()->all())))
            : '';
        
        // Determine available actions based on election status
        $actions = '';
        
        if ($item->isUpcoming()) {
            // Upcoming elections: can edit and delete
            $actions .= sprintf($btnEdit, route('election:edit', array_merge(['election' => $item], request()->all())));
            $actions .= sprintf($btnDelete, route('election:delete', array_merge(['election' => $item], request()->all())));
        } elseif ($item->isOngoing() || $item->isEnded()) {
            // Ongoing or ended elections: view only
            // No edit or delete buttons
        }
        
        // View and candidates buttons are always available
        $actions .= sprintf($btnDetails, route('election:candidate:list', array_merge(['election' => $item], request()->all())));
        $actions .= sprintf($btnView, route('election:show', array_merge(['election' => $item], request()->all())));
        $actions .= $reportButton;
        
        // Status badge
        $statusBadge = '';
        if ($item->isUpcoming()) {
            $statusBadge = '<span class="badge badge-info">Upcoming</span>';
        } elseif ($item->isOngoing()) {
            $statusBadge = '<span class="badge badge-success">Ongoing</span>';
        } else {
            $statusBadge = '<span class="badge badge-secondary">Ended</span>';
        }
        
        $data->push([
            $item->id,
            $item->name,
            $statusBadge,
            $item->date_start,
            $item->date_end,
            '<nobr>' . $actions . '</nobr>'
        ]);
    }

    $config = [
        'data' => $data->toArray(),
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, null, ['colspan' => 2]],
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