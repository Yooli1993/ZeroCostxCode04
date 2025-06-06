"""
Vibe Coding Engine - Emergent-inspired natural language to full-stack applications
Implements conversational app development with automatic deployment capabilities.
"""

import asyncio
import json
import logging
import os
import shutil
import subprocess
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class StackType(Enum):
    """Supported full-stack architectures"""
    REACT_NODEJS = "react_nodejs"
    PYTHON_FLASK = "python_flask"
    DJANGO_REACT = "django_react"
    NEXTJS_FULLSTACK = "nextjs_fullstack"
    VUE_EXPRESS = "vue_express"
    FASTAPI_REACT = "fastapi_react"
    FULLSTACK_AI = "fullstack_ai"

class ComponentType(Enum):
    """Application component types"""
    FRONTEND = "frontend"
    BACKEND = "backend"
    DATABASE = "database"
    AUTHENTICATION = "authentication"
    API = "api"
    DEPLOYMENT = "deployment"
    TESTING = "testing"
    DOCUMENTATION = "documentation"

@dataclass
class AppRequirement:
    """Represents a parsed application requirement"""
    component: ComponentType
    description: str
    priority: int = 1
    dependencies: List[str] = None
    technical_specs: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.technical_specs is None:
            self.technical_specs = {}

@dataclass
class GeneratedComponent:
    """Represents a generated application component"""
    component_type: ComponentType
    name: str
    code: str
    file_path: str
    dependencies: List[str]
    configuration: Dict[str, Any]
    tests: Optional[str] = None
    documentation: Optional[str] = None

@dataclass
class FullStackApp:
    """Complete full-stack application structure"""
    app_id: str
    name: str
    description: str
    stack_type: StackType
    components: List[GeneratedComponent]
    deployment_config: Dict[str, Any]
    environment_vars: Dict[str, str]
    created_at: datetime
    workspace_path: str

