<div align="center">

# ⬡ FORGE3D

### AI-Powered Parametric 3D Model Generator

_Describe any 3D object in plain English and watch it come to life — powered by local AI via [Ollama](https://ollama.com)_

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?style=flat-square&logo=threedotjs)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vite.dev)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-FF6B35?style=flat-square)](https://ollama.com)

</div>

---

## ✨ What is Forge3D?

**Forge3D** is a browser-based parametric 3D modeling tool that lets you describe objects in plain language and instantly generate printable 3D models. It uses a locally running **Ollama** LLM to interpret your prompts — no cloud API key, no data sent anywhere.

> **"Create a gold keychain that says ALEX, 5mm thick, 6mm hole top-left"**  
> → Forge3D generates a fully parameterised, export-ready 3D model in seconds.

When Ollama is unavailable, a built-in **regex-based local parser** handles common prompts as a fallback.

---

## 🖼️ Features

| Feature                    | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| 🤖 **AI Generation**       | Describe any 3D object in plain English; Ollama parses it into exact parameters |
| 📐 **Parametric Controls** | Fine-tune width, thickness, hole size, edge radius, scale, materials & colors   |
| 🖼️ **Live 3D Viewport**    | Real-time WebGL preview with solid, wireframe & material view modes             |
| 🎨 **Material Editor**     | Adjust roughness, metalness and base color with instant live feedback           |
| 📤 **Export**              | One-click export to **STL**, **OBJ**, **GLTF/GLB** for 3D printing or CAD       |
| 📜 **Prompt History**      | Browse and re-run your 20 most recent prompts                                   |
| 📥 **Import**              | Drag-and-drop import for STL, OBJ, GLTF, GLB files (up to 50 MB)                |
| 🔒 **100% Private**        | Runs entirely in your browser — all AI inference is local via Ollama            |

---

## 🧩 Model Types

Forge3D supports six parametric primitives, each fully customisable:

| Type       | Description                                         |
| ---------- | --------------------------------------------------- |
| `keychain` | Rounded plate with embossed text and a keyring hole |
| `box`      | Rectangular box / cube                              |
| `cylinder` | Cylinder or tube                                    |
| `sphere`   | UV sphere                                           |
| `ring`     | Torus / ring / pendant                              |
| `plate`    | Flat slab                                           |

---

## 🚀 Getting Started

### Prerequisites

| Tool    | Version | Install                          |
| ------- | ------- | -------------------------------- |
| Node.js | 18 +    | [nodejs.org](https://nodejs.org) |
| Ollama  | Latest  | [ollama.com](https://ollama.com) |

### 1 — Install & run Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model (llama3.2 recommended — fast & accurate)
ollama pull llama3.2

# Start the Ollama server (keep this running in the background)
ollama serve
```

### 2 — Run Forge3D

```bash
# Clone the repo
git clone https://github.com/Vortex4047/FORGE-3D.git
cd FORGE-3D/CAD-3d

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Configuration

All configuration lives in `CAD-3d/.env`:

```env
# Ollama model to use (must be pulled locally)
VITE_OLLAMA_MODEL="llama3.2"

# Ollama server URL (default — change if you run Ollama on a different host/port)
VITE_OLLAMA_BASE_URL="http://localhost:11434"
```

You can also change the model at any time from inside the app by clicking the **"Ollama: llama3.2"** badge in the top bar.

### Recommended Models

| Model      | Size   | Best For                            |
| ---------- | ------ | ----------------------------------- |
| `llama3.2` | 2 GB   | Best balance — recommended default  |
| `llama3.1` | 4.7 GB | Higher accuracy for complex prompts |
| `mistral`  | 4.1 GB | Fast & reliable                     |
| `gemma3`   | 3.3 GB | Good JSON output adherence          |
| `qwen2.5`  | 4.7 GB | Strong structured output            |
| `phi3`     | 2.3 GB | Very fast on lower-end hardware     |

---

## 💬 Prompt Guide

Forge3D understands natural-language prompts. Here are some examples:

```
Create a keychain that says FORGE, 5mm thick, 80mm wide, 6mm hole top-left
Make it gold and shiny
Create a box, 50mm wide, 15mm thick
Make a sphere, blue, matte
Create a ring, 40mm wide, steel
Make it 20% bigger
Make it 10mm thick
Add rounded edges
```

### Supported Parameters (via AI or regex fallback)

| Parameter     | Example phrase                                                      |
| ------------- | ------------------------------------------------------------------- |
| Object type   | `create a sphere`, `make a keychain`, `box`                         |
| Text label    | `says ALEX`, `text FORGE`, `name JOHN`                              |
| Thickness     | `5mm thick`, `1cm thick`, `0.5 inch thick`                          |
| Width         | `80mm wide`, `10cm size`                                            |
| Hole size     | `6mm hole`, `4mm hole`                                              |
| Hole position | `top-left`, `top-right`, `center`, `bottom-center`                  |
| Scale         | `20% bigger`, `50% smaller`                                         |
| Material      | `gold`, `steel`, `matte`, `shiny`, `glossy`, `red`, `blue`, `black` |
| Color         | `#FF6B35` (hex color code)                                          |

---

## 🏗️ Project Structure

```
CAD-3d/
├── src/
│   ├── App.tsx          # Main application — UI, state, AI dispatch logic
│   ├── App.css          # All styles (dark theme design system)
│   ├── parser.ts        # Local regex parser + Ollama API integration
│   ├── geometry.ts      # Parametric 3D geometry builders + STL/OBJ exporters
│   ├── types.ts         # Shared TypeScript types (ModelConfig, MaterialConfig…)
│   └── main.tsx         # React entry point
├── .env                 # Ollama configuration (model name, base URL)
├── vite.config.ts       # Vite config
└── index.html           # HTML shell
```

---

## 🛠️ Tech Stack

| Layer        | Technology                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| UI Framework | [React 19](https://react.dev) + [TypeScript 5.9](https://www.typescriptlang.org)                                           |
| 3D Rendering | [Three.js r183](https://threejs.org) via [React Three Fiber](https://r3f.docs.pmnd.rs) + [Drei](https://drei.docs.pmnd.rs) |
| Icons        | [Lucide React](https://lucide.dev)                                                                                         |
| Build Tool   | [Vite 8](https://vite.dev)                                                                                                 |
| AI Backend   | [Ollama](https://ollama.com) (local, any chat-capable model)                                                               |
| State        | React `useState` / `useCallback` / `useMemo`                                                                               |
| Persistence  | `localStorage` (prompt history, model preference)                                                                          |

---

## 📦 Available Scripts

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## 🔧 Troubleshooting

| Problem                       | Solution                                                              |
| ----------------------------- | --------------------------------------------------------------------- |
| _"Cannot reach Ollama"_ toast | Run `ollama serve` in a terminal and keep it open                     |
| _"Model not found"_ toast     | Run `ollama pull llama3.2` (or whatever model you selected)           |
| Blank 3D viewport             | Check browser console; ensure WebGL is enabled                        |
| Prompt returns no changes     | Try more specific phrasing, e.g. `"create a sphere, 40mm wide, blue"` |
| Export looks wrong scale      | Use the export **Scale ×** slider to correct for your slicer          |

---

## 🗺️ Roadmap

- Multi-object scenes
- Boolean operations (union, subtract, intersect)
- Full GLTF / GLB export with textures
- Conversation-style prompt history (context-aware edits)
- Undo / redo stack
- Custom material library
- Production build deployment guide

---

## 📄 License

MIT — free to use, modify, and distribute.
