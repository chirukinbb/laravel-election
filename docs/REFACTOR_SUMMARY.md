# Anti-Fraud System Refactoring Summary

## Changes Made

### 1. **AntiFraudService** - Completely Rewritten

**Constructor now accepts 6 parameters:**

```php
public function __construct(
    private int $ipWeight = 20,          // ScoreIP - weight for duplicate IP
    private int $fpWeight = 25,          // ScoreFP - weight for duplicate fingerprint
    private int $ipFreqWeight = 15,      // RateLimitIP - weight for IP frequency
    private int $fpFreqWeight = 15,      // RateLimitFP - weight for FP frequency
    private int $approveLimit = 5,       // VoteApproveLimit - threshold for warning
    private int $rejectLimit = 10        // VoteRejectLimit - threshold for critical
) {}
```

**Key Changes:**

- ✅ Removed config file dependencies
- ✅ All weights and limits passed via constructor
- ✅ Simplified to 4 scoring factors (removed new_account and multiple_votes checks)
- ✅ `analyzeVote()` now accepts and returns array (doesn't update DB directly)
- ✅ Separate IP and fingerprint frequency checks
- ✅ Default values provided for backward compatibility

### 2. **VotingController** - Updated Initialization

**Before:**

```php
$antiFraudService = new AntiFraudService([
    'ip_weight' => $this->settingsService->get(SettingKeyEnum::ScoreIP)
]);
```

**After:**

```php
$antiFraudService = new AntiFraudService(
    ipWeight: (int) $this->settingsService->get(SettingKeyEnum::ScoreIP),
    fpWeight: (int) $this->settingsService->get(SettingKeyEnum::ScoreFP),
    ipFreqWeight: (int) $this->settingsService->get(SettingKeyEnum::RateLimitIP),
    fpFreqWeight: (int) $this->settingsService->get(SettingKeyEnum::RateLimitFP),
    approveLimit: (int) $this->settingsService->get(SettingKeyEnum::VoteApproveLimit),
    rejectLimit: (int) $this->settingsService->get(SettingKeyEnum::VoteRejectLimit)
);
```

### 3. **AdminController** - Added Helper Method

Added `createAntiFraudService()` helper method to avoid repetition:

```php
private function createAntiFraudService(): AntiFraudService
{
    return new AntiFraudService(
        ipWeight: (int) $this->settingsService->get(SettingKeyEnum::ScoreIP),
        fpWeight: (int) $this->settingsService->get(SettingKeyEnum::ScoreFP),
        ipFreqWeight: (int) $this->settingsService->get(SettingKeyEnum::RateLimitIP),
        fpFreqWeight: (int) $this->settingsService->get(SettingKeyEnum::RateLimitFP),
        approveLimit: (int) $this->settingsService->get(SettingKeyEnum::VoteApproveLimit),
        rejectLimit: (int) $this->settingsService->get(SettingKeyEnum::VoteRejectLimit)
    );
}
```

All admin methods now use this helper:

- `getVoteFraudAnalysis()`
- `reanalyzeVoteFraud()`
- `getSuspiciousVotesStats()`

### 4. **AnalyzeFraudScores Command** - Updated

Constructor now accepts `SettingsService` and creates `AntiFraudService` via helper method.

### 5. **Settings Mapping**

| Setting Key | Parameter | Purpose |
|-------------|-----------|---------|
| `ScoreIP` | `ipWeight` | Base score for duplicate IP detection |
| `ScoreFP` | `fpWeight` | Base score for duplicate fingerprint detection |
| `RateLimitIP` | `ipFreqWeight` | Weight for IP voting frequency |
| `RateLimitFP` | `fpFreqWeight` | Weight for fingerprint voting frequency |
| `VoteApproveLimit` | `approveLimit` | Threshold for warning level (×1 weight) |
| `VoteRejectLimit` | `rejectLimit` | Threshold for critical level (×2 weight) |

## How Scoring Works Now

### Duplicate Detection

- **Same IP**: `ipWeight × duplicate_count` (max: `ipWeight × 3`)
- **Same Fingerprint**: `fpWeight × duplicate_count` (max: `fpWeight × 3`)

### Frequency Detection (24h window)

- **IP Frequency**:
    - If votes > `rejectLimit`: `ipFreqWeight × 2`
    - If votes > `approveLimit`: `ipFreqWeight × 1`

- **Fingerprint Frequency**:
    - If votes > `rejectLimit`: `fpFreqWeight × 2`
    - If votes > `approveLimit`: `fpFreqWeight × 1`

### Status Determination

- **Score < 50**: `Pending`
- **Score >= 50**: `Suspicious`

## Files Modified

1. ✅ `app/Services/AntiFraudService.php` - Complete rewrite
2. ✅ `app/Http/Controllers/Api/VotingController.php` - Updated initialization
3. ✅ `app/Http/Controllers/Api/AdminController.php` - Added helper method
4. ✅ `app/Console/Commands/AnalyzeFraudScores.php` - Updated to use settings

## Example Usage

When settings are configured as:

- ScoreIP = 20
- ScoreFP = 25
- RateLimitIP = 15
- RateLimitFP = 15
- VoteApproveLimit = 5
- VoteRejectLimit = 10

**Scenario**: Same IP voted 12 times in 24h

- Duplicate IP score: `20 × 1 = 20` (first duplicate)
- IP frequency score: `15 × 2 = 30` (> 10 reject limit)
- **Total**: 50 points → **Suspicious**

## Benefits

✅ All parameters configurable via admin panel  
✅ No hardcoded values  
✅ Flexible and adjustable per deployment  
✅ Clean separation of concerns  
✅ Consistent initialization across all controllers  
