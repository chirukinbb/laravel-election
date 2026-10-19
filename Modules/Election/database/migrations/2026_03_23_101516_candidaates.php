<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Election\Enums\CandidateStatusEnum;

return new class extends Migration {
    public function up()
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('election_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('country');
            $table->string('city');

            $table->json('activity')->nullable();
            $table->text('reason')->nullable();

            $table->string('nominator_name')->nullable();
            $table->string('portrait_url')->nullable();
            $table->boolean('show_nominator')->default(false);

            $table->enum('status', collect(CandidateStatusEnum::cases())->map(fn($case) => $case->name)->toArray())
                ->default(CandidateStatusEnum::PendingReview->name);
            $table->unsignedBigInteger('proposed_by')->default(0);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('candidates');
    }
};