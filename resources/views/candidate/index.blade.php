@extends('layouts.app')

@section('title','Candidates')

@section('content')
    <h5>Candidate List</h5>
    <table class="table">
        <thead>
        <tr>
            <th>Name</th>
            <th>Actions</th>
            <th>
                <a href="{{route('election:candidate:create',compact('election'))}}" class="btn btn-primary">Create</a>
            </th>
        </tr>
        </thead>
        <tbody>
        @if($election->candidates->count())
            @foreach($election->candidates as $candidate)
                <tr>
                    <td>{{$candidate->first_name}} {{$candidate->last_name}}</td>
                    <td colspan="2">
                        <div class="d-flex">
                            <a href="{{route('election:candidate:edit',compact('election','candidate'))}}" class="btn">Edit</a>
                            <form action="{{route('election:candidate:delete',compact('election','candidate'))}}"
                                  method="post">
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
                <td colspan="3">Candidates was not found</td>
            </tr>
        @endif
        </tbody>
    </table>
@endsection
