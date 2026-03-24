<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('election_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('country_code', array_keys(config('election.countries')));
            $table->string('city')->nullable();
            $table->string('profession')->nullable();
            $table->string('role')->nullable();
            $table->string('website')->nullable();
            $table->string('socials')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('reason_for_nomination');
            $table->boolean('approved')->default(false);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('candidates');
    }
};