class RequirementParser:
    """Parses natural language into structured app requirements"""
    
    def __init__(self):
        self.component_keywords = {
            ComponentType.FRONTEND: ["ui", "interface", "frontend", "react", "vue", "angular", "dashboard"],
            ComponentType.BACKEND: ["api", "server", "backend", "endpoints", "routes", "logic"],
            ComponentType.DATABASE: ["database", "db", "storage", "data", "persistence", "mongodb", "postgresql"],
            ComponentType.AUTHENTICATION: ["auth", "login", "signup", "jwt", "oauth", "security", "users"],
            ComponentType.API: ["api", "rest", "graphql", "endpoints", "routes", "integration"],
            ComponentType.DEPLOYMENT: ["deploy", "hosting", "docker", "cloud", "aws", "vercel", "heroku"],
            ComponentType.TESTING: ["test", "testing", "unit", "integration", "e2e", "jest", "pytest"],
            ComponentType.DOCUMENTATION: ["docs", "documentation", "readme", "api docs", "swagger"]
        }
        
        self.stack_indicators = {
            StackType.REACT_NODEJS: ["react", "node", "express", "javascript"],
            StackType.PYTHON_FLASK: ["python", "flask", "jinja"],
            StackType.DJANGO_REACT: ["django", "react", "python"],
            StackType.NEXTJS_FULLSTACK: ["nextjs", "next.js", "vercel"],
            StackType.VUE_EXPRESS: ["vue", "express", "node"],
            StackType.FASTAPI_REACT: ["fastapi", "react", "python"],
            StackType.FULLSTACK_AI: ["ai", "machine learning", "ml", "llm"]
        }
    
    def parse_requirements(self, description: str) -> Dict[str, Any]:
        """Parse natural language description into structured requirements"""
        description_lower = description.lower()
        
        # Detect stack type
        detected_stack = self._detect_stack_type(description_lower)
        
        # Extract components
        components = self._extract_components(description_lower)
        
        # Parse specific features
        features = self._extract_features(description_lower)
        
        # Determine complexity
        complexity = self._assess_complexity(description, components, features)
        
        return {
            "stack_type": detected_stack,
            "components": components,
            "features": features,
            "complexity": complexity,
            "estimated_time": self._estimate_development_time(complexity, components),
            "deployment_suggestions": self._suggest_deployment_options(detected_stack)
        }
    
    def _detect_stack_type(self, description: str) -> StackType:
        """Detect the most appropriate stack type"""
        scores = {}
        
        for stack_type, keywords in self.stack_indicators.items():
            score = sum(1 for keyword in keywords if keyword in description)
            if score > 0:
                scores[stack_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        # Default to React + Node.js for web apps
        if any(web_keyword in description for web_keyword in ["web", "website", "app", "dashboard"]):
            return StackType.REACT_NODEJS
        
        # Default to FastAPI + React for AI/ML apps
        if any(ai_keyword in description for ai_keyword in ["ai", "ml", "data", "analysis"]):
            return StackType.FULLSTACK_AI
        
        return StackType.REACT_NODEJS
    
    def _extract_components(self, description: str) -> List[AppRequirement]:
        """Extract required components from description"""
        components = []
        
        for component_type, keywords in self.component_keywords.items():
            if any(keyword in description for keyword in keywords):
                # Extract specific requirements for this component
                component_desc = self._extract_component_description(description, keywords)
                
                requirement = AppRequirement(
                    component=component_type,
                    description=component_desc,
                    priority=self._determine_priority(component_type, description)
                )
                components.append(requirement)
        
        # Ensure essential components are included
        essential_components = [ComponentType.FRONTEND, ComponentType.BACKEND]
        for essential in essential_components:
            if not any(comp.component == essential for comp in components):
                components.append(AppRequirement(
                    component=essential,
                    description=f"Basic {essential.value} implementation",
                    priority=1
                ))
        
        return components
    
    def _extract_component_description(self, description: str, keywords: List[str]) -> str:
        """Extract specific description for a component"""
        sentences = description.split('.')
        relevant_sentences = []
        
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in keywords):
                relevant_sentences.append(sentence.strip())
        
        return '. '.join(relevant_sentences) if relevant_sentences else f"Standard implementation"
    
    def _determine_priority(self, component_type: ComponentType, description: str) -> int:
        """Determine component priority based on description"""
        high_priority_indicators = ["critical", "essential", "important", "main", "primary"]
        medium_priority_indicators = ["should", "would like", "prefer"]
        
        description_lower = description.lower()
        
        if any(indicator in description_lower for indicator in high_priority_indicators):
            return 1
        elif any(indicator in description_lower for indicator in medium_priority_indicators):
            return 2
        else:
            return 3
    
    def _extract_features(self, description: str) -> List[str]:
        """Extract specific features mentioned in description"""
        feature_patterns = {
            "real-time": ["real-time", "live", "websocket", "socket.io"],
            "payment": ["payment", "stripe", "paypal", "billing", "subscription"],
            "social_auth": ["google", "facebook", "github", "oauth", "social login"],
            "file_upload": ["upload", "file", "image", "document", "attachment"],
            "search": ["search", "filter", "query", "elasticsearch"],
            "notifications": ["notification", "email", "sms", "push", "alert"],
            "analytics": ["analytics", "tracking", "metrics", "dashboard"],
            "mobile": ["mobile", "responsive", "pwa", "react native"],
            "admin": ["admin", "management", "cms", "dashboard"],
            "api_integration": ["api", "integration", "third-party", "webhook"]
        }
        
        detected_features = []
        for feature, keywords in feature_patterns.items():
            if any(keyword in description for keyword in keywords):
                detected_features.append(feature)
        
        return detected_features
    
    def _assess_complexity(self, description: str, components: List[AppRequirement], 
                          features: List[str]) -> str:
        """Assess overall application complexity"""
        complexity_score = 0
        
        # Base complexity from components
        complexity_score += len(components) * 2
        
        # Additional complexity from features
        complexity_score += len(features) * 3
        
        # Complexity indicators in description
        complex_indicators = ["complex", "advanced", "enterprise", "scalable", "microservices"]
        simple_indicators = ["simple", "basic", "minimal", "prototype", "mvp"]
        
        description_lower = description.lower()
        
        if any(indicator in description_lower for indicator in complex_indicators):
            complexity_score += 10
        elif any(indicator in description_lower for indicator in simple_indicators):
            complexity_score -= 5
        
        if complexity_score <= 10:
            return "simple"
        elif complexity_score <= 25:
            return "medium"
        else:
            return "complex"
    
    def _estimate_development_time(self, complexity: str, components: List[AppRequirement]) -> str:
        """Estimate development time"""
        base_times = {
            "simple": "2-4 hours",
            "medium": "1-2 days", 
            "complex": "3-7 days"
        }
        
        return base_times.get(complexity, "1-2 days")
    
    def _suggest_deployment_options(self, stack_type: StackType) -> List[str]:
        """Suggest deployment options based on stack"""
        deployment_options = {
            StackType.REACT_NODEJS: ["Vercel", "Netlify", "Heroku", "AWS"],
            StackType.PYTHON_FLASK: ["Heroku", "PythonAnywhere", "AWS", "DigitalOcean"],
            StackType.DJANGO_REACT: ["Heroku", "AWS", "DigitalOcean", "Railway"],
            StackType.NEXTJS_FULLSTACK: ["Vercel", "Netlify", "AWS"],
            StackType.VUE_EXPRESS: ["Netlify", "Heroku", "AWS"],
            StackType.FASTAPI_REACT: ["Heroku", "AWS", "DigitalOcean", "Railway"],
            StackType.FULLSTACK_AI: ["AWS", "Google Cloud", "Hugging Face Spaces"]
        }
        
        return deployment_options.get(stack_type, ["Heroku", "AWS", "Vercel"])

