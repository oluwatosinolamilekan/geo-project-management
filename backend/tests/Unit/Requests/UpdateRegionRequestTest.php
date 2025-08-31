<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\UpdateRegionRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class UpdateRegionRequestTest extends TestCase
{
    use RefreshDatabase;

    protected UpdateRegionRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new UpdateRegionRequest();
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
        ];

        $this->assertEquals($expectedRules, $this->request->rules());
    }

    /** @test */
    public function it_passes_validation_with_valid_data()
    {
        $data = [
            'name' => 'Updated Region Name',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_fails_validation_when_name_is_missing()
    {
        $data = [];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_name_is_not_string()
    {
        $data = [
            'name' => 123,
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_fails_validation_when_name_exceeds_max_length()
    {
        $data = [
            'name' => str_repeat('a', 256), // Exceeds 255 character limit
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_has_correct_custom_error_messages()
    {
        $expectedMessages = [
            'name.required' => 'Region name is required.',
            'name.string' => 'Region name must be a string.',
            'name.max' => 'Region name cannot exceed 255 characters.',
        ];

        $this->assertEquals($expectedMessages, $this->request->messages());
    }
}
