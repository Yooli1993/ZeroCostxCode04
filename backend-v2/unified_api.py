"""
Enhanced Backend API for Unified Agent System
Integrates OpenHands, Manus AI, and Emergent capabilities with real-time transparency
"""

import asyncio
import json
import logging
import os
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Add the unified agent system to path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from core.unified_agent_system import (
    UnifiedAgentOrchestrator, 
    TaskContext, 
    ExecutionMode, 
    AgentType,
    AgentAction
)
from agents.vibe_coding_engine import VibeCodingEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic Models
class SessionCreateRequest(BaseModel):
    user_id: str
    workspace_name: Optional[str] = None

class TaskExecutionRequest(BaseModel):
    session_id: str
    description: str
    execution_mode: str = "hybrid"  # openhands, manus, emergent, hybrid
    priority: int = 1
    language: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class VibeCodingRequest(BaseModel):
    description: str
    stack_type: Optional[str] = None
    complexity: str = "medium"
    session_id: Optional[str] = None

class RestorePointRequest(BaseModel):
    session_id: str
    checkpoint_name: str

class RestoreSessionRequest(BaseModel):
    restore_point_id: str
    target_session_id: str

# Global State
class UnifiedAPIState:
    def __init__(self):
        self.orchestrator: Optional[UnifiedAgentOrchestrator] = None
        self.vibe_engine: Optional[VibeCodingEngine] = None
        self.active_websockets: Dict[str, List[WebSocket]] = {}
        self.workspace_root = Path("./workspace")
        self.storage_path = Path("./storage")
        
        # Ensure directories exist
        self.workspace_root.mkdir(exist_ok=True)
        self.storage_path.mkdir(exist_ok=True)

api_state = UnifiedAPIState()

