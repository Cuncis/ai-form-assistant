<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProfileStoreRequest;
use App\Http\Requests\Api\V1\ProfileUpdateRequest;
use App\Http\Resources\Api\V1\ProfileResource;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly ProfileRepositoryInterface $profiles) {}

    public function index(Request $request): JsonResponse
    {
        $profiles = $this->profiles->allForUser($request->user()->id);

        return response()->json(['success' => true, 'data' => ProfileResource::collection($profiles)]);
    }

    public function store(ProfileStoreRequest $request): JsonResponse
    {
        $profile = $this->profiles->create($request->user()->id, $this->toColumns($request->validated()));

        return response()->json(['success' => true, 'data' => new ProfileResource($profile)], 201);
    }

    public function update(ProfileUpdateRequest $request, int $profile): JsonResponse
    {
        $updated = $this->profiles->update($request->user()->id, $profile, $this->toColumns($request->validated()));

        return response()->json(['success' => true, 'data' => new ProfileResource($updated)]);
    }

    public function destroy(Request $request, int $profile): JsonResponse
    {
        $this->profiles->delete($request->user()->id, $profile);

        return response()->json(['success' => true, 'data' => null]);
    }

    /** Maps the camelCase request payload onto the profiles table's snake_case columns. */
    private function toColumns(array $validated): array
    {
        if (array_key_exists('isDefault', $validated)) {
            $validated['is_default'] = $validated['isDefault'];
            unset($validated['isDefault']);
        }

        return $validated;
    }
}
