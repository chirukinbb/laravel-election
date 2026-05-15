@extends('adminlte::master')

@section('plugins.Datatables', true)

@section('plugins.BootstrapSelect', true)

@section('classes_body','container')

@php
    $heads = [
        ['label' => 'Position', 'width' => 3],
        ['label' => 'Country', 'width' => 10],
        ['label' => 'Name', 'width' => 67],
        ['label' => 'Votes', 'width' => 10]
    ];

    $config = [
        'data' => [],
        'order' => [[1, 'asc']],
        'columns' => [null, null, null,null],
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


        table#candidates tr,
        table#candidates td,
        table#candidates tbody,
        table#candidates thead,
        table#candidates th {
            border: none !important;
            background-color: #fff;
        }

        table td,
        table th {
            padding: .5625rem 0 !important;
        }

        table {
            box-shadow: none !important;
        }

        .textarea.roww {
            padding-block-end: var(--sp-4);
            padding-block-start: var(--sp-4);
        }

        table#candidates td:not(:first-child,:last-child) > div,
        table#candidates th:not(:first-child,:last-child) > div {
            border-radius: 0 !important;
        }

        table#candidates th:after,
        table#candidates th:before {
            bottom: 1.2rem;
        }

        table#candidates td:first-child > div,
        table#candidates th:first-child > div {
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
        }

        table#candidates td:last-child > div,
        table#candidates th:last-child > div {
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
        }
    </style>
    <!-- 2. Подключаем скрипт -->
    <script src="https://cdn.jsdelivr.net/npm/tom-select/dist/js/tom-select.complete.min.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-{{env('GA_MEASUREMENT_ID')}}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'G-{{env('GA_MEASUREMENT_ID')}}');
    </script>
@stop

@section('classes_body','container')

@section('body')
    <div class="wrapper">
        <h2 class="text-center my-5">Result of &laquo;{{$election->name}}&raquo; election</h2>

        <x-adminlte-datatable id="candidates" :heads="$heads">
            @foreach($config['data'] as $row)
                <tr>
                    @foreach($row as $cell)
                        <td>{!! $cell !!}</td>
                    @endforeach
                </tr>
            @endforeach
        </x-adminlte-datatable>

        @if($voted)
            <h6 class="my-3">Your candidate <span class="candidate"></span> placed <span class="placed"></span> position
            </h6>
        @endif
    </div>
@stop

