@extends('adminlte::page')

@section('plugins.BootstrapSelect', true)

@section('title','Create Candidate')

@section('content_header')
    <h2>Create Candidate</h2>
@endsection

@section('content')
    <x-adminlte-card>
        <form action="{{route('election:candidate:store',compact('election'))}}" method="post">
            @csrf
            <div class="row mb-3">
                <div class="col-6">
                    <label for="first_name" class="form-label">
                        First Name
                        <span class="text-danger">*</span>
                    </label><br>
                    <input type="text" class="form-control" id="first_name" name="first_name">
                    @if($errors->get('first_name'))
                        <div class="form-text text-danger">{{$errors->get('first_name')[0]}}</div>
                    @endif
                </div>
                <div class="col-6">
                    <label for="first_name" class="form-label">
                        Last Name
                        <span class="text-danger">*</span>
                    </label><br>
                    <input type="text" class="form-control" id="last_name" name="last_name">
                    @if($errors->get('last_name'))
                        <div class="form-text text-danger">{{$errors->get('last_name')[0]}}</div>
                    @endif
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-6">
                    @php
                        $config = [
                            "liveSearch" => true,
                            "liveSearchPlaceholder" => "Search...",
                            "showTick" => true,
                            "actionsBox" => true,
                        ];
                    @endphp

                    <x-adminlte-select-bs id="country_code" name="country_code" label="Country" :config="$config">
                        @foreach(config('election.countries') as $code => $name)
                            <option value="{{$code}}">{{$name}}</option>
                        @endforeach
                    </x-adminlte-select-bs>
                    @if($errors->get('country_code'))
                        <div class="form-text text-danger">{{$errors->get('country_code')[0]}}</div>
                    @endif
                </div>
                <div class="col-6">
                    <label for="city" class="form-label">City</label><br>
                    <input type="text" class="form-control" id="city" name="city">
                    @if($errors->get('city'))
                        <div class="form-text text-danger">{{$errors->get('city')[0]}}</div>
                    @endif
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-6">
                    <label for="profession" class="form-label">Profession</label><br>
                    <input type="text" class="form-control" id="profession" name="profession">
                    @if($errors->get('profession'))
                        <div class="form-text text-danger">{{$errors->get('profession')[0]}}</div>
                    @endif
                </div>
                <div class="col-6">
                    <label for="role" class="form-label">Role</label><br>
                    <input type="text" class="form-control" id="role" name="role">
                    @if($errors->get('role'))
                        <div class="form-text text-danger">{{$errors->get('role')[0]}}</div>
                    @endif
                </div>
            </div>
            <div class="mb-3">
                <label for="website" class="form-label">Website</label><br>
                <input type="text" class="form-control" id="website" name="website">
                @if($errors->get('website'))
                    <div class="form-text text-danger">{{$errors->get('website')[0]}}</div>
                @endif
            </div>
            <div class="mb-3">
                <label for="socials" class="form-label">Socials</label><br>
                <div class="social-block mb-3" id="social-wrapper">
                    <div class="row mb-1">
                        <div class="col-4">
                            <select name="socials[]" id="socials" class="form-control">
                                @foreach(config('election.socials') as $i => $social)
                                    <option value="{{$i}}">{{$social}}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-6">
                            <input type="text" name="socials[]" class="form-control">
                        </div>
                        <div class="col-2">
                            <a href="#" class="btn btn-danger">Delete</a>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <button class="btn" id="add-social">Add Social</button>
                </div>
                @if($errors->get('socials'))
                    <div class="form-text text-danger">{{$errors->get('socials')[0]}}</div>
                @endif
                <template id="social">
                    <div class="row mb-1">
                        <div class="col-4">
                            <select name="socials[]" id="socials" class="form-control">
                                @foreach(config('election.socials') as $i => $social)
                                    <option value="{{$i}}">{{$social}}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-6">
                            <input type="text" name="socials[]" class="form-control">
                        </div>
                        <div class="col-2">
                            <a href="#" class="btn btn-danger">Delete</a>
                        </div>
                    </div>
                </template>
            </div>
            <div class="mb-3">
                <label for="photo_url" class="form-label">Photo URL</label><br>
                <input type="text" class="form-control" id="photo_url" name="photo_url">
                @if($errors->get('photo_url'))
                    <div class="form-text text-danger">{{$errors->get('photo_url')[0]}}</div>
                @endif
            </div>
            <button class="btn btn-primary" type="submit">Create</button>
        </form>
    </x-adminlte-card>
@endsection

@section('js')
    <script>
        $(document).ready(function () {
            // 1. Store the raw HTML string from the template
            const socTemplate = $('#social').html();
            const $container = $('#social-wrapper'); // The div where rows will be added

            // 2. Add Row Event
            $('#add-social').on('click', function (e) {
                e.preventDefault();
                // Wrap the string in $(), then append it
                $container.append($(socTemplate));
            });

            // 3. Delete Row Event (using Event Delegation)
            $container.on('click', '.btn-danger', function (e) {
                e.preventDefault();
                $(this).closest('.row').remove();
            });
        });
    </script>
@endsection