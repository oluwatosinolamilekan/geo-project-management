<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\UpdatePinRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdatePinRequestTest extends TestCase
{
    use RefreshDatabase;

    protected UpdatePinRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new UpdatePinRequest();
    }

    /** @test */
    public function it_authorizes_the_request()
    {
        $this->assertTrue($this->request->authorize());
    }

    /** @test */
    public function it_has_correct_validation_rules()
    {
        $expectedRules = [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ];

        $this->assertEquals($expectedRules, $this->request->rules());
    }

    /** @test */
    public function it_passes_validation_with_valid_coordinates()
    {
        $data = [
            'latitude' => 45.123456,
            'longitude' => -75.654321,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_fails_validation_when_latitude_is_missing()
    {
        $data = [
            'longitude' => -75.654321,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('latitude'));
    }

    /** @test */
    public function it_fails_validation_when_longitude_is_missing()
    {
        $data = [
            'latitude' => 45.123456,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('longitude'));
    }

    /** @test */
    public function it_has_correct_custom_error_messages()
    {
        $expectedMessages = [
            'latitude.required' => 'Latitude is required.',
            'latitude.numeric' => 'Latitude must be a number.',
            'latitude.between' => 'Latitude must be between -90 and 90 degrees.',
            'longitude.required' => 'Longitude is required.',
            'longitude.numeric' => 'Longitude must be a number.',
            'longitude.between' => 'Longitude must be between -180 and 180 degrees.',
        ];

        $this->assertEquals($expectedMessages, $this->request->messages());
    }
}
