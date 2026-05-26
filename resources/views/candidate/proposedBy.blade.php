@extends('adminlte::page')

@section('title', 'Proposed By')

@section('content_header')
    <div class="d-flex justify-content-between">
        <h2>Proposed By</h2>
    </div>
@endsection

@section('content')
    <x-adminlte-card>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label><strong>First Name:</strong></label>
                    <p>{{ $user->first_name ?? 'N/A' }}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label><strong>Last Name:</strong></label>
                    <p>{{ $user->last_name ?? 'N/A' }}</p>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label><strong>Email:</strong></label>
                    <p>{{ $user->email ?? 'N/A' }}</p>
                </div>
            </div>
        </div>
    </x-adminlte-card>
@endsection
