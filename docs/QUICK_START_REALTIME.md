# 🚀 Quick Start: Real-time Broadcasting

## Start All Services

### Terminal 1 - Reverb WebSocket Server

```bash
php artisan reverb:start --debug
```

### Terminal 2 - Laravel Dev Server (includes queue, logs, vite)

```bash
composer run dev
```

## What's Broadcasting

### ✅ Admin Moderation Panel (moderation.blade.php)

Listens to: `admin` channel

| Event | Action | Visual Feedback |
|-------|--------|----------------|
| `vote.approved` | Vote approved | Row → green → fades out |
| `vote.rejected` | Vote rejected | Row → red → fades out |
| `vote.flagged` | Vote flagged suspicious | Row → yellow → fades out |
| `candidate.approved` | Candidate approved | Row → green → fades out |
| `candidate.rejected` | Candidate rejected | Row → red → fades out |
| `candidate.merged` | Candidates merged | Row → cyan → fades out |

### ✅ Widget (widget.blade.php)

Listens to: `widget` channel

| Event | Action | Result |
|-------|--------|--------|
| `candidate.update` | Vote or candidate approved | Table refreshes with all approved candidates |

## Testing Flow

```
1. Open moderation panel in Tab A
2. Open same moderation panel in Tab B  
3. Approve a vote in Tab A
4. Watch Tab B auto-update (row highlights and disappears)

5. Open widget in Tab C
6. Approve a vote/candidate in Tab A
7. Watch widget in Tab C refresh candidates table
```

## Key Files Modified

### Events (app/Events/)

- `VoteApproved.php` - vote.approved on admin channel
- `VoteRejected.php` - vote.rejected on admin channel
- `VoteFlagged.php` - vote.flagged on admin channel
- `CandidateApproved.php` - candidate.approved on admin channel
- `CandidateRejected.php` - candidate.rejected on admin channel
- `CandidateMerged.php` - candidate.merged on admin channel
- `UpdateCandidates.php` - candidate.update on widget channel ⭐

### Controller (app/Http/Controllers/Api/)

- `AdminController.php` - fires all events on actions

### Views (resources/views/)

- `moderation.blade.php` - listens to admin channel
- `widget.blade.php` - listens to widget channel

## URLs

- **Modereration Panel**: `http://localhost:8000/moderation`
- **Widget**: `http://localhost:8000/widget/{election_id}`

## Debug Commands

### Check Reverb is running

```bash
# Should show WebSocket connections
php artisan reverb:start --debug
```

### Clear all caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Check routes exist

```bash
php artisan route:list --name=admin.vote.approve
php artisan route:list --name=admin.candidate.approve
```

### Rebuild frontend assets

```bash
npm run build    # Production
npm run dev      # Development with watch
```

## Common Issues

### ❌ "Echo is not defined"

**Fix**: Ensure Vite is loading the JS

```bash
npm run dev
```

### ❌ Events not broadcasting

**Fix**: Check .env

```env
BROADCAST_CONNECTION=reverb
```

### ❌ Widget not updating

**Fix**: Verify election relationship

- Vote must have candidate
- Candidate must have election
- Event uses `$vote->candidate->election`

### ❌ Table not rendering

**Fix**: Check console for errors

- Ensure DataTables plugin loaded
- Verify tbody exists in table

## Event Broadcasting Summary

```php
// When admin approves vote
event(new VoteApproved($vote));              // → admin channel
event(new UpdateCandidates($vote->candidate->election));  // → widget channel

// When admin approves candidate  
event(new CandidateApproved($candidate));    // → admin channel
event(new UpdateCandidates($candidate->election));         // → widget channel
```

Both the moderation panel AND widget update simultaneously! 🎉
