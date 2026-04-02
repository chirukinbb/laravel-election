@extends('adminlte::master')

@section('plugins.Datatables', true)

@section('plugins.BootstrapSelect', true)

@section('classes_body','container')

@php
    $heads = [
        ['label' => 'Position', 'width' => 3],
        ['label' => 'Country', 'width' => 10],
        'Name',
        ['label' => 'Votes', 'width' => 10],
        ['label' => 'Vote for', 'width' => 15]
    ];


    $config = [
        'data' => [],
        'order' => [[1, 'asc']],
        'columns' => [null, null, null, null,['orderable' => false]],
    ];
@endphp

@section('adminlte_css')
    <link rel="stylesheet" href="{{asset('css/widget.css?'.time())}}"
          media="print" fetchpriority="low" onload="this.media='all'">

    <link rel="preload" as="font"
          href="https://www.treeofunity.com/cdn/fonts/inter/inter_n4.b2a3f24c19b4de56e8871f609e73ca7f6d2e2bb9.woff2"
          type="font/woff2" crossorigin>
    <link rel="preload" as="font"
          href="https://www.treeofunity.com/cdn/fonts/inter/inter_n7.02711e6b374660cfc7915d1afc1c204e633421e4.woff2"
          type="font/woff2" crossorigin>
    <style>
        /* Inter - Regular (400) */
        @font-face {
            font-family: 'Inter';
            font-weight: 400;
            font-style: normal;
            font-display: swap;
            src: url("https://www.treeofunity.com/cdn/fonts/inter/inter_n4.b2a3f24c19b4de56e8871f609e73ca7f6d2e2bb9.woff2") format("woff2"),
            url("https://www.treeofunity.com/cdn/fonts/inter/inter_n4.af8052d517e0c9ffac7b814872cecc27ae1fa132.woff") format("woff");
        }

        /* Inter - Medium (500) */
        @font-face {
            font-family: 'Inter';
            font-weight: 500;
            font-style: normal;
            font-display: swap;
            src: url("https://www.treeofunity.com/cdn/fonts/inter/inter_n5.d7101d5e168594dd06f56f290dd759fba5431d97.woff2") format("woff2"),
            url("https://www.treeofunity.com/cdn/fonts/inter/inter_n5.5332a76bbd27da00474c136abb1ca3cbbf259068.woff") format("woff");
        }

        /* Inter - Bold (700) */
        @font-face {
            font-family: 'Inter';
            font-weight: 700;
            font-style: normal;
            font-display: swap;
            src: url("https://www.treeofunity.com/cdn/fonts/inter/inter_n7.02711e6b374660cfc7915d1afc1c204e633421e4.woff2") format("woff2"),
            url("https://www.treeofunity.com/cdn/fonts/inter/inter_n7.6dab87426f6b8813070abd79972ceaf2f8d3b012.woff") format("woff");
        }

        /* Inter - Italic (400) */
        @font-face {
            font-family: 'Inter';
            font-weight: 400;
            font-style: italic;
            font-display: swap;
            src: url("https://www.treeofunity.com/cdn/fonts/inter/inter_i4.feae1981dda792ab80d117249d9c7e0f1017e5b3.woff2") format("woff2");
        }

        /* Скрываем всё выпадающее меню, если в нем есть блок с классом no-results */
        .no-results,
        .ts-dropdown-content .create {
            display: none !important;
        }

        .ts-dropdown.single:not(:has(.option)) {
            display: none !important;
        }

        .input, .select, .textarea {
            font-family: Inter, sans-serif;
            font-weight: 400;
            font-size: 16px; /* var(--text-base) ≈ 1rem */
            line-height: 1.5; /* обычно дефолт для Inter */
            letter-spacing: normal;
            color: rgb(23, 23, 23);
        }

        :root {
            --color-base-text: 23 23 23;
            --color-base-highlight: 255 221 191;
            --color-base-background: 255 255 255;
            --color-base-button: 23 23 23;
            --color-base-button-gradient: #171717;
            --color-base-button-text: 255 255 255;
            --color-keyboard-focus: 11 97 205;
            --color-shadow: 216 216 216;
            --color-price: 23 23 23;
            --color-sale-price: 225 29 72;
            --color-sale-tag: 225 29 72;
            --color-sale-tag-text: 255 255 255;
            --color-rating: 245 158 11;
            --color-placeholder: 250 250 250;
            --color-success-text: 77 124 15;
            --color-success-background: 247 254 231;
            --color-error-text: 190 18 60;
            --color-error-background: 255 241 242;
            --color-info-text: 180 83 9;
            --color-info-background: 255 251 235;
            --color-drawer-text: 23 23 23;
            --color-drawer-background: 255 255 255;
            --color-drawer-button-background: 23 23 23;
            --color-drawer-button-gradient: #171717;
            --color-drawer-button-text: 255 255 255;
            --color-drawer-overlay: 23 23 23;
            --card-radius: var(--rounded-card);
            --card-border-width: 0.0rem;
            --card-border-opacity: 0.0;
            --card-shadow-opacity: 0.1;
            --card-shadow-horizontal-offset: 0.0rem;
            --card-shadow-vertical-offset: 0.0rem;
            --buttons-radius: var(--rounded-button);
            --buttons-border-width: 2px;
            --buttons-border-opacity: 1.0;
            --buttons-shadow-opacity: 0.0;
            --buttons-shadow-horizontal-offset: 0px;
            --buttons-shadow-vertical-offset: 0px;
            --inputs-radius: var(--rounded-input);
            --inputs-border-width: 0px;
            --inputs-border-opacity: 0.65;
            --sp-0d5: 0.125rem;
            --sp-1: 0.25rem;
            --sp-1d5: 0.375rem;
            --sp-2: 0.5rem;
            --sp-2d5: 0.625rem;
            --sp-3: 0.75rem;
            --sp-3d5: 0.875rem;
            --sp-4: 1rem;
            --sp-4d5: 1.125rem;
            --sp-5: 1.25rem;
            --sp-5d5: 1.375rem;
            --sp-6: 1.5rem;
            --sp-6d5: 1.625rem;
            --sp-7: 1.75rem;
            --sp-7d5: 1.875rem;
            --sp-8: 2rem;
            --sp-8d5: 2.125rem;
            --sp-9: 2.25rem;
            --sp-9d5: 2.375rem;
            --sp-10: 2.5rem;
            --sp-10d5: 2.625rem;
            --sp-11: 2.75rem;
            --sp-12: 3rem;
            --sp-13: 3.25rem;
            --sp-14: 3.5rem;
            --sp-15: 3.875rem;
            --sp-16: 4rem;
            --sp-18: 4.5rem;
            --sp-20: 5rem;
            --sp-23: 5.625rem;
            --sp-24: 6rem;
            --sp-28: 7rem;
            --sp-32: 8rem;
            --sp-36: 9rem;
            --sp-40: 10rem;
            --sp-44: 11rem;
            --sp-48: 12rem;
            --sp-52: 13rem;
            --sp-56: 14rem;
            --sp-60: 15rem;
            --sp-64: 16rem;
            --sp-68: 17rem;
            --sp-72: 18rem;
            --sp-80: 20rem;
            --sp-96: 24rem;
            --sp-100: 32rem;
            --font-heading-family: Inter, sans-serif;
            --font-heading-style: normal;
            --font-heading-weight: 700;
            --font-heading-line-height: 1;
            --font-heading-letter-spacing: -0.03em;
            --font-body-family: Inter, sans-serif;
            --font-body-style: normal;
            --font-body-weight: 400;
            --font-body-line-height: 1.2;
            --font-body-letter-spacing: 0.0em;
            --font-navigation-family: var(--font-body-family);
            --font-navigation-size: clamp(0.75rem, 0.748rem + 0.3174vw, 0.875rem);
            --font-navigation-weight: 500;
            --font-navigation-text-transform: uppercase;
            --font-button-family: var(--font-body-family);
            --font-button-size: clamp(0.875rem, 0.8115rem + 0.1587vw, 1.0rem);
            --font-button-weight: 500;
            --font-button-text-transform: uppercase;
            --font-product-family: var(--font-body-family);
            --font-product-size: clamp(1.0rem, 0.873rem + 0.3175vw, 1.25rem);
            --font-product-weight: 500;
            --text-3xs: 0.625rem;
            --text-2xs: 0.6875rem;
            --text-xs: 0.75rem;
            --text-2sm: 0.8125rem;
            --text-sm: 0.875rem;
            --text-base: 1.0rem;
            --text-lg: 1.125rem;
            --text-xl: 1.25rem;
            --text-2xl: 1.5rem;
            --text-3xl: 1.875rem;
            --text-4xl: 2.25rem;
            --text-5xl: 3.0rem;
            --text-6xl: 3.75rem;
            --text-7xl: 4.5rem;
            --text-8xl: 6.0rem;
            --page-width: 2000px;
            --gap-padding: clamp(var(--sp-5), 2.526vw, var(--sp-12));
            --grid-gap: clamp(40px, 20vw, 60px);
            --page-padding: var(--sp-5);
            --page-container: min(calc(100vw - var(--scrollbar-width, 0px) - var(--page-padding) * 2), var(--page-width));
            --rounded-button: 3.75rem;
            --rounded-input: 0.375rem;
            --rounded-card: clamp(var(--sp-2d5), 1.053vw, var(--sp-5));
            --rounded-block: clamp(var(--sp-2d5), 1.053vw, var(--sp-5));
            --icon-weight: 1.5px;
        }

        body {
            font-family: 'Inter', sans-serif;
            font-weight: 400;
            -webkit-font-smoothing: antialiased;
        }

        h1, h2, h3 {
            font-family: 'Inter', sans-serif;
            font-weight: 700;
            letter-spacing: -0.03em; /* Як в оригіналі для щільності заголовків */
        }
    </style>
    <!-- 2. Подключаем скрипт -->
    <script src="https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js"></script>
