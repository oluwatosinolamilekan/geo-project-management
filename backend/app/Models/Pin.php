<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pin extends Model
{
    protected $fillable = ['project_id', 'latitude', 'longitude'];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
