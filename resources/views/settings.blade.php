@extends('adminlte::page')

@section('plugins.TempusDominusBs4', true)

@section('title','Settings')

@section('content_header')
    <h2>Settings</h2>
@endsection

@section('content')
    <div class="card">
        <div class="card-body">
            <form action="{{ route('settings.update') }}" method="POST">
                @csrf
                @method('PUT')
                <x-request-hidden-fields/>

                @foreach($settingKeys as $keyEnum)
                    <div class="form-group row mb-3">
                        <label for="settings_{{ $keyEnum->key() }}" class="col-sm-3 col-form-label">
                            {{ $keyEnum->label() }}
                        </label>
                        <div class="col-sm-9">
                            @php
                                $type = $keyEnum->type();
                                $key = $keyEnum->key();
                                $value = old('settings.' . $key, $settings[$key] ?? '');
                            @endphp

                            @if($type === 'boolean')
                                <select class="form-control @error('settings.' . $key) is-invalid @enderror"
                                        id="settings_{{ $key }}"
                                        name="settings[{{ $key }}]">
                                    <option value="1" {{ $value == '1' ? 'selected' : '' }}>Enabled</option>
                                    <option value="0" {{ $value == '0' ? 'selected' : '' }}>Disabled</option>
                                </select>
                            @elseif($type === 'textarea')
                                <textarea class="form-control @error('settings.' . $key) is-invalid @enderror"
                                          id="settings_{{ $key }}"
                                          name="settings[{{ $key }}]"
                                          rows="3">{{ $value }}</textarea>
                            @elseif($type === 'number')
                                <input type="number"
                                       class="form-control @error('settings.' . $key) is-invalid @enderror"
                                       id="settings_{{ $key }}"
                                       name="settings[{{ $key }}]"
                                       value="{{ $value }}">
                            @elseif($type === 'email')
                                <input type="email"
                                       class="form-control @error('settings.' . $key) is-invalid @enderror"
                                       id="settings_{{ $key }}"
                                       name="settings[{{ $key }}]"
                                       value="{{ $value }}">
                            @else
                                <input type="text"
                                       class="form-control @error('settings.' . $key) is-invalid @enderror"
                                       id="settings_{{ $key }}"
                                       name="settings[{{ $key }}]"
                                       value="{{ $value }}">
                            @endif

                            @error('settings.' . $key)
                            <span class="invalid-feedback" role="button">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>
                    </div>
                @endforeach

                <div class="form-group row">
                    <div class="col-sm-9 offset-sm-3">
                        <button type="submit" class="btn btn-primary">Save Settings</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
@endsection