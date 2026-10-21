<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            if (!Schema::hasColumn('candidates', 'uuid')) {
                $table->string('uuid', 36)->nullable()->unique();
            }
        });

        foreach (DB::table('candidates')->whereNull('uuid')->get() as $candidate) {
            DB::table('candidates')
                ->where('id', $candidate->id)
                ->update(['uuid' => (string)Str::uuid()]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('candidates', 'uuid')) {
            Schema::table('candidates', function (Blueprint $table) {
                $table->dropUnique(['uuid']);
                $table->dropColumn('uuid');
            });
        }
    }
};
