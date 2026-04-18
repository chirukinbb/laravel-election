<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') | {{env('APP_NAME')}}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.14.2/themes/base/jquery-ui.css">
    <style>
        body {
            background-color: #f8f9fa;
        }

        .dashboard-card {
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        input, select, textarea {
            border-radius: 4px !important;
        }

        .form-control:focus {
            box-shadow: none !important;
        }
    </style>
</head>
<body>
<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
        <a class="navbar-brand" href="/">{{env('APP_NAME')}}</a>
        <div class="navbar-nav ms-auto">
            <span class="nav-item nav-link text-white">Welcome, {{ \Illuminate\Support\Facades\Auth::user()->name }}!</span>
            <form method="POST" action="{{ route('logout') }}" class="nav-item">
                @csrf
                <button type="submit" class="btn btn-outline-light btn-sm">Logout</button>
            </form>
        </div>
    </div>
</nav>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card dashboard-card">
                <div class="card-header bg-success text-white d-flex justify-content-between">
                    <h4 class="mb-0"><i class="bi bi-speedometer2"></i> @yield('title')</h4>
                    <div class="mt-4">
                        <a href="{{route('dashboard',request()->all())}}" class="btn btn-primary"><i
                                    class="bi bi-house"></i> Home</a>
                        <a href="{{route('election:list',request()->all())}}" class="btn btn-primary"><i
                                    class="bi bi-house"></i>
                            Election</a>
                    </div>
                </div>
                <div class="card-body">
                    @yield('content')
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-4.0.0.min.js"
        integrity="sha256-OaVG6prZf4v69dPg6PhVattBXkcOWQB62pdZ3ORyrao=" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/ui/1.14.2/jquery-ui.js"></script>
@yield('script')
</body>
</html>
