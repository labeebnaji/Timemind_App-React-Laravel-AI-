<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', 'AuthController@register');
Route::post('/login', 'AuthController@login');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', 'AuthController@logout');
    Route::get('/user', 'AuthController@user');
    
    // Tasks
    Route::apiResource('tasks', 'TaskController');
    Route::patch('/tasks/{task}/complete', 'TaskController@complete');
    
    // SWOT Analysis
    Route::post('/swot/analyze', 'SwotController@analyze');
    Route::get('/swot/history', 'SwotController@history');
    Route::post('/swot/{id}/accept', 'SwotController@acceptPlan');
    
    // Goals
    Route::apiResource('goals', 'GoalController');
    Route::post('/goals/analyze', 'GoalController@analyzeWithAI');
    
    // Analytics
    Route::get('/analytics/dashboard', 'AnalyticsController@dashboard');
    Route::get('/analytics/weekly', 'AnalyticsController@weekly');
    Route::get('/analytics/monthly', 'AnalyticsController@monthly');
    Route::get('/analytics/ai-suggestions', 'AnalyticsController@aiSuggestions');
});
