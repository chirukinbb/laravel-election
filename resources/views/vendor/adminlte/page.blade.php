@extends('adminlte::master')

@inject('layoutHelper', 'JeroenNoten\LaravelAdminLte\Helpers\LayoutHelper')
@inject('preloaderHelper', 'JeroenNoten\LaravelAdminLte\Helpers\PreloaderHelper')

@section('adminlte_css')
    @stack('css')
    @yield('css')
    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
@stop

@section('classes_body', $layoutHelper->makeBodyClasses())

@section('body_data', $layoutHelper->makeBodyData())

@section('body')
    <div class="wrapper">

        <s-app-nav>
            <s-link href="/app" rel="home">Главная</s-link>
            @each('adminlte::partials.sidebar.menu-item', $adminlte->menu('sidebar'), 'item')
        </s-app-nav>

        {{-- Preloader Animation (fullscreen mode) --}}
        @if($preloaderHelper->isPreloaderEnabled())
            @include('adminlte::partials.common.preloader')
        @endif
        {{-- Content Wrapper --}}
        @empty($iFrameEnabled)
            @include('adminlte::partials.cwrapper.cwrapper-default')
        @else
            @include('adminlte::partials.cwrapper.cwrapper-iframe')
        @endempty

        {{-- Footer --}}
        @hasSection('footer')
            @include('adminlte::partials.footer.footer')
        @endif

        {{-- Right Control Sidebar --}}
        @if($layoutHelper->isRightSidebarEnabled())
            @include('adminlte::partials.sidebar.right-sidebar')
        @endif

    </div>

    @if(session('success'))
        <div aria-live="polite" aria-atomic="true"
             style="position: fixed; top: 20px; right: 20px; z-index: 9999;">

            <div class="toast" id="successToast" role="alert"
                 data-delay="3000" data-autohide="true">

                <div class="toast-header">
                    <strong class="mr-auto text-success">SUCCESS</strong>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast">
                        <span>&times;</span>
                    </button>
                </div>

                <div class="toast-body">
                    {{ session('success') }}
                </div>

            </div>
        </div>

        @if(\Osiset\ShopifyApp\Util::isMPAApplication())
            @include('shopify-app::partials.token_handler')
        @endif
    @endif
@stop

@section('adminlte_js')
    @stack('js')
    @yield('js')
    <script>
        $(document).ready(function () {
            $('#successToast').toast('show');
        });
    </script>
@stop