class CodeGenerator:
    """Generates code for different application components"""
    
    def __init__(self):
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, Dict[str, str]]:
        """Load code templates for different stacks and components"""
        return {
            "react_nodejs": {
                "frontend": self._get_react_frontend_template(),
                "backend": self._get_nodejs_backend_template(),
                "package_json_frontend": self._get_react_package_json(),
                "package_json_backend": self._get_nodejs_package_json(),
                "dockerfile_frontend": self._get_react_dockerfile(),
                "dockerfile_backend": self._get_nodejs_dockerfile()
            },
            "fastapi_react": {
                "frontend": self._get_react_frontend_template(),
                "backend": self._get_fastapi_backend_template(),
                "requirements": self._get_fastapi_requirements(),
                "dockerfile_backend": self._get_fastapi_dockerfile()
            }
        }
    
    def generate_component(self, requirement: AppRequirement, stack_type: StackType, 
                          app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate code for a specific component"""
        
        if requirement.component == ComponentType.FRONTEND:
            return self._generate_frontend(requirement, stack_type, app_context)
        elif requirement.component == ComponentType.BACKEND:
            return self._generate_backend(requirement, stack_type, app_context)
        elif requirement.component == ComponentType.DATABASE:
            return self._generate_database(requirement, stack_type, app_context)
        elif requirement.component == ComponentType.AUTHENTICATION:
            return self._generate_auth(requirement, stack_type, app_context)
        elif requirement.component == ComponentType.DEPLOYMENT:
            return self._generate_deployment(requirement, stack_type, app_context)
        else:
            return self._generate_generic_component(requirement, stack_type, app_context)
    
    def _generate_frontend(self, requirement: AppRequirement, stack_type: StackType, 
                          app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate frontend component"""
        
        if stack_type in [StackType.REACT_NODEJS, StackType.FASTAPI_REACT, StackType.DJANGO_REACT]:
            code = self.templates["react_nodejs"]["frontend"].format(
                app_name=app_context.get("name", "MyApp"),
                description=requirement.description
            )
            
            return GeneratedComponent(
                component_type=ComponentType.FRONTEND,
                name="React Frontend",
                code=code,
                file_path="frontend/src/App.js",
                dependencies=["react", "react-dom", "axios"],
                configuration={
                    "framework": "React",
                    "build_tool": "Create React App",
                    "styling": "CSS Modules"
                },
                tests=self._generate_react_tests(),
                documentation=self._generate_frontend_docs()
            )
        
        # Add more frontend frameworks as needed
        return self._generate_generic_component(requirement, stack_type, app_context)
    
    def _generate_backend(self, requirement: AppRequirement, stack_type: StackType, 
                         app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate backend component"""
        
        if stack_type == StackType.FASTAPI_REACT:
            code = self.templates["fastapi_react"]["backend"].format(
                app_name=app_context.get("name", "MyApp"),
                description=requirement.description
            )
            
            return GeneratedComponent(
                component_type=ComponentType.BACKEND,
                name="FastAPI Backend",
                code=code,
                file_path="backend/main.py",
                dependencies=["fastapi", "uvicorn", "pydantic"],
                configuration={
                    "framework": "FastAPI",
                    "server": "Uvicorn",
                    "cors": True
                },
                tests=self._generate_fastapi_tests(),
                documentation=self._generate_backend_docs()
            )
        
        elif stack_type == StackType.REACT_NODEJS:
            code = self.templates["react_nodejs"]["backend"].format(
                app_name=app_context.get("name", "MyApp"),
                description=requirement.description
            )
            
            return GeneratedComponent(
                component_type=ComponentType.BACKEND,
                name="Node.js Backend",
                code=code,
                file_path="backend/server.js",
                dependencies=["express", "cors", "helmet"],
                configuration={
                    "framework": "Express.js",
                    "runtime": "Node.js",
                    "cors": True
                },
                tests=self._generate_nodejs_tests(),
                documentation=self._generate_backend_docs()
            )
        
        return self._generate_generic_component(requirement, stack_type, app_context)
    
    def _generate_database(self, requirement: AppRequirement, stack_type: StackType, 
                          app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate database component"""
        
        # Database schema and configuration
        schema_code = f"""
-- Database Schema for {app_context.get('name', 'MyApp')}
-- Generated based on: {requirement.description}

-- Users table (if authentication is needed)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main application data table
CREATE TABLE app_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_app_data_user_id ON app_data(user_id);
CREATE INDEX idx_app_data_created_at ON app_data(created_at);
"""
        
        return GeneratedComponent(
            component_type=ComponentType.DATABASE,
            name="PostgreSQL Database",
            code=schema_code,
            file_path="database/schema.sql",
            dependencies=["postgresql"],
            configuration={
                "database": "PostgreSQL",
                "connection_pool": True,
                "migrations": True
            },
            documentation=self._generate_database_docs()
        )
    
    def _generate_auth(self, requirement: AppRequirement, stack_type: StackType, 
                      app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate authentication component"""
        
        if stack_type == StackType.FASTAPI_REACT:
            auth_code = f"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

# Authentication configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class AuthManager:
    def __init__(self):
        self.pwd_context = pwd_context
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: timedelta = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({{"exp": expire}})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
            return username
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )

auth_manager = AuthManager()
"""
            
            return GeneratedComponent(
                component_type=ComponentType.AUTHENTICATION,
                name="JWT Authentication",
                code=auth_code,
                file_path="backend/auth.py",
                dependencies=["python-jose", "passlib", "bcrypt"],
                configuration={
                    "auth_type": "JWT",
                    "password_hashing": "bcrypt",
                    "token_expiry": "30 minutes"
                },
                tests=self._generate_auth_tests(),
                documentation=self._generate_auth_docs()
            )
        
        return self._generate_generic_component(requirement, stack_type, app_context)
    
    def _generate_deployment(self, requirement: AppRequirement, stack_type: StackType, 
                           app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate deployment configuration"""
        
        docker_compose = f"""
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/{app_context.get('name', 'myapp')}
      - SECRET_KEY=your-secret-key-here
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB={app_context.get('name', 'myapp')}
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
"""
        
        return GeneratedComponent(
            component_type=ComponentType.DEPLOYMENT,
            name="Docker Deployment",
            code=docker_compose,
            file_path="docker-compose.yml",
            dependencies=["docker", "docker-compose"],
            configuration={
                "deployment_type": "Docker Compose",
                "services": ["frontend", "backend", "database"],
                "ports": {"frontend": 3000, "backend": 8000, "db": 5432}
            },
            documentation=self._generate_deployment_docs()
        )
    
    def _generate_generic_component(self, requirement: AppRequirement, stack_type: StackType, 
                                  app_context: Dict[str, Any]) -> GeneratedComponent:
        """Generate a generic component when specific generator is not available"""
        
        generic_code = f"""
# {requirement.component.value.title()} Component
# Generated for: {requirement.description}
# Stack: {stack_type.value}

# TODO: Implement {requirement.component.value} functionality
# This is a placeholder implementation

class {requirement.component.value.title()}Component:
    def __init__(self):
        self.name = "{requirement.component.value}"
        self.description = "{requirement.description}"
    
    def initialize(self):
        \"\"\"Initialize the {requirement.component.value} component\"\"\"
        print(f"Initializing {{self.name}} component")
    
    def process(self, data):
        \"\"\"Process data through this component\"\"\"
        # Implement component-specific logic here
        return data

# Example usage
if __name__ == "__main__":
    component = {requirement.component.value.title()}Component()
    component.initialize()
"""
        
        return GeneratedComponent(
            component_type=requirement.component,
            name=f"{requirement.component.value.title()} Component",
            code=generic_code,
            file_path=f"{requirement.component.value}/{requirement.component.value}.py",
            dependencies=[],
            configuration={"type": "generic", "auto_generated": True},
            documentation=f"Auto-generated {requirement.component.value} component"
        )
    
    # Template methods
    def _get_react_frontend_template(self) -> str:
        return """
import React, {{ useState, useEffect }} from 'react';
import axios from 'axios';
import './App.css';

function App() {{
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {{
    fetchData();
  }}, []);

  const fetchData = async () => {{
    try {{
      const response = await axios.get('/api/data');
      setData(response.data);
      setLoading(false);
    }} catch (err) {{
      setError(err.message);
      setLoading(false);
    }}
  }};

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {{error}}</div>;

  return (
    <div className="App">
      <header className="App-header">
        <h1>{app_name}</h1>
        <p>{description}</p>
      </header>
      <main>
        <div className="content">
          {{data && (
            <div className="data-display">
              <h2>Data</h2>
              <pre>{{JSON.stringify(data, null, 2)}}</pre>
            </div>
          )}}
        </div>
      </main>
    </div>
  );
}}

export default App;
"""
    
    def _get_fastapi_backend_template(self) -> str:
        return """
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="{app_name}",
    description="{description}",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class DataModel(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None

class ResponseModel(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None

# In-memory storage (replace with database)
data_store = []

@app.get("/")
async def root():
    return {{"message": "Welcome to {app_name} API"}}

@app.get("/api/data", response_model=List[DataModel])
async def get_data():
    return data_store

@app.post("/api/data", response_model=ResponseModel)
async def create_data(item: DataModel):
    item.id = len(data_store) + 1
    data_store.append(item)
    return ResponseModel(success=True, data=item.dict(), message="Data created successfully")

@app.get("/api/data/{{item_id}}", response_model=DataModel)
async def get_data_item(item_id: int):
    for item in data_store:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@app.put("/api/data/{{item_id}}", response_model=ResponseModel)
async def update_data(item_id: int, updated_item: DataModel):
    for i, item in enumerate(data_store):
        if item.id == item_id:
            updated_item.id = item_id
            data_store[i] = updated_item
            return ResponseModel(success=True, data=updated_item.dict(), message="Data updated successfully")
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/api/data/{{item_id}}", response_model=ResponseModel)
async def delete_data(item_id: int):
    for i, item in enumerate(data_store):
        if item.id == item_id:
            del data_store[i]
            return ResponseModel(success=True, message="Data deleted successfully")
    raise HTTPException(status_code=404, detail="Item not found")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
"""
    
    def _get_nodejs_backend_template(self) -> str:
        return """
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database)
let dataStore = [];
let nextId = 1;

// Routes
app.get('/', (req, res) => {{
  res.json({{ message: 'Welcome to {app_name} API' }});
}});

app.get('/api/data', (req, res) => {{
  res.json(dataStore);
}});

app.post('/api/data', (req, res) => {{
  const item = {{
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  }};
  
  dataStore.push(item);
  res.status(201).json({{
    success: true,
    data: item,
    message: 'Data created successfully'
  }});
}});

app.get('/api/data/:id', (req, res) => {{
  const id = parseInt(req.params.id);
  const item = dataStore.find(item => item.id === id);
  
  if (!item) {{
    return res.status(404).json({{
      success: false,
      message: 'Item not found'
    }});
  }}
  
  res.json(item);
}});

app.put('/api/data/:id', (req, res) => {{
  const id = parseInt(req.params.id);
  const index = dataStore.findIndex(item => item.id === id);
  
  if (index === -1) {{
    return res.status(404).json({{
      success: false,
      message: 'Item not found'
    }});
  }}
  
  dataStore[index] = {{
    ...dataStore[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }};
  
  res.json({{
    success: true,
    data: dataStore[index],
    message: 'Data updated successfully'
  }});
}});

app.delete('/api/data/:id', (req, res) => {{
  const id = parseInt(req.params.id);
  const index = dataStore.findIndex(item => item.id === id);
  
  if (index === -1) {{
    return res.status(404).json({{
      success: false,
      message: 'Item not found'
    }});
  }}
  
  dataStore.splice(index, 1);
  res.json({{
    success: true,
    message: 'Data deleted successfully'
  }});
}});

// Error handling middleware
app.use((err, req, res, next) => {{
  console.error(err.stack);
  res.status(500).json({{
    success: false,
    message: 'Something went wrong!'
  }});
}});

app.listen(PORT, () => {{
  console.log(`{app_name} server running on port ${{PORT}}`);
}});
"""
    
    def _get_react_package_json(self) -> str:
        return """{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8000"
}"""
    
    def _get_nodejs_package_json(self) -> str:
        return """{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend API server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}"""
    
    def _get_fastapi_requirements(self) -> str:
        return """fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.1"""
    
    def _get_react_dockerfile(self) -> str:
        return """FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]"""
    
    def _get_nodejs_dockerfile(self) -> str:
        return """FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]"""
    
    def _get_fastapi_dockerfile(self) -> str:
        return """FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]"""
    
    # Test generation methods
    def _generate_react_tests(self) -> str:
        return """import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/MyApp/i);
  expect(titleElement).toBeInTheDocument();
});"""
    
    def _generate_fastapi_tests(self) -> str:
        return """import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_create_data():
    response = client.post("/api/data", json={"name": "test", "description": "test item"})
    assert response.status_code == 200
    assert response.json()["success"] == True"""
    
    def _generate_nodejs_tests(self) -> str:
        return """const request = require('supertest');
