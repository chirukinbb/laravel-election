@extends('adminlte::page')

@section('title','Edit Candidate')

@section('content')
    <form action="{{route('election:candidate:update',compact('election','candidate'))}}" method="post">
        @csrf
        @method('PATCH')
        <h5>Edit Candidate</h5>
        <div class="row mb-3">
            <div class="col-6">
                <label for="first_name" class="form-label">First Name</label><br>
                <input type="text" class="form-control" id="first_name" name="first_name"
                       value="{{old('first_name',$candidate->first_name)}}">
                @if($errors->get('first_name'))
                    <div class="form-text text-danger">{{$errors->get('first_name')[0]}}</div>
                @endif
            </div>
            <div class="col-6">
                <label for="last_name" class="form-label">Last Name</label><br>
                <input type="text" class="form-control" id="last_name" name="last_name"
                       value="{{old('last_name',$candidate->last_name)}}">
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
                <input type="text" class="form-control" id="city" name="city" value="{{old('city',$candidate->city)}}">
                @if($errors->get('city'))
                    <div class="form-text text-danger">{{$errors->get('city')[0]}}</div>
                @endif
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-6">
                <label for="profession" class="form-label">Profession</label><br>
                <input type="text" class="form-control" id="profession" name="profession"
                       value="{{old('profession',$candidate->profession)}}">
                @if($errors->get('profession'))
                    <div class="form-text text-danger">{{$errors->get('profession')[0]}}</div>
                @endif
            </div>
            <div class="col-6">
                <label for="role" class="form-label">Role</label><br>
                <input type="text" class="form-control" id="role" name="role" value="{{old('role',$candidate->role)}}">
                @if($errors->get('role'))
                    <div class="form-text text-danger">{{$errors->get('role')[0]}}</div>
                @endif
            </div>
        </div>
        <div class="mb-3">
            <label for="website" class="form-label">Website</label><br>
            <input type="text" class="form-control" id="website" name="website"
                   value="{{old('website',$candidate->website)}}">
            @if($errors->get('website'))
                <div class="form-text text-danger">{{$errors->get('website')[0]}}</div>
            @endif
        </div>
        <div class="mb-3">
            <label for="socials" class="form-label">Socials</label><br>
            <div class="social-block mb-3" id="social-wrapper">
                @if($candidate->socials)
                    @for($i = 0; $i < count($candidate->socials); $i += 2)
                        <div class="row mb-1 social-row">
                            <div class="col-4">
                                {{-- Используем social_type[] --}}
                                <select name="socials[]" class="form-control">
                                    @foreach(config('election.socials') as $key => $label)
                                        <option value="{{ $key }}" @selected($key == $candidate->socials[$i])>
                                            {{ $label }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-6">
                                {{-- Используем social_link[] и индекс $i + 1 --}}
                                <input type="text" name="socials[]" class="form-control"
                                       value="{{ $candidate->socials[$i + 1] ?? '' }}">
                            </div>
                            <div class="col-2">
                                <a href="#" class="btn btn-danger btn-delete">Delete</a>
                            </div>
                        </div>
                    @endfor
                @endif
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
            <input type="text" class="form-control" id="photo_url" name="photo_url"
                   value="{{old('photo_url',$candidate->photo_url)}}">
            @if($errors->get('photo_url'))
                <div class="form-text text-danger">{{$errors->get('photo_url')[0]}}</div>
            @endif
        </div>
        <div class="mb-3">
            <label for="reason_for_nomination" class="form-label">Reason for Nomination</label><br>
            <textarea class="form-control" id="reason_for_nomination" name="reason_for_nomination"
                      rows="3">{{old('reason_for_nomination',$candidate->reason_for_nomination)}}</textarea>
            @if($errors->get('reason_for_nomination'))
                <div class="form-text text-danger">{{$errors->get('reason_for_nomination')[0]}}</div>
            @endif
        </div>
        <div class="mb-3">
            <label for="status" class="form-label">Status</label><br>
            <select name="status" id="status" class="form-control">
                @foreach(\App\Enums\CandidateStatusEnum::cases() as $case)
                    <option value="{{$case->name}}" @selected($case->name === $candidate->status)>{{$case->value}}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3 d- merge-block">
            <label for="merge_with" class="form-label">Merge With</label><br>
            <select class="form-control" id="merge_with" name="merge_with">
                @foreach($election->candidates as $c)
                    <option value="{{$c->id}}">{{$c->first_name}} {{$c->last_name}}</option>
                @endforeach
            </select>
        </div>
        <div class="d-flex justify-content-center">
            <button class="btn btn-primary" type="submit">Update</button>
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
            $('#country_code,#merge_with').select2();
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
    <script>
        $(document).ready(function () {
            $('.merge-block').addClass('d-none')
            $('#status').on('change', function () {
                if (this.value === '{{\App\Enums\CandidateStatusEnum::Merged->name}}')
                    $('.merge-block').removeClass('d-none')
                else
                    $('.merge-block').addClass('d-none')
            })
        });
    </script>
@endsection