<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | {{env('APP_NAME')}}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }

        .dashboard-card {
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
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
                <div class="card-header bg-success text-white">
                    <h4 class="mb-0"><i class="bi bi-speedometer2"></i> Dashboard</h4>
                </div>
                <div class="card-body">
                    <h5>Welcome to your dashboard!</h5>
                    <p>You have successfully logged in.</p>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle"></i> This is a protected page. Only authenticated users can see it.
                    </div>
                    <div class="mt-4">
                        <a href="/" class="btn btn-primary"><i class="bi bi-house"></i> Home</a>
                        <a href="/dashboard" class="btn btn-secondary"><i class="bi bi-arrow-repeat"></i> Refresh</a>
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
