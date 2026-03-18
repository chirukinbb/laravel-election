<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{env('APP_NAME')}}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }

        .login-card {
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .btn-login {
            background-color: #4e73df;
            border-color: #4e73df;
        }

        .btn-login:hover {
            background-color: #2e59d9;
            border-color: #2653d4;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="row justify-content-center mt-5">
        <div class="col-md-6 col-lg-5">
            <div class="card login-card">

                <!-- Tabs -->
                <div class="card-header p-0">
                    <ul class="d-flex nav-tabs card-header-tabs w-100 p-0 m-0" id="authTabs" role="tablist">
                        <li class="d-block w-50 ">
                            <button class="btn text-primary active w-100"
                                    id="login-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#login"
                                    type="button"
                                    role="tab">
                                Login
                            </button>
                        </li>
                        <li class="d-block w-50 ">
                            <button class="btn btn-primary w-100"
                                    id="register-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#register"
                                    type="button"
                                    role="tab">
                                Register
                            </button>
                        </li>
                    </ul>
                </div>

                <div class="card-body p-4 tab-content">

                    <!-- LOGIN TAB -->
                    <div class="tab-pane fade show active" id="login" role="tabpanel">

                        @if($errors->any())
                            <div class="alert alert-danger">
                                <ul class="mb-0">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <form method="POST" action="{{ route('signin') }}">
                            @csrf

                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email"
                                       name="email"
                                       class="form-control"
                                       value="{{ old('email') }}"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password"
                                       name="password"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="d-grid">
                                <button class="btn btn-primary">Login</button>
                            </div>
                        </form>
                    </div>

                    <!-- REGISTER TAB -->
                    <div class="tab-pane fade" id="register" role="tabpanel">

                        <form method="POST" action="{{ route('register') }}">
                            @csrf

                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text"
                                       name="name"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email"
                                       name="email"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input type="password"
                                       name="password"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Confirm Password</label>
                                <input type="password"
                                       name="password_confirmation"
                                       class="form-control"
                                       required>
                            </div>

                            <div class="d-grid">
                                <button class="btn btn-success">Register</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
</body>
</html>
