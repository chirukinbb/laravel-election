@extends('adminlte::page')

@section('plugins.TempusDominusBs4', true)

@section('title','Logs')

@section('content_header')
    <h2>Logs</h2>
@endsection

@section('content')
    <div style="max-height: 60vh;overflow:auto;" class="p-1 border col-12 mb-3" id="log">
        @foreach($logs as $line)
            <div style="font-family: monospace;">
                {{ $line }}
            </div>
        @endforeach
    </div>
    <a href="{{route('clean')}}" class="btn btn-primary">Clean</a>
@endsection

@section('js')
    <script>
        window.addEventListener('load', function () {
            const el = document.getElementById('log');
            el.scrollTop = el.scrollHeight;
        });
    </script>
@endsection