@section('adminlte_js')
    <script>
        @auth()
        const apiToken = '{{auth()->user()->createToken(\App\Enums\RoleEnum::USER->name)->plainTextToken}}';
        @endauth

        const updateCandidatesTable = (candidates) => {
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

                if (candidate.is_my) {
                    $('span.candidate').text(candidate.name)
                    $('span.position').text(candidate.position)
                }

                const votes = candidate.votes_count
                let row = [position, country, name, votes.toLocaleString()]

                table.row.add(row);
            });

            table.draw();
        }
    </script>
    @stack('js')
    @yield('js')
    <script>
        $(() => {
            $.ajax({
                url: '{{ route("voting.candidates") }}',
                method: 'GET',
                data: {
                    election_id: {{ $election->id }}
                },
                success: function (response) {
                    let candidates = response.data || [];
                    updateCandidatesTable(candidates)
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
            $('#candidates th').eq(0).html('<span class="d-none d-md-inline">Position</span><span class="d-inline-block d-md-none">#</span>')
            $('#candidates th').eq(1).html('<span class="d-none d-md-inline">Country</span><span class="d-inline-block d-md-none">' +
                '<div class="opacity-0 mr-4">1</div><div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-start align-items-center">' +
                '<svg viewBox="0 0 512 512" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" fill="#000000" height="30px"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;stroke:#2b2b2b;stroke-linecap:round;stroke-linejoin:round;stroke-width:13px;}</style></defs><title></title><circle class="cls-1" cx="279.51" cy="229.72" r="100.29"></circle><path class="cls-1" d="M279.51,129.43C251,150.21,232,187.35,232,229.71s19,79.52,47.54,100.3c28.54-20.78,47.54-57.92,47.54-100.3S308.05,150.21,279.51,129.43Z"></path><path class="cls-1" d="M279.51,416V363.44a133.72,133.72,0,0,1,0-267.44v33.43"></path><line class="cls-1" x1="321.3" x2="237.72" y1="416" y2="416"></line><line class="cls-1" x1="379.8" x2="179.22" y1="229.72" y2="229.72"></line></g></svg>' +
                '</div></span>')
            $('#candidates th').eq(3).html('<span class="d-none d-md-inline">Votes</span><span class="d-inline-block d-md-none">' +
                '<div class="opacity-0 mr-4">1</div><div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-start align-items-center">' +
                '<svg height="20px" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 122.574 122.574" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M97.436,36.438H74.706l-5.326,5.326h24.761l8.155,16.35H20.28l8.155-16.35h22.153l-5.326-5.326H25.14L13.312,60.151 v62.423h95.951V60.151L97.436,36.438z M103.938,117.248h-85.3V63.441h85.3V117.248z"></path> <path d="M58.771,47.288H48.428l-1.065,3.195H75.39l-1.132-3.195H61.642l27.576-27.574c0.686-0.685,0.686-1.793,0-2.478 L72.495,0.513c-0.685-0.684-1.795-0.684-2.479,0L42.245,28.286c-0.685,0.684-0.685,1.793,0,2.477L58.771,47.288z M68.829,6.655 l-4.106,16.429l-16.356,4.034L68.829,6.655z M66.585,26.232c0.316-0.077,0.598-0.239,0.82-0.462 c0.221-0.221,0.381-0.5,0.459-0.814l4.824-19.294l12.812,12.813L60.206,43.768L47.401,30.964L66.585,26.232z"></path> <path d="M45.333,113.938c0.479,0.479,1.256,0.479,1.735,0L66.52,94.487c0.479-0.479,0.479-1.255,0-1.735L54.809,81.04 c-0.479-0.479-1.256-0.479-1.735,0l-19.452,19.451c-0.479,0.479-0.479,1.256,0,1.735L45.333,113.938z M52.241,85.342 l-2.876,11.506L37.91,99.673L52.241,85.342z M50.668,99.054c0.222-0.055,0.418-0.168,0.575-0.323 c0.154-0.155,0.267-0.351,0.322-0.57l3.377-13.513l8.975,8.973l-17.716,17.716l-8.967-8.968L50.668,99.054z"></path> <path d="M76.653,98.779c0.416,0.533,1.186,0.628,1.721,0.212l13.062-10.184c0.533-0.416,0.628-1.188,0.212-1.723L74.733,65.391 c-0.416-0.533-1.188-0.629-1.722-0.213L59.95,75.364c-0.533,0.416-0.628,1.188-0.212,1.722L76.653,98.779z M87.481,85.73 l-11.066-4.269L75.02,69.747L87.481,85.73z M72.429,68.746l1.64,13.74c0.026,0.226,0.114,0.437,0.25,0.609 c0.136,0.172,0.315,0.31,0.526,0.391l12.996,5.012l-10.008,7.806L62.427,76.544L72.429,68.746z"></path> </g> </g> </g></svg>' +
                '</div></span>')
            $('#candidates th').eq(4).html('<span class="d-none d-md-inline">Vote</span><span class="d-inline-block d-md-none">' +
                '<div class="opacity-0 mr-4">1</div><div class="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-start align-items-center">' +
                '<svg height="20px" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 124.89 124.89" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M19.777,96.79h22.032l3.018-17.919H23.55L19.777,96.79z M27.04,83.17h12.701l-1.569,9.319H25.078L27.04,83.17z"></path> <polygon points="47.573,61.294 43.007,63.977 42.575,66.54 30.225,66.54 32.076,57.749 42.403,57.749 48.794,54.038 48.853,53.691 28.783,53.691 25.225,70.595 46.006,70.595 "></polygon> <polygon points="49.82,54.736 38.89,61.083 36.038,58.341 33.201,60.067 38.189,65.341 52.479,56.945 "></polygon> <path d="M123.956,18.278l-5.369-6.356c-1.409-1.668-3.904-1.878-5.574-0.469l-4.626,3.909l10.473,12.399l4.627-3.908 C125.156,22.442,125.365,19.946,123.956,18.278z"></path> <polygon points="104.115,43.174 99.49,47.056 114.496,108.96 6.878,108.96 22.775,43.388 71.445,43.388 78.117,37.979 18.52,37.979 0,114.37 121.375,114.37 "></polygon> <polygon points="106.351,17.082 64.062,52.803 74.537,65.204 98.283,45.144 98.3,45.129 103.521,40.718 116.824,29.48 "></polygon> <polygon points="55.404,70.847 71.82,66.868 61.969,55.204 "></polygon> </g> </g> </g></svg>' +
                '</div></span>')
            $('#candidates tr').each((i, el) => {
                if ($(el).find('td').eq(1).find('span').length < 2) {
                    const country = $(el).find('td').eq(1).text().trim();

                    const code = Object.keys(countries).find(
                        key => countries[key] === country
                    ) || '';

                    $(el).find('td').eq(1).html(
                        '<span class="d-none d-md-inline">' + country + '</span>' +
                        '<span class="d-inline-block d-md-none">' + code.toUpperCase() + '</span>'
                    );
                }

            });
            const classes = ['mb-3 col-12 col-sm-5', 'col-12 col-sm-7']
            $('#candidates_wrapper .row:last-child > div').each((i, el) => {
                $(el)
                    .removeClass('col-sm-12 col-md-5 col-md-7')
                    .addClass(classes[i]);
            });
            $('#candidates_paginate').addClass('d-flex justify-content-center justify-content-sm-end')

            $('#candidates td,#candidates th').each((i, cell) => {
                if (!$($(cell).html()).hasClass('textarea')) {
                    $(cell).html('<div class="textarea roww position-relative">' + $(cell).html() + '</div>')
                }
            })
        });

        $('body').on('search.dt', function () {
            gtag('event', 'search_candidate');
        })

        @if(!$voted)
        $('body').on('click', 'tr', function () {
            @auth()
            const input = $(this).find('input');

            input.prop('checked', true);
            @else
            window.parent.postMessage({action: 'login'}, '*');
            @endauth
        });
        @endif
    </script>
@stop

