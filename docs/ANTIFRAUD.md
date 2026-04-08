# Anti-Fraud System Documentation

## Overview

The anti-fraud system automatically calculates fraud scores for each vote based on multiple factors to help detect and
prevent voting manipulation.

## How It Works

When a vote is submitted, the system automatically:

1. Captures the user's IP address and browser fingerprint (hashed with SHA256 for privacy)
2. Calculates a fraud score based on various indicators
3. Updates the vote status automatically (Pending or Suspicious)

## Fraud Score Factors

The system analyzes the following factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Duplicate IP | 20 points | Number of votes from the same IP address |
| Duplicate Fingerprint | 25 points | Number of votes with the same browser fingerprint |
| Vote Frequency | 15 points | Number of votes from same source in last 24 hours |
| New Account | 10 points | User account created less than 7 days ago |
| Multiple Votes by User | 30 points | User has cast multiple votes |

**Note:** Weights can be multiplied based on severity (e.g., multiple duplicates increase the score proportionally).

## Score Thresholds

| Level | Score Range | Status |
|-------|-------------|--------|
| Normal | 0-49 | Pending |
| Suspicious | 50-74 | Suspicious |
| High Risk | 75-100 | Suspicious |

## Configuration

All settings can be adjusted in `config/antifraud.php`:

```php
'weights' => [
    'duplicate_ip' => 20,
    'duplicate_fingerprint' => 25,
    'vote_frequency' => 15,
    'new_account' => 10,
    'multiple_votes_same_user' => 30,
],

'thresholds' => [
    'max_fraud_score' => 100,
    'suspicious_threshold' => 50,
    'high_risk_threshold' => 75,
    'vote_frequency_window_hours' => 24,
    'new_account_days' => 7,
    'vote_frequency_warning' => 2,
    'vote_frequency_critical' => 5,
],
```

## Usage

### Automatic Analysis

Fraud scores are calculated automatically when a vote is submitted via the voting API.

### Manual Analysis (Artisan Command)

To analyze all votes manually:

```bash
php artisan antifraud:analyze
```

Options:

- `--batch-size=100`: Number of votes to process per batch (default: 100)

### Admin API Endpoints

#### 1. Get Fraud Analysis for a Vote

```
GET /api/admin/vote/fraud-analysis?vote_id={id}
```

Returns detailed analysis including:

- Duplicate IP/fingerprint counts
- Recent voting activity
- Account age
- Fraud score and status

#### 2. Re-analyze Vote Fraud Score

```
POST /api/admin/vote/reanalyze-fraud
Body: { "vote_id": 123 }
```

Recalculates the fraud score for a specific vote.

#### 3. Get Suspicious Votes Statistics

```
GET /api/admin/votes/suspicious-stats
```

Returns:

- Total votes
- Suspicious votes count
- High-risk votes count
- Suspicious percentage

#### 4. Get List of Suspicious Votes

```
GET /api/admin/votes/suspicious?per_page=20&min_score=50
```

Parameters:

- `per_page`: Results per page (default: 20, max: 100)
- `min_score`: Minimum fraud score (default: 50)

## Database Fields

The `votes` table includes:

| Field | Type | Description |
|-------|------|-------------|
| `ip_hash` | string | SHA256 hash of voter's IP address |
| `fingerprint_hash` | string | SHA256 hash of voter's browser fingerprint |
| `anti_fraud_score` | integer | Calculated fraud score (0-100) |
| `status` | enum | Pending, Verified, Rejected, or Suspicious |

## Browser Fingerprint Data

The system collects the following browser headers (all hashed):

- User-Agent
- Accept-Language
- Accept-Encoding
- Accept
- Connection
- sec-ch-ua
- sec-ch-ua-mobile
- sec-ch-ua-platform

## Privacy & Security

- **IP addresses are hashed** using SHA256 before storage
- **Browser fingerprints are hashed** using SHA256
- Raw IP addresses and fingerprint data are never stored
- Hashes allow fraud detection while preserving voter privacy

## Monitoring

Regular monitoring recommendations:

1. Check suspicious votes statistics weekly
2. Review high-risk votes manually
3. Adjust weights based on false positive rates
4. Run `php artisan antifraud:analyze` after configuration changes
