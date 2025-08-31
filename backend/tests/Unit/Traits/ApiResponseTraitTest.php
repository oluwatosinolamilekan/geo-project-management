<?php

namespace Tests\Unit\Traits;

use App\Traits\ApiResponseTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Tests\TestCase;

class ApiResponseTraitTest extends TestCase
{
    use ApiResponseTrait;

    /** @test */
    public function it_returns_not_found_response()
    {
        $response = $this->notFoundResponse();

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());
        $this->assertEquals(['error' => 'Resource not found'], $response->getData(true));
    }

    /** @test */
    public function it_returns_not_found_response_with_custom_resource()
    {
        $response = $this->notFoundResponse('Project');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());
        $this->assertEquals(['error' => 'Project not found'], $response->getData(true));
    }

    /** @test */
    public function it_returns_server_error_response()
    {
        $response = $this->serverErrorResponse();

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(500, $response->getStatusCode());
        $this->assertEquals(['error' => 'Failed to process request'], $response->getData(true));
    }

    /** @test */
    public function it_returns_server_error_response_with_custom_action()
    {
        $response = $this->serverErrorResponse('Failed to create project');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(500, $response->getStatusCode());
        $this->assertEquals(['error' => 'Failed to create project'], $response->getData(true));
    }

    /** @test */
    public function it_returns_bad_request_response()
    {
        $response = $this->badRequestResponse();

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        $this->assertEquals(['error' => 'Bad request'], $response->getData(true));
    }

    /** @test */
    public function it_returns_bad_request_response_with_custom_message()
    {
        $response = $this->badRequestResponse('Invalid input data');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(400, $response->getStatusCode());
        $this->assertEquals(['error' => 'Invalid input data'], $response->getData(true));
    }

    /** @test */
    public function it_returns_validation_error_response()
    {
        $response = $this->validationErrorResponse();

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(422, $response->getStatusCode());
        $this->assertEquals(['error' => 'Validation failed'], $response->getData(true));
    }

    /** @test */
    public function it_returns_validation_error_response_with_custom_message()
    {
        $response = $this->validationErrorResponse('Name is required');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(422, $response->getStatusCode());
        $this->assertEquals(['error' => 'Name is required'], $response->getData(true));
    }

    /** @test */
    public function it_returns_created_response()
    {
        $data = ['id' => 1, 'name' => 'Test'];
        $response = $this->createdResponse($data);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(201, $response->getStatusCode());
        $this->assertEquals($data, $response->getData(true));
    }

    /** @test */
    public function it_returns_success_response()
    {
        $data = ['id' => 1, 'name' => 'Test'];
        $response = $this->successResponse($data);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals($data, $response->getData(true));
    }

    /** @test */
    public function it_returns_success_message_response()
    {
        $message = 'Operation completed successfully';
        $response = $this->successMessageResponse($message);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals(['message' => $message], $response->getData(true));
    }

    /** @test */
    public function it_handles_model_not_found_exception()
    {
        $exception = new ModelNotFoundException();
        $response = $this->handleException($exception);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());
        $this->assertEquals(['error' => 'Resource not found'], $response->getData(true));
    }

    /** @test */
    public function it_handles_model_not_found_exception_with_custom_resource()
    {
        $exception = new ModelNotFoundException();
        $response = $this->handleException($exception, 'Project');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(404, $response->getStatusCode());
        $this->assertEquals(['error' => 'Project not found'], $response->getData(true));
    }

    /** @test */
    public function it_handles_general_exception()
    {
        $exception = new \Exception('Something went wrong');
        $response = $this->handleException($exception);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(500, $response->getStatusCode());
        $this->assertEquals(['error' => 'Failed to process request'], $response->getData(true));
    }

    /** @test */
    public function it_handles_general_exception_with_custom_action()
    {
        $exception = new \Exception('Something went wrong');
        $response = $this->handleException($exception, 'Resource', 'Failed to create resource');

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(500, $response->getStatusCode());
        $this->assertEquals(['error' => 'Failed to create resource'], $response->getData(true));
    }

    /** @test */
    public function it_returns_success_response_with_null_data()
    {
        $response = $this->successResponse(null);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        // Laravel converts null to empty array in JSON responses
        $this->assertEquals([], $response->getData(true));
    }

    /** @test */
    public function it_returns_success_response_with_empty_array()
    {
        $response = $this->successResponse([]);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals([], $response->getData(true));
    }

    /** @test */
    public function it_returns_created_response_with_complex_data()
    {
        $data = [
            'id' => 1,
            'name' => 'Test Project',
            'geo_json' => ['type' => 'Point', 'coordinates' => [0, 0]],
            'created_at' => '2023-01-01T00:00:00Z',
        ];
        
        $response = $this->createdResponse($data);

        $this->assertInstanceOf(JsonResponse::class, $response);
        $this->assertEquals(201, $response->getStatusCode());
        $this->assertEquals($data, $response->getData(true));
    }
}
