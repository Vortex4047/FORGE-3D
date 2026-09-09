from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import trimesh
import tempfile
import os
import uuid
import ollama
import json
import re
import numpy as np

app = FastAPI()

# Enable CORS for the frontend Vite server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModelGenerationRequest(BaseModel):
    type: str # 'keychain', 'box', 'cylinder', etc.
    parameters: dict

class DynamicGenerationRequest(BaseModel):
    prompt: str
    model_name: str = 'llama3.2'
    base_url: str = 'http://localhost:11434'

@app.post("/api/generate")
async def generate_model(request: ModelGenerationRequest):
    try:
        # 1. Very basic placeholder generation using trimesh
        # In later steps we will integrate cadquery or bpy based on requirements
        mesh = None
        if request.type == 'box':
            edge = request.parameters.get('width', 20)
            mesh = trimesh.creation.box(extents=(edge, edge, edge))
        elif request.type == 'cylinder':
            mesh = trimesh.creation.cylinder(radius=10, height=20)
        else:
            # Fallback mesh
            mesh = trimesh.creation.icosphere(radius=10)
        
        # 2. Export local temp file
        import uuid
        filename = f"{uuid.uuid4().hex}.obj"
        temp_dir = os.path.join(os.path.dirname(__file__), "static")
        os.makedirs(temp_dir, exist_ok=True)
        filepath = os.path.join(temp_dir, filename)
        
        mesh.export(filepath)
        
        # 3. Return the relative URL so the frontend can fetch it
        # Assuming the FastAPI server serves the static dir or the Vite proxy handles it
        return {
            "status": "success",
            "modelUrl": f"/api/static/{filename}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.staticfiles import StaticFiles
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/api/static", StaticFiles(directory=static_dir), name="static")

@app.post("/api/generate/dynamic")
async def generate_model_dynamic(request: DynamicGenerationRequest):
    try:
        system_prompt = """You are an expert Python 3D geometry developer using the `trimesh` library.
Your task is to write a Python script that generates a 3D model based on the user's request.
Requirements:
1. ONLY return valid Python code. Do not include markdown formatting, explanations, or any text outside the code block.
2. The code MUST define a variable named `result_mesh` that holds the final `trimesh.Trimesh` object.
3. Use ONLY valid `trimesh.creation` methods. 
   - CRITICAL: Use `trimesh.creation.icosphere(radius=...)` for spheres. Do NOT use `uvsphere` or `sphere` as they do not exist.
   - Use `trimesh.creation.box(extents=[x, y, z])` for boxes.
   - Use `trimesh.creation.cylinder(radius=..., height=...)` for cylinders.
4. Keep the code concise and robust. You can use boolean operations like `mesh1.union(mesh2)`.
5. DO NOT import any other libraries and DO NOT use try/except blocks with trimesh errors.
6. CRITICAL: DO NOT call `.show()`, `.export()`, `.save()`, or ANY other I/O methods. Just assign `result_mesh = ...` and stop.
7. CRITICAL: DO NOT instantiate `trimesh.Trimesh` manually. NEVER write `trimesh.Trimesh(...)`. ONLY use `trimesh.creation` primitives and `.union()`/`.difference()`.
"""
        
        # Configure ollama client
        client = ollama.Client(host=request.base_url)
        
        # Generate code
        response = client.chat(model=request.model_name, messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': f"Create a 3D model: {request.prompt}"}
        ])
        
        generated_code = response['message']['content']
        
        # Clean markdown code blocks if the LLM accidentally includes them
        generated_code = re.sub(r'^```python\s*', '', generated_code, flags=re.MULTILINE)
        generated_code = re.sub(r'^```\s*$', '', generated_code, flags=re.MULTILINE)
        generated_code = generated_code.strip()
        
        # Execute the code in a restricted scope
        local_scope = {}
        try:
            exec(generated_code, {"trimesh": trimesh, "math": __import__('math'), "np": np, "numpy": np}, local_scope)
        except Exception as e:
            print(f"Code execution failed:\n{generated_code}")
            raise HTTPException(status_code=400, detail=f"Failed to execute generated code: {str(e)}")
            
        if "result_mesh" not in local_scope:
            raise HTTPException(status_code=400, detail="The generated code did not define the `result_mesh` variable.")
            
        mesh = local_scope["result_mesh"]
        
        if not isinstance(mesh, trimesh.Trimesh):
            raise HTTPException(status_code=400, detail="`result_mesh` is not a valid Trimesh object.")
            
        # Export local temp file
        filename = f"{uuid.uuid4().hex}.obj"
        filepath = os.path.join(static_dir, filename)
        
        mesh.export(filepath)
        
        return {
            "status": "success",
            "modelUrl": f"/api/static/{filename}",
            "generatedCode": generated_code
        }
        
    except Exception as e:
        print(f"Error in dynamic generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
