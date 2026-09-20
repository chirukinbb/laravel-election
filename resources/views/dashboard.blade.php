@extends('adminlte::page')

@section('plugins.Datatables', true)

@section('title','Dashboard')

<?php
/**
 * @var \App\Events\DashboardWidgetEvent $dashboard
 */
?>

@section('content_header')
    <div class="d-flex justify-content-between align-items-center">
        <h2>Dashboard</h2>
        {!! $dashboard->renderHeader() !!}
    </div>
@endsection

@section('content')
    <div class="container-fluid">


        {!! $dashboard->renderWidgets() !!}

    </div>
@endsection