@extends('adminlte::page')

@section('title','Create Candidate')

@section('content')
    <form action="{{route('election:candidate:store',compact('election'))}}" method="post">
        @csrf
        <h5>Create Candidate</h5>
        <div class="row mb-3">
            <div class="col-6">
                <label for="first_name" class="form-label">First Name</label><br>
                <input type="text" class="form-control" id="first_name" name="first_name">
                @if($errors->get('first_name'))
                    <div class="form-text text-danger">{{$errors->get('first_name')[0]}}</div>
                @endif
            </div>
            <div class="col-6">
                <label for="last_name" class="form-label">Last Name</label><br>
                <input type="text" class="form-control" id="last_name" name="last_name">
                @if($errors->get('last_name'))
                    <div class="form-text text-danger">{{$errors->get('last_name')[0]}}</div>
                @endif
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-6">
                <label for="country_code" class="form-label">Country</label><br>
                <select class="form-control" id="country_code" name="country_code">
                    @foreach(config('election.countries') as $code => $name)
                        <option value="{{$code}}">{{$name}}</option>
                    @endforeach
                </select>
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
        <div class="d-flex justify-content-center">
            <button class="btn btn-primary" type="submit">Create</button>
        </div>
    </form>
@endsection

@section('script')
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet"/>
    <style>
        .select2-selection__rendered {
            display: block;
            width: 100%;
            padding: .375rem .75rem;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.5;
            color: var(--bs-body-color);
            background-color: var(--bs-body-bg);
            background-clip: padding-box;
            border: var(--bs-border-width) solid var(--bs-border-color);
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            border-radius: var(--bs-border-radius);
            transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script>
        $(document).ready(function () {
            $('#country_code').select2();
        });
    </script>
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