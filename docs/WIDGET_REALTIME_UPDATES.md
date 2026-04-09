# Widget Real-time Updates Setup

## Overview

The widget now receives real-time updates whenever:

1. A **vote is approved** (Vote → Verified)
2. A **candidate is approved** (Candidate → Approved)

This keeps the widget table synchronized across all viewers without page refreshes.

## How It Works

### Server-Side Flow

#### When a Vote is Approved:

```
AdminController::approveVote()
    ├─ Updates vote status to 'Verified'
    ├─ Fires: VoteApproved (for admin moderation panel)
    └─ Fires: UpdateCandidates (for widget)
         └─ Fetches all approved candidates
         └─ Returns CandidateResource collection
```

#### When a Candidate is Approved:

```
AdminController::approveCandidate()
    ├─ Updates candidate status to 'Approved'
    ├─ Fires: CandidateApproved (for admin moderation panel)
    └─ Fires: UpdateCandidates (for widget)
         └─ Fetches all approved candidates
         └─ Returns CandidateResource collection
```

### UpdateCandidates Event

**File**: `app/Events/UpdateCandidates.php`

**Channel**: `widget` (public channel)

**Event Name**: `candidate.update`

**Payload** (from `CandidateResource`):

```php
[
    'id' => candidate_id,
    'name' => 'First Last',
    'country' => 'Country Name',
    'votes_count' => 123
]
```

**Data Source**: All approved candidates for the election:

```php
$this->election->candidates()
    ->whereStatus(CandidateStatusEnum::Approved->name)
    ->get()
```

### Client-Side Flow

1. Widget page loads with candidates table
2. Laravel Echo connects to Reverb server
3. Subscribes to `widget` channel
4. Listens for `candidate.update` events
5. When event received:
    - Clears existing table rows
    - Rebuilds table with new candidate data
    - Reinitializes DataTable
    - Sends new height to parent window (for iframes)

## Widget JavaScript

**File**: `resources/views/widget.blade.php`

```javascript
// Listen for candidate updates
window.Echo.channel('widget')
    .listen('.candidate.update', (data) => {
        updateCandidatesTable(data);
    });
```

### Key Functions

1. **`updateCandidatesTable(candidates)`**
    - Clears existing rows from tbody
    - Iterates through candidates array
    - Builds new rows with position, country, name, votes
    - Reinitializes DataTable with proper settings

2. **`buildCandidateRow(candidate, position)`**
    - Creates HTML for a single table row
    - Includes radio button if user is authenticated
    - Handles country name and vote count display

## Testing Real-time Updates

1. **Start Reverb server**:
   ```bash
   php artisan reverb:start --debug
   ```

2. **Open widget in browser**:
   ```
   http://localhost:8000/widget/{election_id}
   ```

3. **In another tab, open moderation panel**:
   ```
   http://localhost:8000/moderation
   ```

4. **Approve a vote or candidate** in moderation panel

5. **Watch the widget update** automatically:
    - Table should refresh with new vote counts
    - New candidates should appear if approved
    - Positions may change based on vote counts

## Configuration

### Environment Variables

Ensure your `.env` has:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=929893
REVERB_APP_KEY=zvxvglrzkwdscywzlqd9
REVERB_APP_SECRET=qedxcyrd6hyjemxu4fjn
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Frontend Dependencies

Required packages (already installed):

```json
{
    "laravel-echo": "^2.3.1",
    "pusher-js": "^8.4.3"
}
```

### Echo Initialization

**File**: `resources/js/echo.js`

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

This is imported by `resources/js/bootstrap.js` which is loaded via Vite in the AdminLTE master template.

## DataTable Configuration

The widget uses DataTables with these settings for real-time updates:

```javascript
$('#candidates').DataTable({
    order: [[1, 'asc']],          // Sort by country column
    columns: [
        { orderable: true },      // Position
        { orderable: true },      // Country
        { orderable: true },      // Name
        { orderable: true },      // Votes
        { orderable: false }      // Vote button (if authenticated)
    ],
    pageLength: -1,               // Show all rows
    lengthChange: false,          // No pagination
    searching: false,             // No search box
    paging: false,                // No pagination
    info: false                   // No "Showing X of Y" text
});
```

## Troubleshooting

### Widget Not Updating

1. **Check browser console**:
   ```javascript
   console.log(window.Echo);  // Should show Echo instance
   ```

2. **Verify Reverb is running**:
   ```bash
   php artisan reverb:start --debug
   ```

3. **Check WebSocket connection** in browser DevTools > Network > WS

4. **Verify channel name matches**:
    - Server: `new Channel('widget')`
    - Client: `.channel('widget')`

5. **Check event name matches**:
    - Server: `broadcastAs() => 'candidate.update'`
    - Client: `.listen('.candidate.update', ...)`

### Table Not Rendering Properly

1. **Check HTML structure**: Ensure `#candidates` table exists
2. **Verify tbody exists**: Table must have `<tbody>` element
3. **Check CandidateResource**: Ensure it returns the expected fields
4. **Look for JS errors** in browser console

### DataTable Initialization Errors

If you see DataTable errors:

- The table might already be initialized
- Try wrapping in try-catch (already implemented)
- Clear and destroy existing instance before reinitializing

## Performance Considerations

### ShouldBroadcastNow vs ShouldBroadcast

The `UpdateCandidates` event implements `ShouldBroadcastNow`:

- **Pros**: Immediate broadcast, no queue delay
- **Cons**: Synchronous, may slow down response time

For high-traffic applications, consider:

```php
class UpdateCandidates implements ShouldBroadcast
{
    // Event will be queued
}
```

And ensure queue worker is running:

```bash
php artisan queue:work
```

### Data Optimization

Current implementation fetches **all approved candidates** on every update:

```php
$this->election->candidates()
    ->whereStatus(CandidateStatusEnum::Approved->name)
    ->get()
```

For large elections (100+ candidates), consider:

1. Caching the candidate list
2. Sending only incremental updates
3. Using pagination in the widget

## Security Notes

⚠️ **The `widget` channel is public** - anyone can subscribe

If you need to restrict access:

1. Use `PrivateChannel` instead
2. Define authorization in `routes/channels.php`:
   ```php
   Broadcast::channel('widget', function ($user) {
       return true; // or add authorization logic
   });
   ```
3. Update frontend to use `.private('widget')`

## Events Summary

| Event | Channel | Purpose | Listeners |
|-------|---------|---------|-----------|
| `VoteApproved` | `admin` | Notify admin panel of vote approval | Moderation view |
| `VoteRejected` | `admin` | Notify admin panel of vote rejection | Moderation view |
| `VoteFlagged` | `admin` | Notify admin panel of vote flagging | Moderation view |
| `CandidateApproved` | `admin` | Notify admin panel of candidate approval | Moderation view |
| `CandidateRejected` | `admin` | Notify admin panel of candidate rejection | Moderation view |
| `CandidateMerged` | `admin` | Notify admin panel of candidate merge | Moderation view |
| **`UpdateCandidates`** | **`widget`** | **Update widget candidates table** | **Widget view** |

## Additional Resources

- [Laravel Broadcasting Docs](https://laravel.com/docs/broadcasting)
- [Laravel Reverb Docs](https://laravel.com/docs/reverb)
- [Laravel Echo Docs](https://laravel.com/docs/broadcasting#client-side-installation)
- [DataTables Docs](https://datatables.net/manual/)
