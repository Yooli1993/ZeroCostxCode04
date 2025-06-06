/**
 * Transparency Window Component - Manus AI-inspired real-time agent action viewer
 * Shows live agent actions, decision-making process, and execution flow
 */

import React, { useState, useEffect, useRef } from 'react';
import './TransparencyWindow.css';

const TransparencyWindow = ({ sessionId, isVisible, onToggle }) => {
    const [actions, setActions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isAutoScroll, setIsAutoScroll] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [metrics, setMetrics] = useState({
        totalActions: 0,
        successRate: 0,
        avgExecutionTime: 0,
        activeAgents: 0
    });
    
    const actionsEndRef = useRef(null);
    const wsRef = useRef(null);

    // WebSocket connection for real-time updates
    useEffect(() => {
        if (!sessionId || !isVisible) return;

        const wsUrl = `ws://localhost:12001/ws/transparency/${sessionId}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            setConnectionStatus('connected');
            console.log('Transparency WebSocket connected');
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'agent_action') {
                setActions(prev => [...prev, data.action]);
                updateMetrics(data.action);
            } else if (data.type === 'metrics_update') {
                setMetrics(data.metrics);
            }
        };

        wsRef.current.onclose = () => {
            setConnectionStatus('disconnected');
            console.log('Transparency WebSocket disconnected');
        };

        wsRef.current.onerror = (error) => {
            setConnectionStatus('error');
            console.error('Transparency WebSocket error:', error);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [sessionId, isVisible]);

    // Auto-scroll to bottom when new actions arrive
    useEffect(() => {
        if (isAutoScroll && actionsEndRef.current) {
            actionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [actions, isAutoScroll]);

    const updateMetrics = (action) => {
        setMetrics(prev => ({
            totalActions: prev.totalActions + 1,
            successRate: action.success ? 
                ((prev.successRate * prev.totalActions + 100) / (prev.totalActions + 1)) :
                ((prev.successRate * prev.totalActions) / (prev.totalActions + 1)),
            avgExecutionTime: (prev.avgExecutionTime + action.execution_time) / 2,
            activeAgents: prev.activeAgents // Will be updated by backend
        }));
    };

    const filteredActions = actions.filter(action => {
        if (filter === 'all') return true;
        if (filter === 'errors') return !action.success;
        if (filter === 'success') return action.success;
        return action.agent_type === filter;
    });

    const getActionIcon = (actionType) => {
        const icons = {
            'task_start': '🚀',
            'task_complete': '✅',
            'task_failed': '❌',
            'perceive': '👁️',
            'plan': '🧠',
            'execute': '⚡',
            'reflect': '🤔',
            'spawn': '🔄',
            'research': '🔍',
            'architecture_design': '🏗️',
            'generate_component': '🧩',
            'prepare_deployment': '📦',
            'hybrid_synthesis': '🔀'
        };
        return icons[actionType] || '📝';
    };

    const getAgentColor = (agentType) => {
        const colors = {
            'orchestrator_agent': '#667eea',
            'planning_agent': '#43e97b',
            'coding_agent': '#f093fb',
            'testing_agent': '#4facfe',
            'deployment_agent': '#fa709a',
            'research_agent': '#fee140',
            'ui_agent': '#38f9d7',
            'backend_agent': '#f5576c'
        };
        return colors[agentType] || '#b4b4b4';
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const formatExecutionTime = (time) => {
        return time ? `${(time * 1000).toFixed(0)}ms` : 'N/A';
    };

    if (!isVisible) return null;

    return (
        <div className="transparency-window">
            <div className="transparency-header">
                <div className="transparency-title">
                    <span className="transparency-icon">🔍</span>
                    <h3>Agent Transparency</h3>
                    <div className={`connection-status ${connectionStatus}`}>
                        <span className="status-dot"></span>
                        {connectionStatus}
                    </div>
                </div>
                
                <div className="transparency-controls">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Actions</option>
                        <option value="success">Successful</option>
                        <option value="errors">Errors</option>
                        <option value="orchestrator_agent">Orchestrator</option>
                        <option value="planning_agent">Planning</option>
                        <option value="coding_agent">Coding</option>
                        <option value="testing_agent">Testing</option>
                        <option value="deployment_agent">Deployment</option>
                    </select>
                    
                    <button 
                        className={`auto-scroll-btn ${isAutoScroll ? 'active' : ''}`}
                        onClick={() => setIsAutoScroll(!isAutoScroll)}
                        title="Auto-scroll to latest actions"
                    >
                        📜
                    </button>
                    
                    <button 
                        className="clear-btn"
                        onClick={() => setActions([])}
                        title="Clear action history"
                    >
                        🗑️
                    </button>
                    
                    <button 
                        className="close-btn"
                        onClick={onToggle}
                        title="Close transparency window"
                    >
                        ✕
                    </button>
                </div>
            </div>

            <div className="transparency-metrics">
                <div className="metric">
                    <span className="metric-label">Total Actions</span>
                    <span className="metric-value">{metrics.totalActions}</span>
                </div>
                <div className="metric">
                    <span className="metric-label">Success Rate</span>
                    <span className="metric-value">{metrics.successRate.toFixed(1)}%</span>
                </div>
                <div className="metric">
                    <span className="metric-label">Avg Time</span>
                    <span className="metric-value">{formatExecutionTime(metrics.avgExecutionTime)}</span>
                </div>
                <div className="metric">
                    <span className="metric-label">Active Agents</span>
                    <span className="metric-value">{metrics.activeAgents}</span>
                </div>
            </div>

            <div className="transparency-content">
                <div className="actions-list">
                    {filteredActions.length === 0 ? (
                        <div className="no-actions">
                            <span className="no-actions-icon">🤖</span>
                            <p>No agent actions yet. Start a task to see real-time transparency.</p>
                        </div>
                    ) : (
                        filteredActions.map((action, index) => (
                            <div 
                                key={`${action.id}-${index}`} 
                                className={`action-item ${action.success ? 'success' : 'error'}`}
                            >
                                <div className="action-header">
                                    <div className="action-meta">
                                        <span className="action-icon">
                                            {getActionIcon(action.action_type)}
                                        </span>
                                        <span 
                                            className="agent-badge"
                                            style={{ backgroundColor: getAgentColor(action.agent_type) }}
                                        >
                                            {action.agent_type.replace('_agent', '')}
                                        </span>
                                        <span className="action-type">
                                            {action.action_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="action-timing">
                                        <span className="timestamp">
                                            {formatTimestamp(action.timestamp)}
                                        </span>
                                        {action.execution_time && (
                                            <span className="execution-time">
                                                {formatExecutionTime(action.execution_time)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="action-description">
                                    {action.description}
                                </div>
                                
                                {action.input_data && (
                                    <div className="action-data">
                                        <details>
                                            <summary>Input Data</summary>
                                            <pre>{JSON.stringify(action.input_data, null, 2)}</pre>
                                        </details>
                                    </div>
                                )}
                                
                                {action.output_data && (
                                    <div className="action-data">
                                        <details>
                                            <summary>Output Data</summary>
                                            <pre>{JSON.stringify(action.output_data, null, 2)}</pre>
                                        </details>
                                    </div>
                                )}
                                
                                {action.error_message && (
                                    <div className="action-error">
                                        <span className="error-icon">⚠️</span>
                                        {action.error_message}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    <div ref={actionsEndRef} />
                </div>
            </div>

            <div className="transparency-footer">
                <div className="session-info">
                    <span>Session: {sessionId?.substring(0, 8)}...</span>
                    <span>Actions: {filteredActions.length}/{actions.length}</span>
                </div>
                
                <div className="transparency-actions">
                    <button 
                        className="export-btn"
                        onClick={() => {
                            const dataStr = JSON.stringify(actions, null, 2);
                            const dataBlob = new Blob([dataStr], {type: 'application/json'});
                            const url = URL.createObjectURL(dataBlob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `transparency-log-${sessionId}.json`;
                            link.click();
                        }}
                        title="Export transparency log"
                    >
                        💾 Export Log
                    </button>
                    
                    <button 
                        className="replay-btn"
                        onClick={() => {
                            // TODO: Implement session replay functionality
                            alert('Session replay feature coming soon!');
                        }}
                        title="Replay session actions"
                    >
                        ▶️ Replay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransparencyWindow;