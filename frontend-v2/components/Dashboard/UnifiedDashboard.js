/**
 * Unified Dashboard - Main interface combining OpenHands, Manus AI, and Emergent capabilities
 * Provides seamless access to all three execution modes with real-time transparency
 */

import React, { useState, useEffect, useRef } from 'react';
import TransparencyWindow from '../TransparencyWindow/TransparencyWindow.js';
import VibeCodingInterface from '../VibeCoding/VibeCodingInterface.js';
import './UnifiedDashboard.css';

const UnifiedDashboard = () => {
    const [currentSession, setCurrentSession] = useState(null);
    const [activeMode, setActiveMode] = useState('hybrid');
    const [showTransparency, setShowTransparency] = useState(false);
    const [showVibeCoding, setShowVibeCoding] = useState(false);
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [taskHistory, setTaskHistory] = useState([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [currentTask, setCurrentTask] = useState('');
    const [executionContext, setExecutionContext] = useState({});
    
    const metricsIntervalRef = useRef(null);

    // Execution modes configuration
    const executionModes = {
        openhands: {
            name: 'OpenHands Mode',
            icon: '🔧',
            description: 'Reliable sandboxed execution with 53% SWE-Bench success rate',
            color: '#667eea',
            features: ['Sandboxed Execution', 'Multi-file Editing', 'Git Integration', 'Command Execution']
        },
        manus: {
            name: 'Manus AI Mode',
            icon: '🤖',
            description: 'Autonomous background execution with full transparency',
            color: '#43e97b',
            features: ['Autonomous Execution', 'Background Processing', 'Multi-agent Coordination', 'Research Capabilities']
        },
        emergent: {
            name: 'Emergent Mode',
            icon: '✨',
            description: 'Natural language to production-ready full-stack applications',
            color: '#f093fb',
            features: ['Vibe Coding', 'Full-stack Generation', 'Auto Deployment', 'Component Generation']
        },
        hybrid: {
            name: 'Hybrid Mode',
            icon: '🚀',
            description: 'Best of all three approaches combined intelligently',
            color: '#4facfe',
            features: ['Intelligent Routing', 'Multi-mode Execution', 'Optimal Performance', 'Comprehensive Coverage']
        }
    };

    // Initialize session on component mount
    useEffect(() => {
        initializeSession();
        startMetricsPolling();
        
        return () => {
            if (metricsIntervalRef.current) {
                clearInterval(metricsIntervalRef.current);
            }
        };
    }, []);

    const initializeSession = async () => {
        try {
            const response = await fetch('/api/v2/sessions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: `user_${Date.now()}`,
                    workspace_name: 'unified_workspace'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                setCurrentSession(result);
                console.log('Session initialized:', result.session_id);
            } else {
                console.error('Failed to initialize session:', result);
            }
        } catch (error) {
            console.error('Error initializing session:', error);
        }
    };

    const startMetricsPolling = () => {
        const pollMetrics = async () => {
            try {
                const response = await fetch('/api/v2/system/metrics');
                const result = await response.json();
                
                if (result.success) {
                    setSystemMetrics(result.metrics);
                }
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        // Initial fetch
        pollMetrics();
        
        // Poll every 5 seconds
        metricsIntervalRef.current = setInterval(pollMetrics, 5000);
    };

    const executeTask = async () => {
        if (!currentTask.trim() || !currentSession || isExecuting) return;

        setIsExecuting(true);
        
        const taskData = {
            session_id: currentSession.session_id,
            description: currentTask,
            execution_mode: activeMode,
            priority: 1,
            context: executionContext
        };

        try {
            const response = await fetch('/api/v2/tasks/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            const result = await response.json();
            
            if (result.success) {
                // Add to task history
                const newTask = {
                    id: result.task_id,
                    description: currentTask,
                    mode: activeMode,
                    status: 'running',
                    timestamp: new Date(),
                    result: null
                };
                
                setTaskHistory(prev => [newTask, ...prev]);
                setCurrentTask('');
                
                // Show transparency window if not already visible
                if (!showTransparency) {
                    setShowTransparency(true);
                }
                
                console.log('Task started:', result.task_id);
            } else {
                console.error('Failed to execute task:', result);
                alert(`Failed to execute task: ${result.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error executing task:', error);
            alert(`Error executing task: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleModeChange = (mode) => {
        setActiveMode(mode);
        
        // Auto-show vibe coding interface for emergent mode
        if (mode === 'emergent') {
            setShowVibeCoding(true);
        }
    };

    const handleAppGenerated = (app) => {
        // Add generated app to task history
        const newTask = {
            id: app.app_id,
            description: `Generated app: ${app.name}`,
            mode: 'emergent',
            status: 'completed',
            timestamp: new Date(),
            result: {
                type: 'app_generated',
                app: app
            }
        };
        
        setTaskHistory(prev => [newTask, ...prev]);
    };

    const createRestorePoint = async () => {
        if (!currentSession) return;

        try {
            const checkpointName = `checkpoint_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
            
            const response = await fetch(`/api/v2/sessions/${currentSession.session_id}/restore-point`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: currentSession.session_id,
                    checkpoint_name: checkpointName
                })
            });

            const result = await response.json();
            
            if (result.success) {
                alert(`Restore point created: ${checkpointName}`);
            } else {
                alert('Failed to create restore point');
            }
        } catch (error) {
            console.error('Error creating restore point:', error);
            alert('Error creating restore point');
        }
    };

    const formatMetricValue = (value, type) => {
        switch (type) {
            case 'percentage':
                return `${value.toFixed(1)}%`;
            case 'time':
                return `${(value * 1000).toFixed(0)}ms`;
            case 'number':
                return value.toLocaleString();
            default:
                return value;
        }
    };

    return (
        <div className="unified-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>🚀 ZeroCostxCode Enhanced</h1>
                    <p>Unified AI Coding Platform - OpenHands + Manus AI + Emergent</p>
                </div>
                
                <div className="header-actions">
                    <button 
                        className={`transparency-toggle ${showTransparency ? 'active' : ''}`}
                        onClick={() => setShowTransparency(!showTransparency)}
                    >
                        🔍 Transparency
                    </button>
                    
                    <button 
                        className="restore-point-btn"
                        onClick={createRestorePoint}
                        disabled={!currentSession}
                    >
                        💾 Save Point
                    </button>
                    
                    <div className="session-info">
                        {currentSession && (
                            <span>Session: {currentSession.session_id.substring(0, 8)}...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* System Metrics */}
            {systemMetrics && (
                <div className="system-metrics">
                    <div className="metric-card">
                        <span className="metric-label">Success Rate</span>
                        <span className="metric-value success">
                            {formatMetricValue(systemMetrics.success_rate, 'percentage')}
                        </span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Total Tasks</span>
                        <span className="metric-value">
                            {formatMetricValue(systemMetrics.total_tasks, 'number')}
                        </span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Avg Time</span>
                        <span className="metric-value">
                            {formatMetricValue(systemMetrics.avg_execution_time, 'time')}
                        </span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">SWE-Bench Target</span>
                        <span className="metric-value target">
                            {formatMetricValue(systemMetrics.swe_bench_target, 'percentage')}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Left Panel - Mode Selection & Task Input */}
                <div className="left-panel">
                    {/* Execution Mode Selection */}
                    <div className="mode-selection">
                        <h3>🎯 Execution Mode</h3>
                        <div className="mode-grid">
                            {Object.entries(executionModes).map(([key, mode]) => (
                                <div 
                                    key={key}
                                    className={`mode-card ${activeMode === key ? 'active' : ''}`}
                                    onClick={() => handleModeChange(key)}
                                    style={{ '--mode-color': mode.color }}
                                >
                                    <div className="mode-header">
                                        <span className="mode-icon">{mode.icon}</span>
                                        <h4>{mode.name}</h4>
                                    </div>
                                    <p className="mode-description">{mode.description}</p>
                                    <div className="mode-features">
                                        {mode.features.map((feature, index) => (
                                            <span key={index} className="feature-tag">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Input */}
                    <div className="task-input-section">
                        <h3>💬 Task Description</h3>
                        <div className="task-input-container">
                            <textarea
                                value={currentTask}
                                onChange={(e) => setCurrentTask(e.target.value)}
                                placeholder={`Describe your task for ${executionModes[activeMode].name}...

Examples:
• Fix the authentication bug in the login system
• Create a real-time chat application with React and Node.js
• Optimize the database queries for better performance
• Generate a complete e-commerce platform with payment integration`}
                                className="task-input"
                                rows="6"
                                disabled={isExecuting}
                            />
                            
                            <button 
                                className="execute-btn"
                                onClick={executeTask}
                                disabled={!currentTask.trim() || !currentSession || isExecuting}
                            >
                                {isExecuting ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        {executionModes[activeMode].icon} Execute with {executionModes[activeMode].name}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <h3>⚡ Quick Actions</h3>
                        <div className="action-buttons">
                            <button 
                                className="action-btn vibe-coding"
                                onClick={() => setShowVibeCoding(!showVibeCoding)}
                            >
                                ✨ Vibe Coding
                            </button>
                            <button 
                                className="action-btn"
                                onClick={() => setShowTransparency(!showTransparency)}
                            >
                                🔍 Agent Transparency
                            </button>
                            <button 
                                className="action-btn"
                                onClick={createRestorePoint}
                            >
                                💾 Create Checkpoint
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Task History & Status */}
                <div className="right-panel">
                    <div className="task-history">
                        <h3>📋 Task History</h3>
                        <div className="history-list">
                            {taskHistory.length === 0 ? (
                                <div className="no-tasks">
                                    <span className="no-tasks-icon">📝</span>
                                    <p>No tasks executed yet. Start by describing a task above!</p>
                                </div>
                            ) : (
                                taskHistory.map((task) => (
                                    <div key={task.id} className={`history-item ${task.status}`}>
                                        <div className="task-header">
                                            <span className="task-mode">
                                                {executionModes[task.mode]?.icon} {executionModes[task.mode]?.name}
                                            </span>
                                            <span className="task-time">
                                                {task.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="task-description">
                                            {task.description}
                                        </div>
                                        <div className="task-status">
                                            <span className={`status-badge ${task.status}`}>
                                                {task.status === 'running' && '⏳'}
                                                {task.status === 'completed' && '✅'}
                                                {task.status === 'failed' && '❌'}
                                                {task.status}
                                            </span>
                                        </div>
                                        {task.result && task.result.type === 'app_generated' && (
                                            <div className="task-result">
                                                <div className="app-result">
                                                    <h5>🎉 App Generated: {task.result.app.name}</h5>
                                                    <p>Stack: {task.result.app.stack_type}</p>
                                                    <p>Components: {task.result.app.components.length}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vibe Coding Modal */}
            {showVibeCoding && (
                <div className="modal-overlay">
                    <div className="modal-content vibe-coding-modal">
                        <div className="modal-header">
                            <h3>✨ Vibe Coding Interface</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowVibeCoding(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <VibeCodingInterface 
                                sessionId={currentSession?.session_id}
                                onAppGenerated={handleAppGenerated}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Transparency Window */}
            <TransparencyWindow 
                sessionId={currentSession?.session_id}
                isVisible={showTransparency}
                onToggle={() => setShowTransparency(!showTransparency)}
            />
        </div>
    );
};

export default UnifiedDashboard;