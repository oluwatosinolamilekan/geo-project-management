<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = ['region_id', 'name', 'geo_json'];

    protected $casts = [
        'geo_json' => 'array',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function pins(): HasMany
    {
        return $this->hasMany(Pin::class);
    }
}