const app = require('./server');

describe('API Endpoints', () => {
  test('GET / should return welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
  });

  test('POST /api/data should create new item', async () => {
    const response = await request(app)
      .post('/api/data')
      .send({ name: 'test', description: 'test item' });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});"""
    
    def _generate_auth_tests(self) -> str:
        return """import pytest
from auth import AuthManager

def test_password_hashing():
    auth = AuthManager()
    password = "testpassword"
    hashed = auth.get_password_hash(password)
    assert auth.verify_password(password, hashed)
    assert not auth.verify_password("wrongpassword", hashed)

def test_token_creation():
    auth = AuthManager()
    token = auth.create_access_token({"sub": "testuser"})
    assert token is not None"""
    
    # Documentation generation methods
    def _generate_frontend_docs(self) -> str:
        return """# Frontend Documentation

## Overview
React-based frontend application with modern UI components.

## Features
- Responsive design
- API integration
- Error handling
- Loading states

## Development
```bash
npm install
npm start
```

## Build
```bash
npm run build
```"""
    
    def _generate_backend_docs(self) -> str:
        return """# Backend API Documentation

## Overview
RESTful API server with CRUD operations.

## Endpoints
- GET / - Welcome message
- GET /api/data - List all data
- POST /api/data - Create new data
- GET /api/data/{id} - Get specific data
- PUT /api/data/{id} - Update data
- DELETE /api/data/{id} - Delete data

## Development
```bash
npm install
npm run dev
```"""
    
    def _generate_database_docs(self) -> str:
        return """# Database Documentation

## Schema
- users: User authentication data
- app_data: Main application data

## Setup
```sql
psql -U postgres -d myapp -f schema.sql
```

## Migrations
Use Alembic for database migrations."""
    
    def _generate_auth_docs(self) -> str:
        return """# Authentication Documentation

## Overview
JWT-based authentication system.

## Features
- Password hashing with bcrypt
- JWT token generation
- Token validation middleware

## Usage
Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```"""
    
    def _generate_deployment_docs(self) -> str:
        return """# Deployment Documentation

## Docker Compose
```bash
docker-compose up -d
```

## Services
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Database: localhost:5432

## Environment Variables
Set the following in production:
- SECRET_KEY
- DATABASE_URL
- REACT_APP_API_URL"""

class VibeCodingEngine:
    """Main engine for natural language to full-stack application generation"""
    
    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root)
        self.workspace_root.mkdir(parents=True, exist_ok=True)
        
        self.parser = RequirementParser()
        self.generator = CodeGenerator()
        self.generated_apps: Dict[str, FullStackApp] = {}
    
    async def create_app_from_description(self, description: str, 
                                        app_name: Optional[str] = None) -> FullStackApp:
        """Create a complete full-stack application from natural language description"""
        
        # Generate unique app ID
        app_id = str(uuid.uuid4())
        
        # Use provided name or generate from description
        if not app_name:
            app_name = self._generate_app_name(description)
        
        # Parse requirements
        parsed_requirements = self.parser.parse_requirements(description)
        
        # Create app workspace
        app_workspace = self.workspace_root / app_id
        app_workspace.mkdir(parents=True, exist_ok=True)
        
        # Generate components
        components = []
        for requirement in parsed_requirements["components"]:
            component = self.generator.generate_component(
                requirement, 
                parsed_requirements["stack_type"],
                {"name": app_name, "description": description}
            )
            components.append(component)
        
        # Generate deployment configuration
        deployment_requirement = AppRequirement(
            component=ComponentType.DEPLOYMENT,
            description="Docker-based deployment configuration"
        )
        deployment_component = self.generator.generate_component(
            deployment_requirement,
            parsed_requirements["stack_type"],
            {"name": app_name, "description": description}
        )
        components.append(deployment_component)
        
        # Create full-stack app structure
        app = FullStackApp(
            app_id=app_id,
            name=app_name,
            description=description,
            stack_type=parsed_requirements["stack_type"],
            components=components,
            deployment_config={
                "type": "docker-compose",
                "services": [comp.name for comp in components],
                "estimated_time": parsed_requirements["estimated_time"],
                "complexity": parsed_requirements["complexity"]
            },
            environment_vars={
                "NODE_ENV": "development",
                "SECRET_KEY": "your-secret-key-here",
                "DATABASE_URL": f"postgresql://user:password@localhost:5432/{app_name.lower()}"
            },
            created_at=datetime.now(),
            workspace_path=str(app_workspace)
        )
        
        # Write files to workspace
        await self._write_app_to_workspace(app)
        
        # Store generated app
        self.generated_apps[app_id] = app
        
        return app
    
    async def _write_app_to_workspace(self, app: FullStackApp):
        """Write generated application files to workspace"""
        workspace = Path(app.workspace_path)
        
        # Create directory structure
        directories = set()
        for component in app.components:
            file_path = Path(component.file_path)
            directories.add(file_path.parent)
        
        for directory in directories:
            (workspace / directory).mkdir(parents=True, exist_ok=True)
        
        # Write component files
        for component in app.components:
            file_path = workspace / component.file_path
            
            async with aiofiles.open(file_path, 'w') as f:
                await f.write(component.code)
            
            # Write tests if available
            if component.tests:
                test_path = workspace / f"tests/test_{component.name.lower().replace(' ', '_')}.py"
                test_path.parent.mkdir(parents=True, exist_ok=True)
                async with aiofiles.open(test_path, 'w') as f:
                    await f.write(component.tests)
            
            # Write documentation if available
            if component.documentation:
                doc_path = workspace / f"docs/{component.name.lower().replace(' ', '_')}.md"
                doc_path.parent.mkdir(parents=True, exist_ok=True)
                async with aiofiles.open(doc_path, 'w') as f:
                    await f.write(component.documentation)
        
        # Write package.json files for Node.js components
        if app.stack_type in [StackType.REACT_NODEJS, StackType.VUE_EXPRESS]:
            # Frontend package.json
            frontend_package = workspace / "frontend/package.json"
            if not frontend_package.exists():
                frontend_package.parent.mkdir(parents=True, exist_ok=True)
                async with aiofiles.open(frontend_package, 'w') as f:
                    await f.write(self.generator.templates["react_nodejs"]["package_json_frontend"])
            
            # Backend package.json
            backend_package = workspace / "backend/package.json"
            if not backend_package.exists():
                backend_package.parent.mkdir(parents=True, exist_ok=True)
                async with aiofiles.open(backend_package, 'w') as f:
                    await f.write(self.generator.templates["react_nodejs"]["package_json_backend"])
        
        # Write requirements.txt for Python components
        if app.stack_type in [StackType.FASTAPI_REACT, StackType.DJANGO_REACT]:
            requirements_file = workspace / "backend/requirements.txt"
            if not requirements_file.exists():
                requirements_file.parent.mkdir(parents=True, exist_ok=True)
                async with aiofiles.open(requirements_file, 'w') as f:
                    await f.write(self.generator.templates["fastapi_react"]["requirements"])
        
        # Write README.md
        readme_content = self._generate_readme(app)
        readme_path = workspace / "README.md"
        async with aiofiles.open(readme_path, 'w') as f:
            await f.write(readme_content)
        
        logger.info(f"Application {app.name} written to {app.workspace_path}")
    
    def _generate_app_name(self, description: str) -> str:
        """Generate app name from description"""
        # Extract key words and create a name
        words = description.lower().split()
        key_words = [word for word in words if len(word) > 3 and word.isalpha()]
        
        if key_words:
            return ''.join(word.capitalize() for word in key_words[:2]) + "App"
        else:
            return "MyApp"
    
    def _generate_readme(self, app: FullStackApp) -> str:
        """Generate README.md for the application"""
        return f"""# {app.name}

{app.description}

## Generated Application Details

- **Stack**: {app.stack_type.value}
- **Components**: {len(app.components)}
- **Created**: {app.created_at.strftime('%Y-%m-%d %H:%M:%S')}
- **Complexity**: {app.deployment_config.get('complexity', 'medium')}
- **Estimated Development Time**: {app.deployment_config.get('estimated_time', '1-2 days')}

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Backend
```bash
cd backend
{"npm install && npm start" if app.stack_type == StackType.REACT_NODEJS else "pip install -r requirements.txt && python main.py"}
```

## Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Database**: localhost:5432 (if applicable)

## Components

{chr(10).join(f"- **{comp.name}**: {comp.component_type.value}" for comp in app.components)}

## Environment Variables

```bash
{chr(10).join(f"{key}={value}" for key, value in app.environment_vars.items())}
```

## Generated by ZeroCostxCode Enhanced

This application was generated using the Vibe Coding Engine, which transforms natural language descriptions into production-ready full-stack applications.

### Features
- ✅ Complete full-stack architecture
- ✅ Docker deployment ready
- ✅ Authentication system (if requested)
- ✅ Database integration (if requested)
- ✅ API documentation
- ✅ Unit tests
- ✅ Production deployment configuration

### Next Steps
1. Customize the generated code to match your specific requirements
2. Add additional features and functionality
3. Configure environment variables for production
4. Deploy to your preferred hosting platform

## Support

For questions about the generated code or to request modifications, please refer to the ZeroCostxCode documentation.
"""
    
    async def deploy_app(self, app_id: str, deployment_target: str = "local") -> Dict[str, Any]:
        """Deploy generated application"""
        if app_id not in self.generated_apps:
            raise ValueError(f"App {app_id} not found")
        
        app = self.generated_apps[app_id]
        workspace = Path(app.workspace_path)
        
        if deployment_target == "local":
            return await self._deploy_locally(app, workspace)
        elif deployment_target == "docker":
            return await self._deploy_docker(app, workspace)
        else:
            raise ValueError(f"Unsupported deployment target: {deployment_target}")
    
    async def _deploy_locally(self, app: FullStackApp, workspace: Path) -> Dict[str, Any]:
        """Deploy application locally"""
        try:
            # Install dependencies and start services
            if app.stack_type == StackType.REACT_NODEJS:
                # Install frontend dependencies
                frontend_process = await asyncio.create_subprocess_shell(
                    "npm install",
                    cwd=workspace / "frontend",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await frontend_process.communicate()
                
                # Install backend dependencies
                backend_process = await asyncio.create_subprocess_shell(
                    "npm install",
                    cwd=workspace / "backend",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await backend_process.communicate()
                
            elif app.stack_type == StackType.FASTAPI_REACT:
                # Install Python dependencies
                backend_process = await asyncio.create_subprocess_shell(
                    "pip install -r requirements.txt",
                    cwd=workspace / "backend",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await backend_process.communicate()
                
                # Install frontend dependencies
                frontend_process = await asyncio.create_subprocess_shell(
                    "npm install",
                    cwd=workspace / "frontend",
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                await frontend_process.communicate()
            
            return {
                "success": True,
                "deployment_type": "local",
                "message": "Application dependencies installed successfully",
                "next_steps": [
                    "Start backend server",
                    "Start frontend development server",
                    "Access application at http://localhost:3000"
                ]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "deployment_type": "local"
            }
    
    async def _deploy_docker(self, app: FullStackApp, workspace: Path) -> Dict[str, Any]:
        """Deploy application using Docker Compose"""
        try:
            # Build and start with Docker Compose
            process = await asyncio.create_subprocess_shell(
                "docker-compose up -d --build",
                cwd=workspace,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "deployment_type": "docker",
                    "message": "Application deployed successfully with Docker",
                    "services": {
                        "frontend": "http://localhost:3000",
                        "backend": "http://localhost:8000"
                    },
                    "logs": stdout.decode('utf-8')
                }
            else:
                return {
                    "success": False,
                    "deployment_type": "docker",
                    "error": stderr.decode('utf-8')
                }
                
        except Exception as e:
            return {
                "success": False,
                "deployment_type": "docker",
                "error": str(e)
            }
    
    def get_app_info(self, app_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a generated app"""
        if app_id not in self.generated_apps:
            return None
        
        app = self.generated_apps[app_id]
        
        return {
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
            "created_at": app.created_at.isoformat(),
            "workspace_path": app.workspace_path
        }
    
    def list_generated_apps(self) -> List[Dict[str, Any]]:
        """List all generated applications"""
        return [
            {
                "app_id": app.app_id,
                "name": app.name,
                "description": app.description[:100] + "..." if len(app.description) > 100 else app.description,
                "stack_type": app.stack_type.value,
                "component_count": len(app.components),
                "created_at": app.created_at.isoformat()
            }
            for app in self.generated_apps.values()
        ]