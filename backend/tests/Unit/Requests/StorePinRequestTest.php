<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\StorePinRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StorePinRequestTest extends TestCase
{
    use RefreshDatabase;

    protected StorePinRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new StorePinRequest();
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
    public function it_fails_validation_when_latitude_is_not_numeric()
    {
        $data = [
            'latitude' => 'invalid',
            'longitude' => -75.654321,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('latitude'));
    }

    /** @test */
    public function it_fails_validation_when_longitude_is_not_numeric()
    {
        $data = [
            'latitude' => 45.123456,
            'longitude' => 'invalid',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('longitude'));
    }

    /** @test */
    public function it_fails_validation_when_latitude_exceeds_maximum()
    {
        $data = [
            'latitude' => 91.0, // Above 90
            'longitude' => 0.0,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('latitude'));
    }

    /** @test */
    public function it_fails_validation_when_latitude_below_minimum()
    {
        $data = [
            'latitude' => -91.0, // Below -90
            'longitude' => 0.0,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('latitude'));
    }

    /** @test */
    public function it_fails_validation_when_longitude_exceeds_maximum()
    {
        $data = [
            'latitude' => 0.0,
            'longitude' => 181.0, // Above 180
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('longitude'));
    }

    /** @test */
    public function it_fails_validation_when_longitude_below_minimum()
    {
        $data = [
            'latitude' => 0.0,
            'longitude' => -181.0, // Below -180
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('longitude'));
    }

    /** @test */
    public function it_passes_validation_with_latitude_at_maximum_boundary()
    {
        $data = [
            'latitude' => 90.0, // Exactly 90
            'longitude' => 0.0,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_latitude_at_minimum_boundary()
    {
        $data = [
            'latitude' => -90.0, // Exactly -90
            'longitude' => 0.0,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_longitude_at_maximum_boundary()
    {
        $data = [
            'latitude' => 0.0,
            'longitude' => 180.0, // Exactly 180
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_longitude_at_minimum_boundary()
    {
        $data = [
            'latitude' => 0.0,
            'longitude' => -180.0, // Exactly -180
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_zero_coordinates()
    {
        $data = [
            'latitude' => 0.0,
            'longitude' => 0.0,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_high_precision_coordinates()
    {
        $data = [
            'latitude' => 12.123456789,
            'longitude' => 98.987654321,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_integer_coordinates()
    {
        $data = [
            'latitude' => 45,
            'longitude' => -75,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
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

    /** @test */
    public function it_returns_custom_error_message_for_latitude_required_validation()
    {
        $data = ['longitude' => 0.0];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Latitude is required.',
            $validator->errors()->first('latitude')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_longitude_required_validation()
    {
        $data = ['latitude' => 0.0];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Longitude is required.',
            $validator->errors()->first('longitude')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_latitude_numeric_validation()
    {
        $data = ['latitude' => 'invalid', 'longitude' => 0.0];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Latitude must be a number.',
            $validator->errors()->first('latitude')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_longitude_numeric_validation()
    {
        $data = ['latitude' => 0.0, 'longitude' => 'invalid'];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Longitude must be a number.',
            $validator->errors()->first('longitude')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_latitude_between_validation()
    {
        $data = ['latitude' => 91.0, 'longitude' => 0.0];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Latitude must be between -90 and 90 degrees.',
            $validator->errors()->first('latitude')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_longitude_between_validation()
    {
        $data = ['latitude' => 0.0, 'longitude' => 181.0];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Longitude must be between -180 and 180 degrees.',
            $validator->errors()->first('longitude')
        );
    }
}
