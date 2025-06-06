/**
 * Vibe Coding Interface - Emergent-inspired natural language to full-stack apps
 * Conversational interface for creating production-ready applications
 */

import React, { useState, useEffect, useRef } from 'react';
import './VibeCodingInterface.css';

const VibeCodingInterface = ({ sessionId, onAppGenerated }) => {
    const [conversation, setConversation] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedApps, setGeneratedApps] = useState([]);
    const [selectedStack, setSelectedStack] = useState('auto');
    const [complexity, setComplexity] = useState('medium');
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom of conversation
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversation]);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const stackOptions = [
        { value: 'auto', label: '🤖 Auto-detect', description: 'Let AI choose the best stack' },
        { value: 'react_nodejs', label: '⚛️ React + Node.js', description: 'Modern web app with JavaScript' },
        { value: 'fastapi_react', label: '🐍 FastAPI + React', description: 'Python backend with React frontend' },
        { value: 'nextjs_fullstack', label: '▲ Next.js Full-stack', description: 'Complete Next.js application' },
        { value: 'django_react', label: '🎸 Django + React', description: 'Django backend with React frontend' },
        { value: 'vue_express', label: '💚 Vue + Express', description: 'Vue.js frontend with Express backend' },
        { value: 'fullstack_ai', label: '🧠 AI-Enhanced Stack', description: 'AI/ML optimized architecture' }
    ];

    const complexityOptions = [
        { value: 'simple', label: '🟢 Simple', description: 'Basic functionality, quick setup' },
        { value: 'medium', label: '🟡 Medium', description: 'Standard features, good balance' },
        { value: 'complex', label: '🔴 Complex', description: 'Advanced features, enterprise-ready' }
    ];

    const examplePrompts = [
        "Create a task management app with real-time collaboration and team workspaces",
        "Build a social media platform with posts, comments, likes, and messaging",
        "Develop an e-commerce store with payment processing and inventory management",
        "Make a blog platform with markdown support and comment system",
        "Create a dashboard for data visualization with charts and analytics",
        "Build a chat application with video calls and file sharing",
        "Develop a project management tool with kanban boards and time tracking",
        "Create a learning management system with courses and quizzes"
    ];

    const addMessage = (message, type = 'user', metadata = null) => {
        const newMessage = {
            id: Date.now(),
            content: message,
            type,
            timestamp: new Date(),
            metadata
        };
        setConversation(prev => [...prev, newMessage]);
        return newMessage;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentInput.trim() || isGenerating) return;

        const userMessage = currentInput.trim();
        setCurrentInput('');
        
        // Add user message
        addMessage(userMessage, 'user');
        
        // Add thinking message
        const thinkingMessage = addMessage('🤔 Analyzing your requirements and designing the perfect architecture...', 'assistant', { thinking: true });
        
        setIsGenerating(true);

        try {
            // Call vibe coding API
            const response = await fetch('/api/v2/vibe-coding/create-app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: userMessage,
                    stack_type: selectedStack === 'auto' ? null : selectedStack,
                    complexity: complexity,
                    session_id: sessionId
                })
            });

            const result = await response.json();

            // Remove thinking message
            setConversation(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

            if (result.success) {
                // Add success message with app details
                const appDetails = result.app;
                const successMessage = `🎉 **${appDetails.name}** created successfully!

**Stack:** ${appDetails.stack_type}
**Components:** ${appDetails.components.length} generated
**Estimated Time:** ${appDetails.deployment_config.estimated_time}
**Complexity:** ${appDetails.deployment_config.complexity}

Your application includes:
${appDetails.components.map(comp => `• ${comp.name} (${comp.type})`).join('\n')}

Ready to deploy! 🚀`;

                addMessage(successMessage, 'assistant', { 
                    app: appDetails,
                    success: true 
                });

                // Update generated apps list
                setGeneratedApps(prev => [...prev, appDetails]);
                
                // Notify parent component
                if (onAppGenerated) {
                    onAppGenerated(appDetails);
                }
            } else {
                // Add error message
                addMessage(`❌ Sorry, I encountered an issue creating your app: ${result.error}`, 'assistant', { 
                    error: true 
                });
            }
        } catch (error) {
            // Remove thinking message
            setConversation(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
            
            addMessage(`❌ Network error: ${error.message}`, 'assistant', { 
                error: true 
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExampleClick = (prompt) => {
        setCurrentInput(prompt);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleDeployApp = async (appId) => {
        try {
            const response = await fetch(`/api/v2/vibe-coding/deploy-app/${appId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deployment_target: 'docker'
                })
            });

            const result = await response.json();
            
            if (result.success) {
                addMessage(`🚀 **Deployment Started!**

Your app is being deployed with Docker. You can access it at:
• Frontend: ${result.services?.frontend || 'http://localhost:3000'}
• Backend: ${result.services?.backend || 'http://localhost:8000'}

Deployment logs:
\`\`\`
${result.logs || 'Deployment in progress...'}
\`\`\``, 'assistant', { 
                    deployment: true,
                    services: result.services
                });
            } else {
                addMessage(`❌ Deployment failed: ${result.error}`, 'assistant', { 
                    error: true 
                });
            }
        } catch (error) {
            addMessage(`❌ Deployment error: ${error.message}`, 'assistant', { 
                error: true 
            });
        }
    };

    const formatMessage = (message) => {
        // Simple markdown-like formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
    };

    return (
        <div className="vibe-coding-interface">
            <div className="vibe-header">
                <div className="vibe-title">
                    <span className="vibe-icon">✨</span>
                    <h2>Vibe Coding</h2>
                    <span className="vibe-subtitle">Natural Language → Production Apps</span>
                </div>
                
                <button 
                    className="advanced-toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    ⚙️ {showAdvanced ? 'Hide' : 'Show'} Advanced
                </button>
            </div>

            {showAdvanced && (
                <div className="vibe-settings">
                    <div className="setting-group">
                        <label>Tech Stack</label>
                        <select 
                            value={selectedStack} 
                            onChange={(e) => setSelectedStack(e.target.value)}
                            className="stack-select"
                        >
                            {stackOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <span className="setting-description">
                            {stackOptions.find(opt => opt.value === selectedStack)?.description}
                        </span>
                    </div>
                    
                    <div className="setting-group">
                        <label>Complexity</label>
                        <div className="complexity-options">
                            {complexityOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`complexity-btn ${complexity === option.value ? 'active' : ''}`}
                                    onClick={() => setComplexity(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="vibe-conversation">
                {conversation.length === 0 ? (
                    <div className="vibe-welcome">
                        <div className="welcome-content">
                            <h3>🚀 Welcome to Vibe Coding!</h3>
                            <p>Describe your app idea in natural language, and I'll create a complete, production-ready application for you.</p>
                            
                            <div className="example-prompts">
                                <h4>Try these examples:</h4>
                                <div className="examples-grid">
                                    {examplePrompts.slice(0, 4).map((prompt, index) => (
                                        <button
                                            key={index}
                                            className="example-prompt"
                                            onClick={() => handleExampleClick(prompt)}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="messages-container">
                        {conversation.map((message) => (
                            <div 
                                key={message.id} 
                                className={`message ${message.type} ${message.metadata?.thinking ? 'thinking' : ''} ${message.metadata?.error ? 'error' : ''}`}
                            >
                                <div className="message-avatar">
                                    {message.type === 'user' ? '👤' : '🤖'}
                                </div>
                                
                                <div className="message-content">
                                    <div className="message-text">
                                        {message.metadata?.thinking ? (
                                            <div className="thinking-animation">
                                                <span className="thinking-dots">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </span>
                                                {message.content}
                                            </div>
                                        ) : (
                                            <div 
                                                dangerouslySetInnerHTML={{ 
                                                    __html: formatMessage(message.content) 
                                                }}
                                            />
                                        )}
                                    </div>
                                    
                                    {message.metadata?.app && (
                                        <div className="app-card">
                                            <div className="app-header">
                                                <h4>{message.metadata.app.name}</h4>
                                                <span className="app-id">#{message.metadata.app.app_id.substring(0, 8)}</span>
                                            </div>
                                            
                                            <div className="app-actions">
                                                <button 
                                                    className="deploy-btn"
                                                    onClick={() => handleDeployApp(message.metadata.app.app_id)}
                                                >
                                                    🚀 Deploy Now
                                                </button>
                                                
                                                <button 
                                                    className="view-code-btn"
                                                    onClick={() => {
                                                        // TODO: Open code viewer
                                                        alert('Code viewer coming soon!');
                                                    }}
                                                >
                                                    👁️ View Code
                                                </button>
                                                
                                                <button 
                                                    className="download-btn"
                                                    onClick={() => {
                                                        // TODO: Download app
                                                        alert('Download feature coming soon!');
                                                    }}
                                                >
                                                    💾 Download
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="message-timestamp">
                                        {message.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            <form className="vibe-input-form" onSubmit={handleSubmit}>
                <div className="input-container">
                    <textarea
                        ref={inputRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Describe your app idea... (e.g., 'Create a social media app with real-time chat and photo sharing')"
                        className="vibe-input"
                        rows="3"
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    
                    <button 
                        type="submit" 
                        className="send-btn"
                        disabled={!currentInput.trim() || isGenerating}
                    >
                        {isGenerating ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            '🚀'
                        )}
                    </button>
                </div>
                
                <div className="input-hints">
                    <span>💡 Be specific about features you want</span>
                    <span>⚡ Press Enter to send, Shift+Enter for new line</span>
                </div>
            </form>

            {generatedApps.length > 0 && (
                <div className="generated-apps-summary">
                    <h4>Generated Apps ({generatedApps.length})</h4>
                    <div className="apps-list">
                        {generatedApps.map((app, index) => (
                            <div key={app.app_id} className="app-summary">
                                <span className="app-name">{app.name}</span>
                                <span className="app-stack">{app.stack_type}</span>
                                <span className="app-components">{app.components.length} components</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VibeCodingInterface;