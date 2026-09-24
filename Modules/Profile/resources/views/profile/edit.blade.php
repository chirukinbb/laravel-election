@extends('adminlte::page')

@section('title', 'Edit Profile')

@section('plugins.BootstrapSelect', true)

@section('content_header')
    <h1>
        <i class="fas fa-user-edit"></i> Edit Profile
    </h1>
@stop

@php
    $config = [
        "liveSearch" => true,
        "liveSearchPlaceholder" => "Search...",
        "showTick" => true,
        "actionsBox" => true,
    ];
@endphp

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <div class="card card-primary">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-user-edit"></i>
                            Update Your Profile Information
                        </h3>
                    </div>

                    <form action="{{ route('users::profile.update') }}" method="POST">
                        @csrf
                        @method('PUT')

                        <div class="card-body">.
                            @if(session('success'))
                                <div class="alert alert-success">
                                    {{ session('success') }}
                                </div>
                            @endif

                            <x-adminlte-input name="name" placeholder="Visible Name"
                                              value="{{ old('name', $user->profile->name) }}"/>
                            <div class="row">
                                <div class="col-4">
                                    <x-adminlte-input name="phone" placeholder="Phone Number"
                                                      value="{{ old('phone', $user->profile->phone) }}"/>
                                    <input type="hidden" id="country_phone_code" name="country_phone_code"
                                           value="{{ old('country_phone_code', $user->profile->country_phone_code) }}">
                                    <input type="hidden" id="country_phone_iso" name="country_phone_iso"
                                           value="{{ old('country_phone_iso', $user->profile->country_phone_iso) }}">
                                </div>
                                <div class="col-4">
                                    <x-adminlte-select-bs id="languages" name="languages[]"
                                                          :config="array_merge($config, ['title' => 'Select Languages'])"
                                                          multiple>
                                        @foreach(config('users.languages') as $iso => $country)
                                            <option value="{{ $iso }}">{{ $country }}</option>
                                        @endforeach
                                    </x-adminlte-select-bs>
                                </div>
                            </div>
                            <x-adminlte-textarea name="bio" placeholder="About Yourself"
                                                 rows="5">{{ old('bio', $user->profile->bio) }}</x-adminlte-textarea>
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

@section('js')
    <script>
        console.log('Profile edit page loaded');
    </script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/imask/6.4.3/imask.min.js"></script>

    <script>
        const phoneInput = document.querySelector("#phone");
        let imaskInstance = null;

        const iti = window.intlTelInput(phoneInput, {
            initialCountry: "{{ old('country_phone_iso', $user->profile->country_phone_iso) ?? 'ua'}}",
            separateDialCode: true,
            nationalMode: true,
        });

        phoneInput.addEventListener("countrychange", setCountryPhoneCode)
        setCountryPhoneCode()

        function setCountryPhoneCode() {
            const country = iti.getSelectedCountryData();
            document.querySelector("#country_phone_code").value = country.dialCode;
            document.querySelector("#country_phone_iso").value = country.iso2;
        }

        function applyCountryMask() {
            const countryData = iti.getSelectedCountryData();

            let exampleNumber = intlTelInputUtils.getExampleNumber(
                countryData.iso2,
                false,
                intlTelInputUtils.numberFormat.NATIONAL
            );

            if (!exampleNumber) {
                exampleNumber = "000000000000";
            }

            const dialCode = countryData.dialCode;
            if (exampleNumber.startsWith('+' + dialCode)) {
                exampleNumber = exampleNumber.substring(dialCode.length + 1).trim();
            } else if (exampleNumber.startsWith(dialCode)) {
                exampleNumber = exampleNumber.substring(dialCode.length).trim();
            }

            const maskPattern = exampleNumber.replace(/[0-9]/g, '0');

            if (imaskInstance) {
                imaskInstance.destroy();
            }

            // Создаем новую точную маску
            imaskInstance = IMask(phoneInput, {
                mask: maskPattern,
                lazy: true,
                overwrite: true,
            });

            phoneInput.value = '';
        }

        setTimeout(applyCountryMask, 200);

        phoneInput.addEventListener('countrychange', applyCountryMask);
    </script>
@stop
