@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('plugins.BootstrapSelect', true)

@section('title','Candidates')

@php
    $config = [
        "liveSearch" => true,
        "liveSearchPlaceholder" => "Search...",
        "showTick" => true,
        "actionsBox" => true,
    ];
@endphp

@section('content_header')
    <div class="d-flex justify-content-between">
        <h2>Candidates</h2>
        <div>
            <button class="btn btn-primary" id="bind" data-toggle="modal" data-target="#modalMin"> Bind to Election
            </button>
        </div>
    </div>
@endsection

@php
    $heads = [
        'Name',
        ['label' => 'Country', 'width' => 10],
        ['label' => 'Category', 'width' => 20],
        ['label' => 'Reason for Nomination', 'width' => 20],
        ['label' => '<a>Select all</a>', 'no-export' => true, 'width' => 5,'classes'=>'select-all']
    ];

$btnEdit = '<a class="btn btn-xs btn-default text-primary mx-1 " title="Edit" href="%s">
                <i class="fa fa-lg fa-fw fa-pen"></i>
            </a>';
$btnDelete = '<a class="btn btn-xs btn-default text-danger mx-1 " title="Delete" href="%s">
                  <i class="fa fa-lg fa-fw fa-trash"></i>
              </a>';

   $data=collect();

    foreach ($candidates as $item) {
        $data->push([
            $item->first_name.' '.$item->last_name,
            config('election.countries.'.$item->country_code),
            $item->category,
            $item->reason_for_nomination,
            '<nobr><input type="checkbox" name="candidates[]" value="'.$item->id.'"></nobr>'
]);
    }

    $config = [
        'data' => $data->toArray(),
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, null,['orderable' => false,'type'=>'html']],
    ];
@endphp

@section('content')
    <x-adminlte-card>
        <x-adminlte-datatable id="table2" :heads="$heads" head-theme="light" :config="$config"
                              striped hoverable bordered compressed/>
    </x-adminlte-card>

    {{-- Minimal --}}
    <x-adminlte-modal id="modalMin" title="Bind with...">
        <div>
            <x-adminlte-select-bs id="bind_with" name="bind_with" :config="$config">
                @foreach($elections as $e)
                    <option value="{{$e->id}}">{{$e->name}}</option>
                @endforeach
            </x-adminlte-select-bs>
        </div>
        <x-slot name="footerSlot">
            <x-adminlte-button class="mr-auto" theme="success" label="Bind" id="bind_btn"/>
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
            key: '{{ env("REVERB_APP_KEY") }}',
            wsHost: '{{env('APP_DOMAIN')}}',
            @if(env('APP_ENV') === 'local')
            wsPort: 8080,
            wssPort: 8080,
            @endif
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
        });
    </script>
    <script id="table__customization">
        let candidates = []

        $('body').on('draw.dt', function () {
            $('.select-all').html('<input type="checkbox" id="candidates">')
        })

        $('body').on('change', 'input#candidates', function () {
            $('body').find('input').each((i, el) => $(el).prop('checked', $(this).prop('checked')))
        })

        $('#bind').on('click', function () {
            $('table tr input').each((i, el) => {
                if ($(el).prop('checked')) {
                    candidates.push(el.value)
                }
            })
        })

        $('#bind_btn').on('click', function () {
            $.ajax({
                url: '{{route('admin.candidate.bind')}}',
                type: 'POST',
                data: {candidates, election_id: $('#bind_with').val()},
                headers: {
                    'Authorization': 'Bearer {{auth()->user()->createToken(\App\Enums\RoleEnum::ADMIN->name)->plainTextToken}}'
                }
            });
        })

        window.Echo.channel('admin')
            .listen('.vote.approved', (data) => {

                const voteRow = $(`button.approve-vote[data-id="${data.vote_id}"]`).closest('tr');
                if (voteRow.length) {
                    voteRow.css('background-color', '#d4edda');
                    voteRow.fadeOut(1000, function () {
                        $(this).remove();

                        if ($.fn.DataTable.isDataTable('#votes')) {
                            $('#votes').DataTable().draw();
                        }
                    });

                    showToast(`Vote for ${data.candidate_name} was approved`, 'success');
                }
            })
    </script>
@endsection