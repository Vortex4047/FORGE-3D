# Technical Requirements Document (TRD)

**Project: FORGE3D | Status: Ready for Development**

## 📊 Document Overview

Forge3D is a local-first, Electron-based desktop application (macOS/Windows) for generating and modifying 3D models via natural language prompts. This TRD acts as the strict implementation guide for AI coding agents. The app uses React for the UI, React Three Fiber (R3F) for the 3D viewport, and the Gemini API for text-to-JSON parsing. All state and files are managed locally.

## 🏗 System Architecture

```text
[ User Interface (React + shadcn/ui) ]
       │      │
       │      └─(1) Prompt Input 
       ▼
[ Local State (Zustand) ] ───(2) Text Prompt ───▶ [ AI Service (Gemini API) ]
       │                                                 │
       │                                                 ▼
       │                                          (3) JSON Parameters
       │                                          (Fallback: Local Regex Parser)
       ▼                                                 │
[ 3D Engine (@react-three/fiber) ] ◀─────────────────────┘
       │
       ├─ Geometry Generation (Three.js primitives)
       ├─ Boolean Operations (three-bvh-csg)
       └─ Viewport Rendering (Canvas)
       │
       ▼
[ Export Service (three-stdlib) ] ───(4) File Data ───▶ [ Electron IPC (Preload) ]
                                                                 │
                                                                 ▼
                                                        [ Local File System ]

```

## 🛠 Technology Stack

| Component | Technology (Exact Package Name) | Why This Choice (AI Context) |
| --- | --- | --- |
| **Framework** | `electron-vite` with `react`, `typescript` | Fastest, most standard boilerplate for modern React+Electron. AI understands Vite well. |
| **UI Library** | `shadcn-ui`, `tailwindcss`, `lucide-react` | Pre-built, accessible components. AI can generate these perfectly without custom CSS. |
| **State Management** | `zustand` | Zero-boilerplate global state for React. Ideal for linking UI controls to 3D canvas. |
| **3D Rendering** | `three`, `@react-three/fiber`, `@react-three/drei` | Declarative 3D. `drei` provides pre-built `OrbitControls`, `Grid`, and `Center` components. |
| **Boolean/CSG** | `three-bvh-csg` | Robust library for cutting holes and joining meshes. Highly performant for React. |
| **Local DB** | `electron-store` | Simple JSON-based storage for Electron. No complex database setup required. $0 cost. |
| **AI API** | `@google/generative-ai` | Gemini SDK. Free tier is generous. Supports JSON-enforced outputs. |
| **File Export** | `three-stdlib` (`STLExporter`, `GLTFExporter`) | Standard Three.js add-ons for robust 3D file encoding. |

## 🗄 Database Schema (Local Storage via `electron-store`)

Since this is an offline-first desktop app, do not use Firebase or SQL. Use `electron-store`. The store will contain three primary keys (collections).

**Collection 1: `app_settings**`

* `geminiApiKey` (string, default: `""`)
* `theme` (string, default: `"dark"`)
* `defaultUnits` (string, default: `"mm"`)

**Collection 2: `prompt_history**`

* `id` (string, uuid)
* `prompt` (string)
* `timestamp` (number, unix)

**Collection 3: `local_models**`

* `id` (string, uuid)
* `type` (string, enum: `"keychain"`, `"box"`, `"cylinder"`, `"sphere"`)
* `parameters` (object)
* `text` (string)
* `thickness` (number)
* `width` (number)
* `height` (number)
* `holeSize` (number)
* `holePosition` (string, enum: `"center"`, `"top-left"`, `"top-right"`, `"bottom-center"`)
* `edgeRadius` (number)
* `scale` (number)


* `prompt` (string)
* `createdAt` (number, unix)

## 🔌 API Design (Electron IPC & Internal Functions)

**Electron IPC Hooks (exposed via `window.api` in `preload.ts`):**

1. **`invoke_saveFile(fileBuffer: ArrayBuffer, defaultName: string, extensions: string[])`**
* *Purpose:* Triggers native OS save dialog. Returns filepath string.


2. **`invoke_openFile(extensions: string[])`**
* *Purpose:* Triggers native OS open dialog. Returns file buffer and filename.


3. **`invoke_getStoreValue(key: string)` / `invoke_setStoreValue(key: string, value: any)**`
* *Purpose:* Reads/writes to `electron-store` safely from the renderer process.



**AI Logic (Renderer Process):**

1. **`generateModelParams(prompt: string, apiKey: string)`**
* *Purpose:* Calls Gemini API. Passes a strict system prompt demanding JSON matching the `local_models.parameters` schema.
* *Output:* Parsed JSON object.



## 🔒 Security & Rate Limiting

