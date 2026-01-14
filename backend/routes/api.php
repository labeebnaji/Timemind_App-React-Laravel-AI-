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
    
    // User Settings
    Route::put('/user/profile', 'AuthController@updateProfile');
    Route::delete('/user/account', 'AuthController@deleteAccount');
    
    // Tasks
    Route::delete('/tasks/delete-all', 'TaskController@deleteAll');
    Route::apiResource('tasks', 'TaskController');
    Route::patch('/tasks/{task}/complete', 'TaskController@complete');
    Route::get('/tasks/{task}/ai-tips', 'TaskController@getAITips');
    
    // Notifications
    Route::get('/notifications', 'NotificationController@index');
    Route::get('/notifications/unread', 'NotificationController@unread');
    Route::patch('/notifications/{notification}/read', 'NotificationController@markAsRead');
    Route::post('/notifications/mark-all-read', 'NotificationController@markAllAsRead');
    Route::post('/notifications/generate-reminders', 'NotificationController@generateReminders');
    
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
