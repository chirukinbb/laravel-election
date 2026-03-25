<?php

namespace App\Http\Controllers;

use App\Enums\CandidateStatusEnum;
use App\Enums\VoteStatusEnum;
use App\Models\Candidate;
use App\Models\GoogleApiKey;
use App\Models\GoogleCloudSetting;
use App\Models\GoogleProject;
use App\Models\User;
use App\Models\Vote;
use App\Services\GoogleCloudService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $totalVotes = Vote::whereStatus(VoteStatusEnum::Verified->name)->count();
        $suspiciousVotes = Vote::whereStatus(VoteStatusEnum::Suspicious->name)->count();
        $approvedCandidates = Candidate::whereStatus(CandidateStatusEnum::Approved->name)->count();
        $pendingCandidates = Candidate::whereStatus(CandidateStatusEnum::PendingReview->name)->count();
        $conversion = $totalVotes * 100 / User::whereNotNull('shopify_user_id')->count();

        return view('dashboard', compact(
            'totalVotes',
            'suspiciousVotes',
            'approvedCandidates',
            'pendingCandidates',
            'conversion'
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view("google-cloud.create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            "api_key" => "required|string",
            "org_id" => "required|numeric",
            "socks5_proxy" => "nullable|string",
            "billing_account" => "nullable|string",
            "is_active" => "boolean",
        ]);

        GoogleCloudSetting::create($validated);

        return redirect()->route("google-cloud.index")
            ->with("success", "Settings saved successfully.");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        abort(404);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $setting = GoogleCloudSetting::findOrFail($id);
        return view("google-cloud.edit", compact("setting"));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            "api_key" => "required|string",
            "socks5_proxy" => "nullable|string",
            "billing_account" => "nullable|string",
            "is_active" => "boolean",
        ]);

        $setting = GoogleCloudSetting::findOrFail($id);
        $setting->update($validated);

        return redirect()->route("google-cloud.index")
            ->with("success", "Settings updated successfully.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $setting = GoogleCloudSetting::findOrFail($id);
        $setting->delete();

        return redirect()->route("google-cloud.index")
            ->with("success", "Settings deleted successfully.");
    }

    /**
     * Generate 5 projects and API keys for the given setting.
     */
    public function generateProjects(string $id)
    {
        $setting = GoogleCloudSetting::findOrFail($id);

        try {
            $service = new GoogleCloudService($setting->api_key, $setting->ord_id, $setting->socks5_proxy, $setting->billing_account);
            $results = $service->generateFiveProjects();

            $createdCount = 0;
            foreach ($results as $result) {
                if (isset($result["project"]) && isset($result["api_key"])) {
                    $project = GoogleProject::create([
                        "setting_id" => $setting->id,
                        "project_id" => $result["project"]["id"],
                        "project_number" => $result["project"]["number"],
                        "name" => $result["project"]["name"],
                        "state" => $result["project"]["state"] ?? "ACTIVE",
                        "labels" => [],
                        "created_at_gcp" => now(),
                    ]);

                    GoogleApiKey::create([
                        "project_id" => $project->id,
                        "key_id" => "generated",
                        "api_key" => $result["api_key"],
                        "display_name" => "AI Key",
                        "restrictions" => [],
                        "created_at_gcp" => now(),
                    ]);

                    $createdCount++;
                }
            }

            $message = "Successfully created {$createdCount} projects with API keys.";
            if ($createdCount < 5) {
                $message .= " Some projects may have failed.";
            }

            return redirect()->route("google-cloud.index")
                ->with("success", $message);
        } catch (\Exception $e) {
            Log::error("Failed to generate projects: " . $e->getMessage());
            return redirect()->route("google-cloud.index")
                ->with("error", "Failed to generate projects: " . $e->getMessage());
        }
    }

    /**
     * Display all projects with their API keys.
     */
    public function projectsWithKeys(int $id)
    {
        try {
            $projects = GoogleProject::with(["setting", "apiKeys"])
                ->orderBy("created_at", "desc")
                ->where('setting_id', $id)
                ->get();

            return view("google-cloud.projects-keys", compact("projects"));
        } catch (\Exception $e) {
            Log::error("Error in GoogleCloudController::projectsWithKeys: " . $e->getMessage());
            return response("Error: " . $e->getMessage(), 500);
        }
    }
}