@stop

@section('classes_body','container')

@section('body')
    <div class="wrapper">

        <ul class="nav nav-tabs d-flex justify-content-center border-0 mb-5" id="myTab" role="tablist">
            <li class="nav-item me-2" role="presentation">
                <button class="button mr-2 button--primary" is="hover-button" id="home-tab" data-bs-toggle="tab"
                        data-bs-target="#home" type="button"
                        role="tab" aria-controls="home" aria-selected="true">
                    <span class="btn-fill" data-fill></span>
                    <span class="btn-text">Ballot paper</span>
                </button>
            </li>
            <li class="nav-item " role="presentation">
                <button class="ml-2 button button--primary" is="hover-button" id="profile-tab" data-bs-toggle="tab"
                        data-bs-target="#profile" type="button"
                        role="tab" aria-controls="profile" aria-selected="false">
                    <span class="btn-fill" data-fill></span>
                    <span class="btn-text">Nominate</span>
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
                <div class="flex flex-wrap gap-4d5 md:gap-6 raw">
                    <div class="field">
                        <input type="text" placeholder="First Name" id="first_name" name="first_name"
                               class="input is-floating">
                        <label for="first_name" class="label is-floating">
                            First Name
                            <span class="text-danger">*</span>
                        </label>
                    </div>
                    <div class="field">
                        <input type="text" placeholder=" Last Name" id="last_name" name="last_name"
                               class="input is-floating">
                        <label for="first_name" class="label is-floating" id="last_name-ts-label">
                            Last Name
                            <span class="text-danger">*</span>
                        </label>
                    </div>
                    <div class="field">
                        @php
                            $config = [
                                "liveSearch" => true,
                                "liveSearchPlaceholder" => "Search...",
                                "showTick" => true,
                                "actionsBox" => true,
                            ];
                        @endphp

                        <x-adminlte-select-bs id="country_code" name="country_code" label="Country"
                                              label-class="label is-floating" :config="$config"
                                              :required="true">
                            <option value="" disabled="" selected=""></option>
                            @foreach(config('election.countries') as $code => $name)
                                <option value="{{$code}}">{{$name}}</option>
                            @endforeach
                        </x-adminlte-select-bs>
                    </div>
                    <div class="field">
                        <input type="text" class="input is-floating" id="city" name="city" placeholder="City">
                        <label for="city" class="label is-floating">City</label>
                    </div>
                    <div class="field">
                        <input type="text" class="input is-floating" id="profession" name="profession"
                               placeholder="Profession">
                        <label for="profession" class="label is-floating">Profession</label>
                    </div>
                    <div class="field">
                        <input type="text" class="input is-floating" id="role" name="role" placeholder="Role">
                        <label for="role" class="label is-floating">Role</label>
                    </div>
                    <div class="field--full">
                        <input type="text" class="input is-floating" id="website" name="website" placeholder="Website">
                        <label for="website" class="label is-floating">Website</label>
                    </div>
                    <div class="field--full">
                        <label for="socials" class="label">Socials</label>
                        <div class="social-block mb-3" id="social-wrapper">
                            <div class="flex flex-wrap gap-4d5 md:gap-3 raw">
                                <div class="field1">
                                    <select class="select is-floating"
                                            id="ContactFormInput-template--27983535997271__contact-form-custom_field-2"
                                            name="contact[Subject]" required="">
                                        <option value="" disabled="" selected=""></option>
                                        @foreach(config('election.socials') as $i => $social)
                                            <option value="{{$i}}">{{$social}}</option>
                                        @endforeach
                                    </select>
                                    <svg class="icon icon-chevron-up icon-sm absolute pointer-events-none"
                                         viewBox="0 0 24 24" stroke="currentColor" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M6 15L12 9L18 15"></path>
                                    </svg>
                                    <label class="label is-floating"
                                           for="ContactFormInput-template--27983535997271__contact-form-custom_field-2">Network</label>
                                </div>
                                <div class="field2">
                                    <input type="text" name="socials[]" class="input is-floating" placeholder="Link">
                                    <label for="" class="label is-floating">Link</label>
                                </div>
                                <div class="field3">
                                    <button class="button button--secondary btn-delete btn-close-white">
                                        <span class="btn-fill" data-fill></span>
                                        <span class="btn-close-white"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button class="button button--primary" type="submit" is="hover-button">
                            <span class="btn-fill" data-fill></span>
                            <span class="btn-text">Add Row</span>
                        </button>
                        <template id="social">
                            <div class="field1">
                                <select class="select is-floating"
                                        id="ContactFormInput-template--27983535997271__contact-form-custom_field-2"
                                        name="contact[Subject]" required="">
                                    <option value="" disabled="" selected=""></option>
                                    @foreach(config('election.socials') as $i => $social)
                                        <option value="{{$i}}">{{$social}}</option>
                                    @endforeach
                                </select>
                                <svg class="icon icon-chevron-up icon-sm absolute pointer-events-none"
                                     viewBox="0 0 24 24" stroke="currentColor" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 15L12 9L18 15"></path>
                                </svg>
                                <label class="label is-floating"
                                       for="ContactFormInput-template--27983535997271__contact-form-custom_field-2">Network</label>
                            </div>
                            <div class="field2">
                                <input type="text" name="socials[]" class="input is-floating" placeholder="Link">
                                <label for="" class="label is-floating">Link</label>
                            </div>
                            <div class="field3">
                                <a href="#" class="btn btn-danger">Delete</a>
                            </div>
                        </template>
                    </div>
                    <div class="field--full">
                        <input type="text" class="input is-floating" id="photo_url" name="photo_url"
                               placeholder="Photo URL">
                        <label for="photo_url" class="label is-floating">Photo URL</label>
                    </div>
                    <div class="field--full">
                    <textarea class="textarea is-floating" id="reason_for_nomination" name="reason_for_nomination"
                              rows="3" placeholder=""></textarea>
                        <label for="reason_for_nomination" class="label is-floating">
                            Reason for Nomination
                            <span class="text-danger">*</span>
                        </label>
                    </div>
                    <div class="action-zone">
                        <div class="g-recaptcha" data-sitekey="{{ env('GOOGLE_RECAPTCHA_KEY') }}"></div>
                        <div class="errors-nominate"></div>
                        <button class="btn" type="submit">Nominate</button>
                    </div>
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
            formData.append('election_id', {{ $election->id }});

            fetch('{{route('voting.candidate.suggest')}}', {
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
                            $('.errors-nominate').html('');
                            $('#profile')[0].reset();
                            if (typeof grecaptcha !== "undefined") {
                                grecaptcha.reset();
                            }
                            alert('Candidate suggestion submitted for review');
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

                            $('.errors-nominate').html('<ul class="m-0 p-0 text-danger">' + list + '</ul>');

                            if (typeof grecaptcha !== "undefined") {
                                grecaptcha.reset();
                            }
                        });
                    }

                    throw new Error('Something went wrong');
                })
                .catch(error => {
                    console.error('Fetch Error:', error);
                    if (typeof grecaptcha !== "undefined") {
                        grecaptcha.reset();
                    }
                });
        });
    </script>
    <script id="tom-selector-init">
        $(['#first_name', '#last_name']).each((i, selector) => {
            $(selector).on('click', function (e) {
                const value = $(selector).val()
                e.preventDefault()
                var config = {
                    options:@json(collect($election->candidates)->map(fn(\App\Models\Candidate $candidate)=>['value'=>$candidate->id,'text'=>$candidate->first_name.' '.$candidate->last_name,'optgroup'=>'candidates_group'])),
                    hideSelected: true,
                    maxItems: 1,
                    openOnFocus: false,
                    valueField: 'value',
                    labelField: 'text',
                    searchField: ['text'],
                    // 1. Определяем саму группу
                    optgroups: [
                        {
                            value: 'candidates_group',
                            label: 'A similar candidate already exists. Would you like to vote for them instead?'
                        }
                    ],
                    create: true,
                    createOnBlur: true,
                    // Настройки отображения групп
                    optgroupField: 'optgroup', // поле в options, которое указывает на группу
                    optgroupLabelField: 'label',
                    optgroupValueField: 'value',
                    lockOptgroupOrder: true,
                    onItemAdd: (a, s) => {
                        const vars = @json(collect($election->candidates)->map(fn(\App\Models\Candidate $candidate)=>$candidate->id));
                        $(selector + '-ts-control').val($(s).text())
                        if (vars.includes(Number(a))) {
                            $('#home-tab').click()
                            $('input[value=' + a + ']').click()
                        }
                    },
                    onInitialize: function (a, b) {
                        const label = selector.replace('#', '').replace('_', ' ').split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        $(selector + '-ts-control').addClass('input is-floating')
                        $(selector + '-ts-control').parent().append('<label class="label is-floating">' + label + '</label>')

                        $(selector).addClass('d-none')
                        $(selector).parent().children('label').first().addClass('d-none');
                        $(selector).parent().find('div').removeClass('input is-floating')
                    },
                    onBlur: function (a, s) {
                        s = $(selector + '-ts-control').parent().find('div')
                        this.destroy()
                        $(selector).attr('value', s.text())
                        $(selector).removeClass('d-none')
                        $(selector).parent().find('label').removeClass('d-none')
                    }
                }
                const tomSelect = new TomSelect(selector, config);
                tomSelect.setTextboxValue(value)
                tomSelect.focus()
            })
        })
    </script>
    <script>
        $(document).ready(function () {
            // 1. Store the raw HTML string from the template
            const socTemplate = $('#social').html();
            const $container = $('#social-wrapper > div'); // The div where rows will be added

            // 2. Add Row Event
            $('#add-social').on('click', function (e) {
                e.preventDefault();
                // Wrap the string in $(), then append it
                $container.append($(socTemplate));
            });

            // 3. Delete Row Event (using Event Delegation)
            $container.on('click', '.btn-delete', function (e) {
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
    <script id="table__customization">
        const countries = @json(config('election.countries'));

        $('body').on('draw.dt', function () {
            $('#candidates_wrapper .row:first-child > div').each((i, el) => {
                $(el)
                    .removeClass('col-sm-12 col-md-6')
                    .addClass('col-6');
            });
            $('#candidates_length').addClass('float-left')
            $('#candidates_filter').addClass('float-right')
            $('#candidates th').eq(0).html('<span class="d-none d-sm-inline">Position</span><span class="d-inline-block d-sm-none">#</span>')
            $('#candidates tr').each((i, el) => {
                const country = $(el).find('td').eq(1).text().trim();

                const code = Object.keys(countries).find(
                    key => countries[key] === country
                ) || '';

                $(el).find('td').eq(1).html(
                    '<span class="d-none d-sm-inline">' + country + '</span>' +
                    '<span class="d-inline-block d-sm-none">' + code.toUpperCase() + '</span>'
                );
            });
            const classes = ['d-none d-sm-block col-5', 'col-12 col-sm-7']
            $('#candidates_wrapper .row:last-child > div').each((i, el) => {
                $(el)
                    .removeClass('col-sm-12 col-md-5 col-md-7')
                    .addClass(classes[i]);
            });
            $('#candidates_paginate').addClass('d-flex justify-content-center')
            $('#candidates_paginate a').each((i, a) => {
                $(a).addClass('button mx-1')
                if ($(a).hasClass('active'))
                    $(a).addClass('bg-black')
            })
        });
    </script>
@stop
