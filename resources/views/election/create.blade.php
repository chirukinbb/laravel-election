@extends('adminlte::page')

@section('plugins.TempusDominusBs4', true)

@section('title','Create Election')

@section('content_header')
    <h2>Create Election</h2>
@endsection

@section('content')
    <x-adminlte-card>
        <form action="{{route('election:store')}}" method="post">
            @csrf
            <div class="mb-3">
                <label for="name" class="form-label">Name</label><br>
                <input type="text" class="form-control" id="name" name="name">
                @if($errors->get('name'))
                    <div class="form-text text-danger">{{$errors->get('name')[0]}}</div>
                @endif
            </div>
            <div class="row mb-3">
                <div class="col-6">
                    @php
                        $config = [
                            'format' => 'YYYY-MM-DD',
                            'dayViewHeaderFormat' => 'MMM YYYY',
                            'minDate' => "js:moment().startOf('month')",
                            'maxDate' => "js:moment().endOf('month')",
                            'daysOfWeekDisabled' => [0, 6],
                        ];
                    @endphp
                    <x-adminlte-input-date name="date_start" label="Start Date"
                                           :config="$config" placeholder="Choose a day...">
                        <x-slot name="appendSlot">
                            <div class="input-group-text bg-dark">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                        </x-slot>
                    </x-adminlte-input-date>
                </div>
                <div class="col-6">
                    <x-adminlte-input-date name="date_end" label="Start Date"
                                           :config="$config" placeholder="Choose a day...">
                        <x-slot name="appendSlot">
                            <div class="input-group-text bg-dark">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                        </x-slot>
                    </x-adminlte-input-date>
                </div>
                @if($errors->get('date_start'))
                    <div class="form-text text-danger">{{$errors->get('date_start')[0]}}</div>
                @endif
            </div>
            <button class="btn btn-primary" type="submit">Create</button>
        </form>
    </x-adminlte-card>
@endsection