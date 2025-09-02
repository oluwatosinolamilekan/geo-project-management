<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;

class Region extends Model
{
    protected $fillable = ['name'];

    /**
     * Validation rules for creating a region
     */
    public static function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:regions,name'
        ];
    }

    /**
     * Validation rules for updating a region
     */
    public static function updateRules($id): array
    {
        return [
            'name' => 'required|string|max:255|unique:regions,name,' . $id
        ];
    }

    /**
     * Custom error messages for validation
     */
    public static function messages(): array
    {
        return [
            'name.required' => 'Region name is required.',
            'name.string' => 'Region name must be a string.',
            'name.max' => 'Region name cannot exceed 255 characters.',
            'name.unique' => 'A region with this name already exists.'
        ];
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Before creating, check for duplicate names
        static::creating(function ($region) {
            try {
                if (static::where('name', $region->name)->exists()) {
                    throw ValidationException::withMessages([
                        'name' => ['A region with this name already exists.']
                    ]);
                }
            } catch (\Illuminate\Database\QueryException $e) {
                // If there's a database error, log it and let the validation handle it
                \Log::warning('Database error during duplicate check: ' . $e->getMessage());
                // Don't throw here, let the unique constraint handle it
            }
        });

        // Before updating, check for duplicate names (excluding current record)
        static::updating(function ($region) {
            try {
                if (static::where('name', $region->name)
                    ->where('id', '!=', $region->id)
                    ->exists()) {
                    throw ValidationException::withMessages([
                        'name' => ['A region with this name already exists.']
                    ]);
                }
            } catch (\Illuminate\Database\QueryException $e) {
                // If there's a database error, log it and let the validation handle it
                \Log::warning('Database error during duplicate check: ' . $e->getMessage());
                // Don't throw here, let the unique constraint handle it
            }
        });
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
