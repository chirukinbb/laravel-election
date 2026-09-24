<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Election\Enums\VoteStatusEnum;

return new class extends Migration {
    public function up()
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('candidate_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('status', collect(VoteStatusEnum::cases())->map(fn($case) => $case->name)->toArray())
                ->default(VoteStatusEnum::Pending->name);
            $table->string('ip_hash');
            $table->string('fingerprint_hash');
            $table->integer('anti_fraud_score')->default(0);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('votes');
    }
};