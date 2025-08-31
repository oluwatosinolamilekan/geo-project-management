<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdateProjectRequestTest extends TestCase
{
    use RefreshDatabase;

    protected UpdateProjectRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new UpdateProjectRequest();
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
            'name' => 'sometimes|required|string|max:255',
            'geo_json' => 'sometimes|array',
        ];

        $this->assertEquals($expectedRules, $this->request->rules());
    }

    /** @test */
    public function it_passes_validation_with_valid_complete_data()
    {
        $data = [
            'name' => 'Updated Project Name',
            'geo_json' => ['type' => 'Point', 'coordinates' => [10, 20]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_only_name()
    {
        $data = [
            'name' => 'Updated Project Name',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_only_geo_json()
    {
        $data = [
            'geo_json' => ['type' => 'Point', 'coordinates' => [10, 20]],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_empty_data()
    {
        $data = [];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_fails_validation_when_name_is_empty_string_if_provided()
    {
        $data = [
            'name' => '',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_name_is_not_string_if_provided()
    {
        $data = [
            'name' => 123,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_name_exceeds_max_length_if_provided()
    {
        $data = [
            'name' => str_repeat('a', 256), // Exceeds 255 character limit
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_geo_json_is_not_array_if_provided()
    {
        $data = [
            'geo_json' => 'invalid_geo_json',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('geo_json'));
    }



    /** @test */
    public function it_passes_validation_with_complex_geo_json_if_provided()
    {
        $data = [
            'geo_json' => [
                'type' => 'Polygon',
                'coordinates' => [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
            ],
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_empty_geo_json_array_if_provided()
    {
        $data = [
            'geo_json' => [],
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
            'geo_json.array' => 'Geo JSON must be an array.',
        ];

        $this->assertEquals($expectedMessages, $this->request->messages());
    }

    /** @test */
    public function it_returns_custom_error_message_for_name_required_validation()
    {
        $data = ['name' => ''];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Project name is required.',
            $validator->errors()->first('name')
        );
    }



    /** @test */
    public function it_returns_custom_error_message_for_name_string_validation()
    {
        $data = ['name' => 123];

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
        $data = ['geo_json' => 'invalid'];

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
        $data = ['name' => str_repeat('a', 256)];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Project name cannot exceed 255 characters.',
            $validator->errors()->first('name')
        );
    }
}
