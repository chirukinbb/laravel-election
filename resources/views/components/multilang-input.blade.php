@php
    $locales = ['ru' => 'RU', 'en' => 'EN', 'es' => 'ES'];
@endphp

<div class="card card-primary card-outline card-outline-tabs">
    <div class="card-header p-0 border-bottom-0">
        <ul class="nav nav-tabs" id="setting-tabs-{{ $key }}" role="tablist">
            @foreach($locales as $locale => $label)
                <li class="nav-item">
                    <a class="nav-link @if($loop->first) active @endif"
                       id="tab-{{ $key }}-{{ $locale }}"
                       data-toggle="tab"
                       data-bs-toggle="tab"
                       href="#content-{{ $key }}-{{ $locale }}"
                       role="tab"
                       aria-controls="content-{{ $key }}-{{ $locale }}"
                       aria-selected="{{ $loop->first ? 'true' : 'false' }}">
                        {{ $label }}
                    </a>
                </li>
            @endforeach
        </ul>
    </div>

    <div class="card-body">
        <div class="tab-content" id="setting-tabs-content-{{ $key }}">
            @foreach($locales as $locale => $label)

                <div class="tab-pane fade @if($loop->first) show active @endif"
                     id="content-{{ $key }}-{{ $locale }}"
                     role="tabpanel"
                     aria-labelledby="tab-{{ $key }}-{{ $locale }}">

                    <input type="text"
                           class="form-control @error('settings.' . $key . '.' . $locale) is-invalid @enderror"
                           id="settings_{{ $key }}_{{ $locale }}"
                           name="settings[{{ $key }}][{{ $locale }}]"
                           value="{{ old('settings.' . $key . '.' . $locale, $value[$locale] ?? '') }}"
                           placeholder="Значение ({{ $label }})">

                    @error('settings.' . $key . '.' . $locale)
                    <span class="invalid-feedback" role="alert">
                            <strong>{{ $message }}</strong>
                        </span>
                    @enderror
                </div>
            @endforeach
        </div>
    </div>
</div>