# FastAPI Application
app = FastAPI(
    title="ZeroCostxCode Unified Agent API",
    description="Enhanced API integrating OpenHands, Manus AI, and Emergent capabilities",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize the unified agent system on startup"""
    try:
        # Initialize orchestrator
        api_state.orchestrator = UnifiedAgentOrchestrator(
            workspace_root=str(api_state.workspace_root),
            storage_path=str(api_state.storage_path)
        )
        await api_state.orchestrator.initialize()
        
        # Initialize vibe coding engine
        api_state.vibe_engine = VibeCodingEngine(
            workspace_root=str(api_state.workspace_root / "vibe_apps")
        )
        
        logger.info("Unified Agent System initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize Unified Agent System: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    # Close all WebSocket connections
    for session_id, websockets in api_state.active_websockets.items():
        for ws in websockets:
            try:
                await ws.close()
            except:
                pass
    
    logger.info("Unified Agent System shutdown complete")

# Session Management Endpoints
@app.post("/api/v2/sessions/create")
async def create_session(request: SessionCreateRequest):
    """Create a new user session with workspace"""
    try:
        session_id = await api_state.orchestrator.create_session(request.user_id)
        
        return {
            "success": True,
            "session_id": session_id,
            "user_id": request.user_id,
            "workspace_path": str(api_state.workspace_root / session_id),
            "created_at": datetime.now().isoformat(),
            "capabilities": {
                "openhands_execution": True,
                "manus_autonomy": True,
                "emergent_vibe_coding": True,
                "transparency_logging": True,
                "session_replay": True
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.get("/api/v2/sessions/{session_id}/status")
async def get_session_status(session_id: str):
    """Get session status and metrics"""
    try:
        # Get transparency log
        transparency_log = await api_state.orchestrator.get_transparency_log(session_id)
        
        # Get metrics
        metrics = api_state.orchestrator.get_metrics()
        
        return {
            "success": True,
            "session_id": session_id,
            "active": session_id in api_state.orchestrator.transparency_loggers,
            "transparency_actions": len(transparency_log),
            "websocket_connections": len(api_state.active_websockets.get(session_id, [])),
            "metrics": metrics,
            "last_activity": transparency_log[-1]["timestamp"] if transparency_log else None
        }
        
    except Exception as e:
        logger.error(f"Error getting session status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get session status: {str(e)}")

# Task Execution Endpoints
@app.post("/api/v2/tasks/execute")
async def execute_task(request: TaskExecutionRequest, background_tasks: BackgroundTasks):
    """Execute a task using the unified agent system"""
    try:
        # Validate execution mode
        try:
            execution_mode = ExecutionMode(request.execution_mode.lower())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid execution mode: {request.execution_mode}")
        
        # Create task context
        task_context = TaskContext(
            task_id=str(uuid.uuid4()),
            user_id=request.session_id,  # Using session_id as user_id for now
            description=request.description,
            execution_mode=execution_mode,
            priority=request.priority,
            workspace_path=str(api_state.workspace_root / request.session_id),
            environment_config=request.context
        )
        
        # Execute task in background
        background_tasks.add_task(
            execute_task_background,
            request.session_id,
            task_context
        )
        
        return {
            "success": True,
            "task_id": task_context.task_id,
            "session_id": request.session_id,
            "execution_mode": execution_mode.value,
            "status": "started",
            "message": "Task execution started. Monitor progress via transparency WebSocket.",
            "transparency_endpoint": f"/ws/transparency/{request.session_id}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing task: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute task: {str(e)}")

async def execute_task_background(session_id: str, task_context: TaskContext):
    """Execute task in background and broadcast updates"""
    try:
        result = await api_state.orchestrator.execute_task(session_id, task_context)
        
        # Broadcast completion to WebSocket clients
        await broadcast_to_session(session_id, {
            "type": "task_complete",
            "task_id": task_context.task_id,
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Background task execution failed: {e}")
        
        # Broadcast error to WebSocket clients
        await broadcast_to_session(session_id, {
            "type": "task_error",
            "task_id": task_context.task_id,
            "error": str(e)
        })

# Transparency Endpoints
@app.get("/api/v2/transparency/{session_id}")
async def get_transparency_log(session_id: str, agent_type: Optional[str] = None):
    """Get transparency log for a session"""
    try:
        agent_filter = None
        if agent_type:
            try:
                agent_filter = AgentType(agent_type)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid agent type: {agent_type}")
        
        transparency_log = await api_state.orchestrator.get_transparency_log(
            session_id, agent_filter
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "agent_type": agent_type,
            "total_actions": len(transparency_log),
            "actions": transparency_log
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting transparency log: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transparency log: {str(e)}")

@app.websocket("/ws/transparency/{session_id}")
async def transparency_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time transparency updates"""
    await websocket.accept()
    
    # Add to active connections
    if session_id not in api_state.active_websockets:
        api_state.active_websockets[session_id] = []
    api_state.active_websockets[session_id].append(websocket)
    
    try:
        # Subscribe to transparency logger
        if session_id in api_state.orchestrator.transparency_loggers:
            transparency_logger = api_state.orchestrator.transparency_loggers[session_id]
            
            # Add WebSocket callback
            async def websocket_callback(action: AgentAction):
                try:
                    await websocket.send_text(json.dumps({
                        "type": "agent_action",
                        "action": {
                            "id": action.id,
                            "agent_type": action.agent_type.value,
                            "action_type": action.action_type,
                            "description": action.description,
                            "timestamp": action.timestamp.isoformat(),
                            "input_data": action.input_data,
                            "output_data": action.output_data,
                            "execution_time": action.execution_time,
                            "success": action.success,
                            "error_message": action.error_message
                        }
                    }))
                except Exception as e:
                    logger.error(f"Error sending WebSocket message: {e}")
            
            transparency_logger.subscribe(websocket_callback)
        
        # Send initial status
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "session_id": session_id,
            "timestamp": datetime.now().isoformat()
        }))
        
        # Keep connection alive
        while True:
            try:
                # Wait for client messages (ping/pong, etc.)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.now().isoformat()
                    }))
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        # Remove from active connections
        if session_id in api_state.active_websockets:
            try:
                api_state.active_websockets[session_id].remove(websocket)
                if not api_state.active_websockets[session_id]:
                    del api_state.active_websockets[session_id]
            except ValueError:
                pass

async def broadcast_to_session(session_id: str, message: Dict[str, Any]):
    """Broadcast message to all WebSocket connections for a session"""
    if session_id not in api_state.active_websockets:
        return
    
    message_str = json.dumps(message)
    disconnected = []
    
    for websocket in api_state.active_websockets[session_id]:
        try:
            await websocket.send_text(message_str)
        except:
            disconnected.append(websocket)
    
    # Remove disconnected WebSockets
    for ws in disconnected:
        try:
            api_state.active_websockets[session_id].remove(ws)
        except ValueError:
            pass

