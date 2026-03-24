@extends('layouts.app')

@section('title','Dashboard')

@section('content')
    <h5>Welcome to your dashboard!</h5>
    <p>You have successfully logged in.</p>
    <div class="alert alert-info">
        <i class="bi bi-info-circle"></i> This is a protected page. Only authenticated users can see it.
    </div>
@endsection