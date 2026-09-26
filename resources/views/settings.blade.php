@extends('adminlte::page')

@section('plugins.TempusDominusBs4', true)

@section('title', 'Settings')

@section('content_header')
    <h2>Settings</h2>
@endsection

@section('content')
    <form action="{{ route('settings.update') }}" method="POST">
        @csrf
        @method('PUT')
        <x-request-hidden-fields/>

        <div class="accordion mb-3" id="settingsAccordion">
            @foreach($sections as $sectionKey => $section)
                @php
                    $isFirst = $loop->first;
                    $collapseId = 'collapse_' . \Illuminate\Support\Str::slug($sectionKey);
                    $headingId = 'heading_' . \Illuminate\Support\Str::slug($sectionKey);
                @endphp

                <div class="card card-outline card-primary mb-2">
                    <div class="card-header" id="{{ $headingId }}">
                        <h2 class="mb-0">
                            <button class="btn btn-link btn-block text-left text-dark font-weight-bold d-flex justify-content-between align-items-center text-decoration-none"
                                    type="button"
                                    data-toggle="collapse"
                                    data-target="#{{ $collapseId }}"
                                    aria-expanded="{{ $isFirst ? 'true' : 'false' }}"
                                    aria-controls="{{ $collapseId }}">
                                <span>{{ $section['section'] ?? ucfirst($sectionKey) }}</span>
                                <i class="fas fa-chevron-down text-muted"></i>
                            </button>
                        </h2>
                    </div>

                    <div id="{{ $collapseId }}"
                         class="collapse {{ $isFirst ? 'show' : '' }}"
                         aria-labelledby="{{ $headingId }}"
                         data-parent="#settingsAccordion">
                        <div class="card-body">
                            @foreach($section['keys'] as $keyEnum)
                                @php
                                    $type = $keyEnum->type();
                                    $key = $keyEnum->key();
                                    $value = old('settings.' . $key, $values[$key] ?? '');
                                @endphp

                                <div class="form-group row mb-3">
                                    <label for="settings_{{ $key }}" class="col-sm-3 col-form-label">
                                        {{ $keyEnum->label() }}
                                    </label>
                                    <div class="col-sm-9">
                                        @if($type === 'boolean')
                                            <select class="form-control @error('settings.' . $key) is-invalid @enderror"
                                                    id="settings_{{ $key }}"
                                                    name="settings[{{ $key }}]">
                                                <option value="1" {{ (string)$value === '1' ? 'selected' : '' }}>
                                                    Enabled
                                                </option>
                                                <option value="0" {{ (string)$value === '0' ? 'selected' : '' }}>
                                                    Disabled
                                                </option>
                                            </select>
                                        @elseif($type === 'textarea')
                                            <textarea
                                                    class="form-control @error('settings.' . $key) is-invalid @enderror"
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
                                        <span class="invalid-feedback" role="alert">
                                                <strong>{{ $message }}</strong>
                                            </span>
                                        @enderror
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="card">
            <div class="card-body text-right">
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </div>
        </div>
    </form>
@endsection