# Session Management Endpoints
@app.post("/api/v2/sessions/{session_id}/restore-point")
async def create_restore_point(session_id: str, request: RestorePointRequest):
    """Create a restore point for the session"""
    try:
        restore_point_id = await api_state.orchestrator.create_restore_point(
            session_id, request.checkpoint_name
        )
        
        return {
            "success": True,
            "restore_point_id": restore_point_id,
            "session_id": session_id,
            "checkpoint_name": request.checkpoint_name,
            "created_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error creating restore point: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create restore point: {str(e)}")

@app.post("/api/v2/sessions/restore")
async def restore_session(request: RestoreSessionRequest):
    """Restore session from a checkpoint"""
    try:
        success = await api_state.orchestrator.restore_session(
            request.restore_point_id, request.target_session_id
        )
        
        if success:
            return {
                "success": True,
                "restore_point_id": request.restore_point_id,
                "target_session_id": request.target_session_id,
                "restored_at": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to restore session")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to restore session: {str(e)}")

# Vibe Coding Endpoints
@app.post("/api/v2/vibe-coding/create-app")
async def create_app_from_description(request: VibeCodingRequest):
    """Create a full-stack application from natural language description"""
    try:
        app = await api_state.vibe_engine.create_app_from_description(
            description=request.description,
            app_name=None  # Auto-generate name
        )
        
        return {
            "success": True,
            "app": {
                "app_id": app.app_id,
                "name": app.name,
                "description": app.description,
                "stack_type": app.stack_type.value,
                "components": [
                    {
                        "name": comp.name,
                        "type": comp.component_type.value,
                        "file_path": comp.file_path,
                        "dependencies": comp.dependencies
                    }
                    for comp in app.components
                ],
                "deployment_config": app.deployment_config,
                "workspace_path": app.workspace_path,
                "created_at": app.created_at.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating app: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create app: {str(e)}")

@app.post("/api/v2/vibe-coding/deploy-app/{app_id}")
async def deploy_app(app_id: str, deployment_target: str = "docker"):
    """Deploy a generated application"""
    try:
        result = await api_state.vibe_engine.deploy_app(app_id, deployment_target)
        
        return {
            "success": result["success"],
            **result
        }
        
    except Exception as e:
        logger.error(f"Error deploying app: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to deploy app: {str(e)}")

@app.get("/api/v2/vibe-coding/apps")
async def list_generated_apps():
    """List all generated applications"""
    try:
        apps = api_state.vibe_engine.list_generated_apps()
        
        return {
            "success": True,
            "total_apps": len(apps),
            "apps": apps
        }
        
    except Exception as e:
        logger.error(f"Error listing apps: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list apps: {str(e)}")

@app.get("/api/v2/vibe-coding/apps/{app_id}")
async def get_app_info(app_id: str):
    """Get detailed information about a generated app"""
    try:
        app_info = api_state.vibe_engine.get_app_info(app_id)
        
        if app_info:
            return {
                "success": True,
                "app": app_info
            }
        else:
            raise HTTPException(status_code=404, detail="App not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting app info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get app info: {str(e)}")

# System Metrics and Health
@app.get("/api/v2/system/metrics")
async def get_system_metrics():
    """Get comprehensive system metrics"""
    try:
        metrics = api_state.orchestrator.get_metrics()
        
        return {
            "success": True,
            "metrics": metrics,
            "active_sessions": len(api_state.orchestrator.transparency_loggers),
            "active_websockets": sum(len(ws_list) for ws_list in api_state.active_websockets.values()),
            "generated_apps": len(api_state.vibe_engine.generated_apps),
            "system_status": "operational",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get system metrics: {str(e)}")

@app.get("/api/v2/system/health")
async def health_check():
    """System health check endpoint"""
    try:
        health_status = {
            "status": "healthy",
            "orchestrator": api_state.orchestrator is not None,
            "vibe_engine": api_state.vibe_engine is not None,
            "workspace_accessible": api_state.workspace_root.exists(),
            "storage_accessible": api_state.storage_path.exists(),
            "timestamp": datetime.now().isoformat()
        }
        
        # Check if all components are healthy
        all_healthy = all([
            health_status["orchestrator"],
            health_status["vibe_engine"],
            health_status["workspace_accessible"],
            health_status["storage_accessible"]
        ])
        
        if not all_healthy:
            health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    uvicorn.run(
        "unified_api:app",
        host="0.0.0.0",
        port=12001,
        reload=True,
        log_level="info"
    )