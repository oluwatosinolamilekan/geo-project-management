<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\StoreProjectRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreProjectRequestTest extends TestCase
{
    use RefreshDatabase;

    protected StoreProjectRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new StoreProjectRequest();
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
            'name' => 'required|string|max:255',
            'geo_json' => 'present|array',
        ];

        $this->assertEquals($expectedRules, $this->request->rules());
    }

    /** @test */
    public function it_passes_validation_with_valid_data()
    {
        $data = [
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_fails_validation_when_name_is_missing()
    {
        $data = [
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_geo_json_is_missing()
    {
        $data = [
            'name' => 'Test Project',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('geo_json'));
    }

    /** @test */
    public function it_fails_validation_when_name_is_not_string()
    {
        $data = [
            'name' => 123,
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_geo_json_is_not_array()
    {
        $data = [
            'name' => 'Test Project',
            'geo_json' => 'invalid_geo_json',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('geo_json'));
    }

    /** @test */
    public function it_fails_validation_when_name_exceeds_max_length()
    {
        $data = [
            'name' => str_repeat('a', 256), // Exceeds 255 character limit
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_passes_validation_with_name_at_max_length()
    {
        $data = [
            'name' => str_repeat('a', 255), // Exactly 255 characters
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_fails_validation_when_name_is_empty_string()
    {
        $data = [
            'name' => '',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_passes_validation_with_complex_geo_json()
    {
        $data = [
            'name' => 'Complex Project',
            'geo_json' => [
                'type' => 'Polygon',
                'coordinates' => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            ],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_empty_geo_json_array()
    {
        $data = [
            'name' => 'Test Project',
            'geo_json' => [],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_nested_geo_json_arrays()
    {
        $data = [
            'name' => 'Nested Project',
            'geo_json' => [
                'type' => 'MultiPolygon',
                'coordinates' => [
                    [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
                    [[[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]]],
                ],
            ],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_has_correct_custom_error_messages()
    {
        $expectedMessages = [
            'name.required' => 'Project name is required.',
            'name.string' => 'Project name must be a string.',
            'name.max' => 'Project name cannot exceed 255 characters.',
            'geo_json.present' => 'Geo JSON data is required.',
            'geo_json.array' => 'Geo JSON must be an array.',
        ];

        $this->assertEquals($expectedMessages, $this->request->messages());
    }

    /** @test */
    public function it_returns_custom_error_message_for_name_required_validation()
    {
        $data = ['geo_json' => []];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Project name is required.',
            $validator->errors()->first('name')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_geo_json_present_validation()
    {
        $data = ['name' => 'Test Project'];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Geo JSON data is required.',
            $validator->errors()->first('geo_json')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_name_string_validation()
    {
        $data = ['name' => 123, 'geo_json' => []];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Project name must be a string.',
            $validator->errors()->first('name')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_geo_json_array_validation()
    {
        $data = ['name' => 'Test Project', 'geo_json' => 'invalid'];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Geo JSON must be an array.',
            $validator->errors()->first('geo_json')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_name_max_validation()
    {
        $data = ['name' => str_repeat('a', 256), 'geo_json' => []];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Project name cannot exceed 255 characters.',
            $validator->errors()->first('name')
        );
    }
}
