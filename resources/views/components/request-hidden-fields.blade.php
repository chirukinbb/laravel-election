@php
    $keys = $keys ?? request()->keys();
@endphp

@foreach($keys as $key)
    @if(request()->has($key))
        <input type="hidden" name="{{ $key }}" value="{{ request()->input($key) }}">
    @endif
@endforeach
