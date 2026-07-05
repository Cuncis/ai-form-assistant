<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'plan' => 'free',
        ]);

        $token = $user->createToken('extension')->plainTextToken;

        return response()->json(['success' => true, 'data' => ['token' => $token, 'user' => new UserResource($user)]], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['success' => false, 'error' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('extension')->plainTextToken;

        return response()->json(['success' => true, 'data' => ['token' => $token, 'user' => new UserResource($user)]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true, 'data' => null]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => new UserResource($request->user())]);
    }
}
