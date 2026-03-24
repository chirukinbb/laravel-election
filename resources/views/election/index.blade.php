@extends('layouts.app')

@section('title','Election')

@section('content')
    <h5>Election List</h5>
    <table class="table">
        <thead>
        <tr>
            <th>Name</th>
            <th>Actions</th>
            <th>
                <a href="{{route('election:create')}}" class="btn btn-primary">Create</a>
            </th>
        </tr>
        </thead>
        <tbody>
        @if($elections->count())
            @foreach($elections as $election)
                <tr>
                    <td>{{$election->name}}</td>
                    <td colspan="2">
                        <div class="d-flex">
                            <a href="{{route('election:show',compact('election'))}}" class="btn">Show</a>
                            <a href="{{route('election:candidate:list',compact('election'))}}"
                               class="btn">Candidates</a>
                            <a href="{{route('election:edit',compact('election'))}}" class="btn">Edit</a>
                            <form action="{{route('election:delete',compact('election'))}}" method="post">
                                @csrf
                                @method('DELETE')
                                <button class="btn" type="submit">Delete</button>
                            </form>
                        </div>
                    </td>
                </tr>
            @endforeach
        @else
            <tr>
                <td colspan="3">Elections was not found</td>
            </tr>
        @endif
        </tbody>
    </table>
@endsection