* **Context Isolation:** Electron `contextIsolation` MUST be `true`. `nodeIntegration` MUST be `false`. No `fs` module usage inside React components.
* **API Key Protection:** The Gemini API key is stored only in local `electron-store`. It is never transmitted anywhere except directly to Google's API endpoint.
* **UI Debouncing:** Changes to parameter sliders in the Left Sidebar MUST be debounced by `100ms` using `lodash.debounce` or `useDebounce` hook to prevent the Three.js canvas from dropping frames.
* **Local Fallback:** If the Gemini API returns a 429 (Rate Limit) or 500, the `generateModelParams` function MUST immediately fallback to a Regex parser function (`parsePromptWithRegex(prompt)`).

## 🤖 AI Integration (Gemini)

* **Service:** Google Gemini (`gemini-1.5-flash` model for maximum speed and free tier).
* **Integration Method:** Direct fetch or `@google/generative-ai` SDK in the renderer.
* **Crucial AI Prompt Instruction:** When constructing the API call, set `responseMimeType: "application/json"` in the `generationConfig`. The system prompt must be:
* *"You are a 3D modeling parser. Extract the user's intent into this exact JSON schema: { type: string, parameters: { text?: string, thickness?: number, width?: number, height?: number, holeSize?: number, holePosition?: string, edgeRadius?: number, scale?: number } }. Output ONLY valid JSON."*



## 🚀 Deployment Strategy

1. **Framework Init:** Bootstrap the app using `npm create @quick-start/electron@latest` (select React + TypeScript).
2. **Build Config:** Configure `electron-builder.yml` to target:
* `mac`: `target: dmg`, `arch: universal`.
* `win`: `target: nsis`.


3. **Mac Notarization Bypass:** Since we have no Apple Developer account, add documentation to the README instructing Mac users to run: `xattr -cr /Applications/Forge3D.app` to bypass the unsigned app warning.
4. **Distribution:** Generate artifacts locally using `npm run build:mac` and `npm run build:win`, then manually drag-and-drop the `.dmg` and `.exe` to a new GitHub Release.

## 📊 Performance Requirements

* **Load Time:** App must open and render the dark viewport in < 2 seconds.
* **Viewport FPS:** Must maintain strict 60 FPS while orbiting. Use `useFrame` cautiously in R3F.
* **Generation Speed:** Prompt -> Gemini API -> R3F Render must complete in < 4 seconds. Add a `<Loader />` overlay during generation.

## 💰 Cost Estimate

* **Google Gemini 1.5 Flash:** $0/month (Free tier allows 15 requests per minute, which is plenty for a local single-user desktop app).
* **Database/Storage:** $0/month (Local filesystem).
* **Hosting/Distribution:** $0/month (GitHub Releases).

## 📋 Development Checklist (14 Days / 3-4 hours per day)

* [ ] **Day 1:** Scaffold `electron-vite` project. Install `tailwindcss`, `shadcn-ui`. Setup basic dark theme UI shell (Sidebars, Bottom bar).
* [ ] **Day 2:** Setup R3F canvas. Add `OrbitControls`, `Grid`, and `Environment` lighting.
* [ ] **Day 3:** Build `electron-store` IPC bridge. Create settings modal for Gemini API Key.
* [ ] **Day 4:** Implement Gemini API call with JSON enforcement. Build the Regex fallback parser.
* [ ] **Day 5:** Build `keychain` generator in Three.js (ExtrudeGeometry for base, TextGeometry for text).
* [ ] **Day 6:** Integrate `three-bvh-csg` to subtract holes from the keychain based on parsed parameters.
* [ ] **Day 7:** Build parameter UI panel (sliders/inputs for thickness, width, text) linked to Zustand store.
* [ ] **Day 8:** Implement `box`, `cylinder`, and `sphere` geometries.
* [ ] **Day 9:** Setup file import (Drag-and-drop + `invoke_openFile`). Render imported STLs in viewport.
* [ ] **Day 10:** Implement scaling and text-addition over imported models via CSG.
* [ ] **Day 11:** Setup file export via `three-stdlib` `STLExporter`. Connect to `invoke_saveFile` IPC.
* [ ] **Day 12:** Implement Unit conversion (mm/cm/in) logic during the export step.
* [ ] **Day 13:** Bug squashing: Ensure slider debouncing works, fix any CSG mesh normal calculation errors.
* [ ] **Day 14:** Finalize `electron-builder` config, build `.dmg` and `.exe`, write README with Mac xattr instructions.

## 🎯 Technical Success Criteria

* **Feature Complete:** App can take a text prompt, parse it via Gemini, render a 3D mesh using `three-bvh-csg`, and export an STL.
* **Offline Tolerance:** Unplugging the internet and entering a prompt successfully generates a model using the regex fallback.
* **Slicer Ready:** Exported STL files open in PrusaSlicer/Bambu Studio with no "non-manifold edges" warnings.
* **Zero Cloud:** No backend servers are pinged (except the direct Gemini API call). All history is local.
* **Vibe Check:** The UI strictly uses `shadcn/ui` components with a cohesive dark `#0F172A` aesthetic.