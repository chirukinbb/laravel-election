@extends('adminlte::page')

@section('title', 'Profile')

@section('content_header')
    <h1>
        <i class="fas fa-user"></i> User Profile
        <small>{{ $user->name }}</small>
    </h1>
@stop

@section('content')
    <div class="container-fluid">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible">
                <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
                <i class="icon fas fa-check"></i> {{ session('success') }}
            </div>
        @endif

        {{-- Info boxes --}}
        <div class="row">
            <div class="col-lg-3 col-6">
                <div class="small-box bg-info">
                    <div class="inner">
                        <h3>{{ $user->name }}</h3>
                        <p>User Profile</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-user"></i>
                    </div>
                    <a href="{{ route('users::profile.index') }}" class="small-box-footer">
                        More info <i class="fas fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-success">
                    <div class="inner">
                        <h3>{{ $user->email }}</h3>
                        <p>Email Address</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <a href="mailto:{{ $user->email }}" class="small-box-footer">
                        Send Email <i class="fas fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-warning">
                    <div class="inner">
                        <h3>{{ $user->created_at->format('M d, Y') }}</h3>
                        <p>Member Since</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <a href="#" class="small-box-footer">
                        Account Info <i class="fas fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>

            <div class="col-lg-3 col-6">
                <div class="small-box bg-danger">
                    <div class="inner">
                        <h3>Active</h3>
                        <p>Account Status</p>
                    </div>
                    <div class="icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <a href="#" class="small-box-footer">
                        Status Details <i class="fas fa-arrow-circle-right"></i>
                    </a>
                </div>
            </div>
        </div>

        {{-- User details card --}}
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="card card-default">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-user-circle"></i>
                            Account Information
                        </h3>
                    </div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <tr>
                                <th>Name:</th>
                                <td>{{ $user->name }}</td>
                            </tr>
                            <tr>
                                <th>Email:</th>
                                <td>{{ $user->email }}</td>
                            </tr>
                            <tr>
                                <th>Registered:</th>
                                <td>{{ $user->created_at->format('M d, Y H:i') }}</td>
                            </tr>
                            <tr>
                                <th>Last Update:</th>
                                <td>{{ $user->updated_at->format('M d, Y H:i') }}</td>
                            </tr>
                            <tr>
                                <th>Email Verified:</th>
                                <td>
                                    @if($user->email_verified_at)
                                        <span class="badge badge-success">Verified</span>
                                    @else
                                        <span class="badge badge-warning">Not Verified</span>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card card-default">
                    <div class="card-header">
                        <h3 class="card-title">
                            <i class="fas fa-shield-alt"></i>
                            Security & Roles
                        </h3>
                    </div>
                    <div class="card-body">
                        <p><strong>Roles:</strong></p>
                        @if($user->roles->count() > 0)
                            <div class="mb-3">
                                @foreach($user->roles as $role)
                                    <span class="badge badge-primary mr-1">{{ $role->name }}</span>
                                @endforeach
                            </div>
                        @else
                            <p class="text-muted">No roles assigned</p>
                        @endif

                        <p><strong>Permissions:</strong></p>
                        @if($user->permissions->count() > 0)
                            <div>
                                @foreach($user->permissions->take(10) as $permission)
                                    <span class="badge badge-info mr-1">{{ $permission->name }}</span>
                                @endforeach
                                @if($user->permissions->count() > 10)
                                    <span class="badge badge-secondary">+{{ $user->permissions->count() - 10 }} more</span>
                                @endif
                            </div>
                        @else
                            <p class="text-muted">No permissions assigned</p>
                        @endif
                    </div>
                </div>
            </div>
        </div>

            {{-- Quick actions --}}
            <div class="row mt-3">
                <div class="col-md-6">
                    <div class="card card-default">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-user-circle"></i>
                                Profile Information
                            </h3>
                        </div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <tr>
                                    <th>Visible Name:</th>
                                    <td>{{ $user->profile->name }}</td>
                                </tr>
                                <tr>
                                    <th>Phone:</th>
                                    <td>{{ $user->profile->phone }}</td>
                                </tr>
                                <tr>
                                    <th>Location:</th>
                                    <td>{{ $user->profile->languages() ?? 'N/A' }}</td>
                                </tr>
                                <tr>
                                    <th>Bio:</th>
                                    <td>{{ $user->profile->bio }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card card-default">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-user-circle"></i>
                                Filter settings
                            </h3>
                        </div>
                        <div class="card-body">
                            <table class="table table-striped">
                                <tr>
                                    <th>Radius:</th>
                                    <td>{{ $user->filter->radius }}</td>
                                </tr>
                                <tr>
                                    <th>Categories:</th>
                                    <td>{{ $user->filter->categories() }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Quick actions --}}
            <div class="row mt-3">
                <div class="col-md-12">
                    <div class="card card-primary card-outline">
                        <div class="card-header">
                            <h3 class="card-title">
                                <i class="fas fa-cogs"></i>
                                Quick Actions
                            </h3>
                        </div>
                        <div class="card-body">
                            <a href="{{ route('dashboard') }}" class="btn btn-primary">
                                <i class="fas fa-tachometer-alt"></i> Back to Dashboard
                            </a>
                            <a href="{{ route('password.request') }}" class="btn btn-warning">
                                <i class="fas fa-key"></i> Change Password
                            </a>
                            <a href="{{ route('users::profile.edit') }}" class="btn btn-info">
                                <i class="fas fa-edit"></i> Edit Profile
                            </a>
                            <a href="{{ route('users::filter.edit') }}" class="btn btn-info">
                                <i class="fas fa-edit"></i> Edit Filter
                            </a>
                            <form method="POST" action="{{ route('logout') }}" class="d-inline">
                                @csrf
                                <button type="submit" class="btn btn-danger">
                                    <i class="fas fa-sign-out-alt"></i> Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
        </div>
    </div>
@stop

@section('css')
    <style>
        .small-box-footer {
            text-align: center;
            padding: 10px 0;
            display: block;
            background: rgba(0, 0, 0, 0.05);
            color: inherit;
        }

        .small-box-footer:hover {
            background: rgba(0, 0, 0, 0.1);
            color: inherit;
        }
    </style>
@stop

@section('js')
    <script>
        console.log('Profile page loaded successfully');
    </script>
@stop
