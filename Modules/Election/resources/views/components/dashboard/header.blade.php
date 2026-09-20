<div>
    <form action="{{ route('dashboard') }}" method="GET" class="form-inline">
        @foreach(request()->except('election') as $key => $value)
            @if(is_array($value))
                @foreach($value as $v)
                    <input type="hidden" name="{{ $key }}[]" value="{{ $v }}">
                @endforeach
            @else
                <input type="hidden" name="{{ $key }}" value="{{ $value }}">
            @endif
        @endforeach
        <select name="election" class="form-control form-control-sm">
            @forelse($elections as $elec)
                <option value="{{ $elec->id }}" {{ $selectedElection && $selectedElection->id == $elec->id ? 'selected' : '' }}>
                    {{ $elec->name }} ({{ $elec->date_start }} - {{ $elec->date_end }})
                </option>
            @empty
                <option disabled>No elections available</option>
            @endforelse
        </select>
    </form>
</div>