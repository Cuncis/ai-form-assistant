<?php

return [
    // Monthly request limits per plan tier. Referenced by UsageTracker and the rate limiter.
    'limits' => [
        'free' => (int) env('PLAN_LIMIT_FREE', 50),
        'pro' => (int) env('PLAN_LIMIT_PRO', 1000),
    ],
];
