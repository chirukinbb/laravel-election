@extends('adminlte::master')

@section('plugins.Datatables', true)

@section('plugins.BootstrapSelect', true)

@section('classes_body','container')

@php
    $heads = [
        ['label' => 'Position', 'width' => 20],
        ['label' => 'Country', 'width' => 20],
        'Name',
        ['label' => 'Vote for', 'width' => 20]
    ];


    $config = [
        'data' => [],
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, ['orderable' => false]],
    ];
@endphp

@section('adminlte_css')
    @stack('css')
    @yield('css')
    <link href="https://cdn.jsdelivr.net/npm/tom-select/dist/css/tom-select.css" rel="stylesheet">
    <!-- 2. Подключаем скрипт -->
    <script src="https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js"></script>
@stop

@section('classes_body','container')

@section('body')
    <form class="wrapper">

        <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button"
                        role="tab" aria-controls="home" aria-selected="true">Ballot paper
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button"
                        role="tab" aria-controls="profile" aria-selected="false">Nominate
                </button>
            </li>
        </ul>
        <div class="tab-content mt-3" id="myTabContent">
            <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

                <x-adminlte-datatable id="candidates" :heads="$heads">
                    @foreach($config['data'] as $row)
                        <tr>
                            @foreach($row as $cell)
                                <td>{!! $cell !!}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </x-adminlte-datatable>
                <div class="g-recaptcha" data-sitekey="{{ env('GOOGLE_RECAPTCHA_KEY') }}"></div>
                <button class="btn" id="vote">Vote For</button>

            </div>
            <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <div class="row mb-3">
                    <div class="col-6">
                        <label for="first_name" class="form-label">First Name</label><br>
                        <input type="text" class="form-control2" id="first_name" name="first_name">
                        @if($errors->get('first_name'))
                            <div class="form-text text-danger">{{$errors->get('first_name')[0]}}</div>
                        @endif
                    </div>
                    <div class="col-6">
                        <label for="last_name" class="form-label">Last Name</label><br>
                        <input type="text" class="form-control0" id="last_name" name="last_name">
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

            </div>
        </div>
    </form>
@stop

@section('adminlte_js')
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    @stack('js')
    @yield('js')
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');

            tabButtons.forEach(button => {
                button.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = this.getAttribute('data-bs-target');

                    // Deactivate all tabs
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                    });

                    // Hide all tab panes
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('show', 'active');
                    });

                    // Activate clicked tab
                    this.classList.add('active');
                    this.setAttribute('aria-selected', 'true');

                    // Show target tab pane
                    const targetPane = document.querySelector(target);
                    if (targetPane) {
                        targetPane.classList.add('show', 'active');
                    }
                });
            });
        });
    </script>
    <script>
        $('#vote').on('click', function (e) {
            e.preventDefault()
        })
    </script>
    <script>
        $('#nominate').on('click', function (e) {
            e.preventDefault()
        })
    </script>
    <script>
        // 4. Инициализация
        var config = {
            options:@json(collect($election->candidates)->map(fn(\App\Models\Candidate $candidate)=>['value'=>$candidate->id,'text'=>$candidate->first_name.' '.$candidate->last_name])),
            hideSelected: true,
            maxItems: 1,
            openOnFocus: false,
            placeholder: "Candidates",
            onItemAdd: (a, s) => {
                $('#home-tab').click()

                $('input[value=' + a + ']').click()
            },
            optgroups: [
                {value: 'candidates_group', label: 'Candidates'}
            ], optgroupField: 'optgroup', // поле в options, которое указывает на группу
            optgroupLabelField: 'label',
            optgroupValueField: 'value',
            lockOptgroupOrder: true, // чтобы заголовок всегда был сверху
        }

        const fnSelect = null

        // $('#first_name').on('change',function () {
        //     if ($(this).val().length > 2)
        // })
        new TomSelect('#first_name', config);
        new TomSelect('#last_name', config);
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
        $(() => {
            $.post()
            let candidates = @json(collect())
            $('#candidates').rows.add([
                {}
            ])
        })
    </script>
@stop
