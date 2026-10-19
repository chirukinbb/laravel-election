<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasColumn('candidates', 'contributions')) {
            Schema::table('candidates', function (Blueprint $table) {
                $table->dropColumn('contributions');
            });
        }

        if (Schema::hasColumn('candidates', 'links')) {
            Schema::table('candidates', function (Blueprint $table) {
                $table->dropColumn('links');
            });
        }
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->json('contributions')->nullable();
            $table->json('links')->nullable();
        });
    }
};
