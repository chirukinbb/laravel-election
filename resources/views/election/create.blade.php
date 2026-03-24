@extends('layouts.app')

@section('title','Create Election')

@section('content')
    <form action="{{route('election:store')}}" method="post">
        @csrf
        <h5>Create Election</h5>
        <div class="mb-3">
            <label for="name" class="form-label">Name</label><br>
            <input type="text" class="form-control" id="name" name="name">
            @if($errors->get('name'))
                <div class="form-text text-danger">{{$errors->get('name')[0]}}</div>
            @endif
        </div>
        <div class="row mb-3">
            <div class="col-6">
                <label for="date_start" class="form-label">Start Date</label><br>
                <input type="text" class="form-control datepicker" id="date_start" name="date_start">
            </div>
            <div class="col-6">
                <label for="date_end" class="form-label">End Date</label><br>
                <input type="text" class="form-control datepicker" id="date_end" name="date_end">
            </div>
            @if($errors->get('date_start'))
                <div class="form-text text-danger">{{$errors->get('date_start')[0]}}</div>
            @endif
        </div>
        <div class="d-flex justify-content-center">
            <button class="btn btn-primary" type="submit">Create</button>
        </div>
    </form>
@endsection

@section('script')
    <script>
        $(document).ready(function () {
            $('.datepicker').datepicker({
                dateFormat: 'yy-mm-dd',
            });
        });
    </script>
@endsection