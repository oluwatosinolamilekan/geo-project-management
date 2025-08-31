<?php

namespace Tests\Unit\Requests;

use App\Http\Requests\StoreRegionRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreRegionRequestTest extends TestCase
{
    use RefreshDatabase;

    protected StoreRegionRequest $request;

    protected function setUp(): void
    {
        parent::setUp();
        $this->request = new StoreRegionRequest();
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
            'name' => 'North America',
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
    public function it_passes_validation_with_name_at_max_length()
    {
        $data = [
            'name' => str_repeat('a', 255), // Exactly 255 characters
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_fails_validation_when_name_is_empty_string()
    {
        $data = [
            'name' => '',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertFalse($validator->passes());
        $this->assertTrue($validator->errors()->has('name'));
    }

    /** @test */
    public function it_passes_validation_with_special_characters_in_name()
    {
        $data = [
            'name' => 'North America & Caribbean',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
    }

    /** @test */
    public function it_passes_validation_with_unicode_characters_in_name()
    {
        $data = [
            'name' => 'América del Norte',
        ];

        $validator = Validator::make($data, $this->request->rules());
        $this->assertTrue($validator->passes());
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

    /** @test */
    public function it_returns_custom_error_message_for_required_validation()
    {
        $data = [];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Region name is required.',
            $validator->errors()->first('name')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_string_validation()
    {
        $data = ['name' => 123];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Region name must be a string.',
            $validator->errors()->first('name')
        );
    }

    /** @test */
    public function it_returns_custom_error_message_for_max_validation()
    {
        $data = ['name' => str_repeat('a', 256)];

        $validator = Validator::make($data, $this->request->rules(), $this->request->messages());
        $validator->fails();
        
        $this->assertEquals(
            'Region name cannot exceed 255 characters.',
            $validator->errors()->first('name')
        );
    }
}
