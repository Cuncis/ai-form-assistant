<?php

namespace App\Services\AI;

use App\DTOs\GenerateRequestDTO;
use App\DTOs\GenerateResultDTO;
use App\Jobs\LogUsageJob;
use App\Models\Profile;
use App\Models\Template;
use App\Models\User;
use App\Repositories\Contracts\GenerationRepositoryInterface;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use App\Repositories\Contracts\TemplateRepositoryInterface;
use App\Services\Cache\ResponseCacheService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Orchestrates: cache lookup -> prompt build -> provider call -> usage log -> history row.
 * Usage logging happens inside the queued LogUsageJob (which resolves UsageTracker itself),
 * not here — this class doesn't need a UsageTracker dependency.
 */
class GenerationService
{
    public function __construct(
        private readonly AIProviderFactory $providerFactory,
        private readonly PromptBuilder $promptBuilder,
        private readonly ResponseCacheService $cache,
        private readonly ProfileRepositoryInterface $profiles,
        private readonly TemplateRepositoryInterface $templates,
        private readonly GenerationRepositoryInterface $generations,
    ) {}

    /** @return GenerateResultDTO[] */
    public function generateBatch(GenerateRequestDTO $request): array
    {
        $profile = $this->profiles->find($request->userId, $request->profileId)
            ?? throw (new ModelNotFoundException)->setModel(Profile::class, [$request->profileId]);

        $template = $this->templates->find($request->userId, $request->templateId)
            ?? throw (new ModelNotFoundException)->setModel(Template::class, [$request->templateId]);

        $user = User::findOrFail($request->userId);

        $systemPrompt = $this->promptBuilder->build($template, $profile, $user, $request->pageContext);
        $contextKey = $request->pageContext['companyName'] ?? parse_url($request->pageContext['url'], PHP_URL_HOST) ?? 'unknown';
        $siteDomain = parse_url($request->pageContext['url'], PHP_URL_HOST) ?? $request->pageContext['url'];
        $provider = $this->providerFactory->make();

        $results = [];
        $uncachedFields = [];
        $cacheKeysByFieldId = [];

        foreach ($request->fields as $field) {
            $cacheKey = $this->cache->makeKey($request->profileId, $request->templateId, $field->question, $contextKey);
            $cacheKeysByFieldId[$field->fieldId] = $cacheKey;

            $cached = $this->cache->get($cacheKey);
            if ($cached) {
                $results[$field->fieldId] = $cached;
            } else {
                $uncachedFields[] = $field;
            }
        }

        if ($uncachedFields !== []) {
            $aiResult = $provider->generate($uncachedFields, $systemPrompt);

            foreach ($aiResult->results as $result) {
                $this->cache->put($cacheKeysByFieldId[$result->fieldId], $result);
                $results[$result->fieldId] = $result;
            }

            LogUsageJob::dispatch(
                $request->userId,
                $provider->name(),
                config("ai.providers.{$provider->name()}.model"),
                $aiResult->promptTokens,
                $aiResult->completionTokens,
                'generate/batch',
            );
        }

        foreach ($request->fields as $field) {
            $result = $results[$field->fieldId];

            $this->generations->create($request->userId, [
                'profile_id' => $request->profileId,
                'template_id' => $request->templateId,
                'provider' => $provider->name(),
                'model' => config("ai.providers.{$provider->name()}.model"),
                'site_domain' => $siteDomain,
                'page_url' => $request->pageContext['url'],
                'question_text' => $field->question,
                'answer_text' => $result->answer,
                'confidence' => $result->confidence,
                'tokens_used' => $result->tokensUsed,
                'cached' => $result->cached,
                'status' => 'pending',
            ]);
        }

        // Preserve the caller's original field order.
        return array_map(fn ($field) => $results[$field->fieldId], $request->fields);
    }
}
