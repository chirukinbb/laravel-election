@extends('adminlte::page')

@section('title', 'User Management')

@section('content_header')
    <h1>
        <i class="fas fa-users"></i> User Management
    </h1>
@stop

@section('content')
    <div class="container-fluid">
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        @endif

        @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        @endif

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Users List</h3>
                <div class="card-tools">
                    @can('create user')
                        <a href="{{ route('users::create') }}" class="btn btn-primary btn-sm">
                            <i class="fas fa-plus"></i> Create New User
                        </a>
                    @endcan
                </div>
            </div>
            <div class="card-body">
                <table class="table table-bordered table-striped">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($users as $user)
                        <tr>
                            <td>{{ $user->id }}</td>
                            <td>{{ $user->name }}</td>
                            <td>{{ $user->email }}</td>
                            <td>
                                @if($user->roles->count() > 0)
                                    @foreach($user->roles as $role)
                                        <span class="badge badge-primary">{{ $role->name }}</span>
                                    @endforeach
                                @else
                                    <span class="badge badge-secondary">No Role</span>
                                @endif
                            </td>
                            <td>{{ $user->created_at->format('M d, Y H:i') }}</td>
                            <td>
                                @can('edit user role')
                                    <button type="button" class="btn btn-sm btn-warning" data-toggle="modal"
                                            data-target="#roleModal{{ $user->id }}">
                                        <i class="fas fa-edit"></i> Change Role
                                    </button>
                                @endcan

                                @can('delete user')
                                    @if($user->id !== auth()->id())
                                        <form action="{{ route('users::destroy', $user) }}" method="POST"
                                              class="d-inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger"
                                                    onclick="return confirm('Are you sure you want to delete this user?')">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </form>
                                    @endif
                                @endcan
                            </td>
                        </tr>

                        <!-- Role Change Modal -->
                        @can('edit user role')
                            <div class="modal fade" id="roleModal{{ $user->id }}" tabindex="-1" role="dialog">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                        <form action="{{ route('users::update-role', $user) }}" method="POST">
                                            @csrf
                                            @method('PUT')
                                            <div class="modal-header">
                                                <h5 class="modal-title">Change Role for {{ $user->name }}</h5>
                                                <button type="button" class="close" data-dismiss="modal"
                                                        aria-label="Close">
                                                    <span aria-hidden="true">&times;</span>
                                                </button>
                                            </div>
                                            <div class="modal-body">
                                                <div class="form-group">
                                                    <label for="role{{ $user->id }}">Select Role</label>
                                                    <select name="role" id="role{{ $user->id }}" class="form-control"
                                                            required>
                                                        @foreach($roles as $role)
                                                            <option value="{{ $role->name }}" {{ $user->hasRole($role->name) ? 'selected' : '' }}>
                                                                {{ $role->name }}
                                                            </option>
                                                        @endforeach
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-dismiss="modal">
                                                    Cancel
                                                </button>
                                                <button type="submit" class="btn btn-primary">Update Role</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        @endcan
                    @empty
                        <tr>
                            <td colspan="6" class="text-center">No users found</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
            <div class="card-footer">
                {{ $users->links() }}
            </div>
        </div>
    </div>
@stop

@section('js')
    <script>
        console.log('User management page loaded');
    </script>
@stop
