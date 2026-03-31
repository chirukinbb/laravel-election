@extends('adminlte::master')

@section('plugins.Datatables', true)

@section('plugins.BootstrapSelect', true)

@section('classes_body','container')

@php
    $heads = [
        ['label' => 'Position', 'width' => 5],
        ['label' => 'Country', 'width' => 20],
        'Name',
        ['label' => 'Votes', 'width' => 10],
        ['label' => 'Vote for', 'width' => 20]
    ];


    $config = [
        'data' => [],
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, null,['orderable' => false]],
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
    <div class="wrapper">

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
            <form class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">

                <x-adminlte-datatable id="candidates" :heads="$heads">
                    @foreach($config['data'] as $row)
                        <tr>
                            @foreach($row as $cell)
                                <td>{!! $cell !!}</td>
                            @endforeach
                        </tr>
                    @endforeach
                </x-adminlte-datatable>
                <input type="hidden" value="{{$election->id}}" name="election_id">
                <div class="action-zone">
                    <div class="g-recaptcha" data-sitekey="{{ env('GOOGLE_RECAPTCHA_KEY') }}"></div>
                    <div class="errors-vote"></div>
                    <button class="btn" type="submit">Vote For</button>
                </div>
            </form>
            <form class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
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
                <div class="action-zone">
                    <div class="g-recaptcha" data-sitekey="{{ env('GOOGLE_RECAPTCHA_KEY') }}"></div>
                    <div class="errors-nominate"></div>
                    <button class="btn" type="submit">Nominate</button>
                </div>
            </form>
        </div>
    </div>
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
        $(document).on('click keydown input change', () => {
            $('.errors-nominate').html('');
            $('.errors-vote').html('');
        });
    </script>
    <script>
        const apiToken = '{{auth()->user()->createToken(\App\Enums\RoleEnum::USER->name)->plainTextToken}}';
        document.getElementById('home').addEventListener('submit', function (e) {
            e.preventDefault();

            let formData = new FormData(this);

            fetch('{{route('voting.vote')}}', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + apiToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    if (response.ok) {
                        return response.json().then(data => {
                            $('#candidates tr').each((i, tr) => {
                                $(tr).find('td:last-child, th:last-child').addClass('d-none');
                            });
                            $('form .action-zone').addClass('d-none')
                        });
                    }

                    if (response.status === 422) {
                        return response.json().then(errorsData => {
                            let list = '';

                            const errors = errorsData.errors;

                            Object.keys(errors).forEach(field => {
                                errors[field].forEach(message => {
                                    list += '<li class="mt-1 d-block">' + message + '</li>';
                                });
                            });

                            $('.errors-vote').html('<ul class="m-0 p-0 text-danger">' + list + '</ul>');

                            if (typeof grecaptcha !== "undefined") {
                                grecaptcha.reset();
                            }
                        });
                    }

                    throw new Error('Щось пішло не так');
                })
                .catch(error => {
                    console.error('Fetch Error:', error);
                    if (typeof grecaptcha !== "undefined") {
                        grecaptcha.reset();
                    }
                });
        });
    </script>
    <script>
        document.getElementById('profile').addEventListener('submit', function (e) {
            e.preventDefault();

            let formData = new FormData(this);

            fetch('/your-endpoint', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    // 'X-CSRF-TOKEN': стеріть це, якщо токен вже у FormData
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Успішно!');
                    } else {
                        // Якщо сервер повернув помилку валідації
                        alert('Помилка валідації');
                        grecaptcha.reset(); // Скидаємо капчу для нової спроби
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    grecaptcha.reset(); // Скидаємо навіть при помилці мережі
                });
        });
    </script>
    <script>
        // 4. Инициализация
        var config = {
            options:@json(collect($election->candidates)->map(fn(\App\Models\Candidate $candidate)=>['value'=>$candidate->id,'text'=>$candidate->first_name.' '.$candidate->last_name])),
            hideSelected: true,
            maxItems: 1,
            openOnFocus: false,
            onItemAdd: (a, s) => {
                $('#home-tab').click()
                $('input[value=' + a + ']').click()
            },
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
            // Load candidates via AJAX
            $.ajax({
                url: '{{ route("voting.candidates") }}',
                method: 'GET',
                data: {
                    election_id: {{ $election->id }}
                },
                success: function (response) {
                    let candidates = response.data || [];

                    // Sort by votes_count descending
                    candidates.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0));

                    // Calculate position (rank) based on votes
                    candidates.forEach((candidate, index) => {
                        candidate.position = index + 1;
                    });

                    // Clear existing rows and add new ones
                    const table = $('#candidates').DataTable();
                    table.clear();

                    candidates.forEach(function (candidate) {
                        const position = '#' + candidate.position;
                        const country = candidate.country || '-';
                        const name = candidate.name || '-';
                        const voteCell = `<input type="radio" name="candidate_id" value="${candidate.id}" data-candidate="${candidate.id}">`;
                        const votes = candidate.votes_count

                        table.row.add([position, country, name, votes.toLocaleString(), voteCell]);
                    });

                    table.draw();
                },
                error: function (xhr) {
                    console.error('Failed to load candidates:', xhr);
                }
            });
        });
    </script>
@stop
