<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();

            $table->enum('language', ['en', 'es', 'ru']);
            $table->text('text')->nullable();
            $table->morphs('translatable');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('translations');
    }
};