<?php

use App\Exceptions\AIProviderException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API-only app — there is no web login page to redirect guests to.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Normalize every API error to the extension's { success: false, error } envelope
        // instead of Laravel's default { message, errors } shape.
        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'error' => $e->getMessage(),
                    'code' => '422',
                ], 422);
            }
        });

        // Laravel's handler converts ModelNotFoundException into this before any render
        // callback runs, so this one covers both "no such route" and "no such record".
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['success' => false, 'error' => 'Resource not found', 'code' => '404'], 404);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['success' => false, 'error' => 'Unauthenticated', 'code' => '401'], 401);
            }
        });

        // Upstream AI vendor failure (missing key, vendor outage, malformed response) — 502,
        // not 500, since the fault is the upstream provider's, not this server's.
        $exceptions->render(function (AIProviderException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['success' => false, 'error' => $e->getMessage(), 'code' => '502'], 502);
            }
        });
    })->create();
