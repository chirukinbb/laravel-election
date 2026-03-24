<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('candidate_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('status', collect(\App\Enums\VoteStatusEnum::cases())->map(fn($case) => $case->name)->toArray())
                ->default(\App\Enums\VoteStatusEnum::Pending->name);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('votes');
    }
};