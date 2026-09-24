@extends('adminlte::page')

@section('title', 'Edit Filter')

@section('plugins.BootstrapSelect', true)
@section('plugins.BootstrapSlider', true)

@section('content_header')
    <h1>
        <i class="fas fa-user-edit"></i> Edit Filter
    </h1>
@stop

@php
    $config = [
        "liveSearch" => true,
        "liveSearchPlaceholder" => "Search...",
        "showTick" => true,
        "actionsBox" => true,
    ];

$radius = (string)old('radius', $user->filter->radius) ?? '100';
@endphp

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <div class="card card-primary">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-user-edit"></i>
                            Update Your Filter
                        </h3>
                    </div>

                    <form action="{{ route('users::filter.update') }}" method="POST">
                        @csrf
                        @method('PUT')

                        <div class="card-body">
                            @if(session('success'))
                                <div class="alert alert-success">
                                    {{ session('success') }}
                                </div>
                            @endif

                            <x-adminlte-select-bs id="categories" name="categories[]"
                                                  :config="array_merge($config, ['title' => 'Select Categories'])"
                                                  multiple>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}" @selected(collect(old('categories', $user->filter->categories))->contains($category->id))>{{ $category->title }}</option>
                                @endforeach
                            </x-adminlte-select-bs>

                            <div class="row">
                                <div class="col-6">
                                    <x-events::address-input placeholder="Address of center"
                                                             value="{{ old('address', $address) }}"/>
                                </div>
                                <div class="col-6">
                                    <x-adminlte-input-slider name="radius" min=5 max=10000 step=10 :value=$radius/>
                                </div>
                            </div>
                        </div>

                        <div class="card-footer">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Changes
                            </button>
                            <a href="{{ route('users::profile.index') }}" class="btn btn-secondary">
                                <i class="fas fa-times"></i> Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@stop

@section('css')
    <style>
        .slider.slider-horizontal {
            width: 100% !important;
        }
    </style>
@endsection