# Laravel Reverb Broadcasting Setup

This project has been configured with Laravel Reverb for real-time WebSocket broadcasting.

## What Was Configured

### 1. Event: `VoteApproved`

- **Location**: `app/Events/VoteApproved.php`
- **Broadcasts on**: `admin` channel (public channel)
- **Event name**: `vote.approved`
- **Payload**:
    - `vote_id`
    - `candidate_id`
    - `candidate_name`
    - `election_name`
    - `user_id`
    - `status`
    - `anti_fraud_score`
    - `created_at`

### 2. Controller Update

- **File**: `app/Http/Controllers/Api/AdminController.php`
- **Method**: `approveVote()`
- **Change**: Added `event(new VoteApproved($vote))` after vote approval

### 3. Frontend Listener

- **File**: `resources/views/moderation.blade.php`
- **Features**:
    - Listens to `admin` channel for `vote.approved` events
    - Automatically removes approved vote rows from the table
    - Shows toast notifications
    - Updates DataTable dynamically

### 4. Environment Configuration

Your `.env` file already has the Reverb configuration:

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

## How to Use

### Start the Reverb Server

You need to start the Reverb WebSocket server:

```bash
php artisan reverb:start
```

Or with debug output:

```bash
php artisan reverb:start --debug
```

### Run the Development Server

The project's `composer.json` has a dev script that runs everything:

```bash
composer run dev
```

This starts:

- Laravel development server
- Queue worker
- Pail (logs)
- Vite (frontend assets)

**Note**: You'll need to start Reverb separately.

### Build Frontend Assets

If you make changes to the JavaScript:

```bash
npm run build
```

Or for development with hot reload:

```bash
npm run dev
```

## Testing the Real-time Updates

1. Start the Reverb server: `php artisan reverb:start --debug`
2. Start the Laravel dev server: `php artisan serve`
3. Open the moderation page in **two browser tabs**
4. Approve a vote in one tab
5. The other tab should:
    - Receive the WebSocket event
    - Highlight the row in green
    - Fade out and remove the row
    - Show a toast notification

## How It Works

### Server-Side Flow

1. Admin clicks "Approve" on a vote
2. AJAX request sent to `/api/admin/vote/approve`
3. `AdminController::approveVote()` updates the vote status
4. Event `VoteApproved` is fired with `event(new VoteApproved($vote))`
5. Event implements `ShouldBroadcast` - Laravel automatically broadcasts it
6. Reverb server sends the event to all clients subscribed to the `admin` channel

### Client-Side Flow

1. Page loads and initializes Laravel Echo (via `echo.js`)
2. Echo subscribes to the `admin` channel
3. Listens for `.vote.approved` events
4. When event received:
    - Finds the row with matching `vote_id`
    - Highlights it green
    - Fades it out
    - Removes it from DOM
    - Updates DataTable
    - Shows toast notification

## Adding More Broadcast Events

To create additional real-time events:

1. **Create an Event class**:

```php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class VoteRejected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $vote;

    public function __construct(Vote $vote)
    {
        $this->vote = $vote->load(['candidate', 'user']);
    }

    public function broadcastOn(): array
    {
        return [new Channel('admin')];
    }

    public function broadcastAs(): string
    {
        return 'vote.rejected';
    }

    public function broadcastWith(): array
    {
        return [
            'vote_id' => $this->vote->id,
            // ... other data
        ];
    }
}
```

2. **Fire the event in your controller**:

```php
event(new VoteRejected($vote));
```

3. **Listen on the frontend**:

```javascript
window.Echo.channel('admin')
    .listen('.vote.rejected', (data) => {
        console.log('Vote rejected:', data);
        // Handle the update
    });
```

## Channel Types

### Public Channel (Current Implementation)

```php
new Channel('admin')
```

- Anyone can subscribe
- Good for general admin updates

### Private Channel

```php
new PrivateChannel('admin')
```

- Requires authentication
- Define authorization in `routes/channels.php`

### Presence Channel

```php
new PresenceChannel('admin')
```

- Shows who is online
- Good for collaborative features

## Troubleshooting

### Echo Not Connecting

1. Check Reverb server is running: `php artisan reverb:start`
2. Verify `.env` settings match
3. Check browser console for connection errors
4. Ensure ports match (8080 in your config)

### Events Not Broadcasting

1. Verify `BROADCAST_CONNECTION=reverb` in `.env`
2. Clear config cache: `php artisan config:clear`
3. Check event implements `ShouldBroadcast`
4. Verify `broadcastOn()` returns correct channels
5. Check Reverb debug logs for events

### Frontend Not Receiving Events

1. Open browser console - check for JS errors
2. Verify Echo is initialized: `console.log(window.Echo)`
3. Check network tab for WebSocket connection
4. Ensure event name matches: `.listen('.vote.approved', ...)`
    - Note the dot prefix for custom events

## Additional Configuration

### Queue Workers

For better performance, broadcast events should be queued:

1. Change event to implement `ShouldBroadcastNow` for immediate broadcast
2. Or set up queue worker: `php artisan queue:work`
3. In `.env`: `QUEUE_CONNECTION=database` (already set)

### Scaling

For production with multiple Reverb servers:

1. Enable Redis scaling in `.env`:

```env
REVERB_SCALING_ENABLED=true
REVERB_SCALING_CHANNEL=reverb
```

2. Ensure Redis is configured and running

## Security Notes

- The `admin` channel is public - consider using private channels for sensitive data
- Add authentication checks in `routes/channels.php` if using private channels
- Sanitize all data in `broadcastWith()` before sending
