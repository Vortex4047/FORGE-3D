FORGE3D — UI/UX Design Specification

NOTE: This design spec is for a native Electron Desktop Application, not a website. The UI must feel like a standalone desktop program (no scrollbouncing, no accidental text selection, native window dragging).

Please refer to ./PRD.md and ./TRD.md in the current working directory for full product requirements and system architecture.

Theme: Professional, Dark-mode only, Minimalist CAD (similar to Plasticity or Shapr3D)
Frameworks: Tailwind CSS, shadcn/ui, lucide-react

🎨 1. Global Design Tokens (Tailwind)

To ensure perfect generation, the AI should map the PRD hex codes to these standard Tailwind utility classes:

App Background (The 3D Canvas): bg-slate-900 (#0F172A)

Panels (Sidebars, Bottom Bar): bg-slate-800 (#1E293B)

Surfaces (Cards, Inputs, Modals): bg-slate-700 (#334155)

Borders & Dividers: border-slate-700

Text (Primary): text-slate-100 (Headings, active values)

Text (Secondary): text-slate-400 (Labels, helper text, units)

Accent (Brand/Action): bg-indigo-500 hover: bg-indigo-600 (#6366F1)

Font Families: * UI: font-sans (Inter/System)

Inputs/Values: font-mono (JetBrains Mono/System Mono)

📐 2. Core Layout Grid

The app is a single-screen, non-scrollable desktop dashboard.

Desktop-Specific Utilities Required: * select-none: Prevents website-like text highlighting.

overflow-hidden: Prevents native OS scrollbouncing.

[-webkit-app-region:drag]: Used on headers so the user can drag the frameless Electron window.

Main Wrapper:

<div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-900 text-slate-100 select-none">
  <div className="flex flex-1 overflow-hidden">
    <LeftSidebar />    <!-- w-72 (280px) flex-shrink-0 -->
    <CenterViewport /> <!-- flex-1 relative -->
    <RightSidebar />   <!-- w-64 (260px) flex-shrink-0 -->
  </div>
  <BottomBar />        <!-- h-10 (40px) flex-shrink-0 -->
</div>


🧩 3. Component Specifications & shadcn/ui Mapping

3.1 Left Sidebar (The Generator)

Container: w-72 bg-slate-800 border-r border-slate-700 flex flex-col

Header (Top) — Window Drag Region:

Layout: flex items-center gap-2 p-4 border-b border-slate-700 [-webkit-app-region:drag] (Allows moving the window from this bar)

Icon: <Box className="text-indigo-500 w-6 h-6 [-webkit-app-region:no-drag]" />

Title: font-semibold tracking-wide ("Forge3D")

Prompt Section:

Wrapper: p-4 flex flex-col gap-3 [-webkit-app-region:no-drag]

Input: shadcn/Textarea (min-h-[80px] bg-slate-900 border-slate-700 resize-none placeholder:text-slate-500 focus-visible:ring-indigo-500 select-text) (Must allow text selection here)

Submit: shadcn/Button (w-full bg-indigo-500 hover:bg-indigo-600). Contains <Wand2 className="w-4 h-4 mr-2" /> and text "Generate".

Shortcut Hint: text-xs text-slate-500 text-center ("Press ⌘+Enter")

Parameters Panel (Scrollable):

Wrapper: shadcn/ScrollArea (flex-1 p-4)

Label: "Parameters" (text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4)

Items (Auto-generated based on JSON):

Row: flex flex-col gap-2 mb-4

Header: flex justify-between items-center -> Label (text-sm) + Value Display (font-mono text-xs text-indigo-400 bg-slate-900 px-1 rounded)

Control: shadcn/Slider (for numeric) or shadcn/Input (for exact dimensions/text, needs select-text).

3.2 Center Viewport (The Canvas)

Container: flex-1 relative bg-slate-900

3D Canvas: R3F <Canvas> fills the entire space.

Overlay - Loading State (Conditional):

Centered absolute div: absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10

Content: <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /> + "Forging model..."

Overlay - View Controls (Top Right of Canvas):

Floating toolbar: absolute top-4 right-4 flex gap-1 bg-slate-800/80 backdrop-blur rounded-md p-1 border border-slate-700

Buttons: Ghost buttons for <Maximize />, <Camera /> reset.

3.3 Right Sidebar (The Inspector)

Container: w-64 bg-slate-800 border-l border-slate-700 flex flex-col

Section 1: Scene Graph / Hierarchy

Header: "Scene" (p-4 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase [-webkit-app-region:drag])

List: Items showing <Box className="w-3 h-3 text-slate-500" /> + "Generated Mesh" or "Imported.stl".

Section 2: Transform (Scale/Size)

Grid of inputs for X, Y, Z exact dimensions.

Inputs: shadcn/Input (h-7 text-xs font-mono bg-slate-900 border-slate-700 select-text).

Section 3: Viewport Settings

Rows with flex justify-between items-center py-2.

Wireframe: shadcn/Switch

Bounding Box: shadcn/Switch

Grid Helper: shadcn/Switch

3.4 Bottom Bar (System & Export)

Container: h-10 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4

Left (Status):

Content: <CircleDot className="w-3 h-3 text-emerald-500" /> + "System Ready" (text-xs text-slate-400).

FPS Counter: text-xs font-mono text-slate-500 ml-4 (e.g., "60 FPS").

Right (Actions):

Wrapper: flex items-center gap-3 [-webkit-app-region:no-drag]

Units: shadcn/Select (w-20 h-7 text-xs). Options: mm, cm, in.

Import: shadcn/Button (variant="outline" size="sm" h-7 text-xs border-slate-600 bg-transparent hover:bg-slate-700). Icon: <Upload className="w-3 h-3 mr-1"/>

Export: shadcn/Button (size="sm" h-7 text-xs bg-indigo-500 hover:bg-indigo-600). Icon: <Download className="w-3 h-3 mr-1"/>

⚙️ 4. Modals & Notifications (shadcn/ui)

4.1 API Key Setup Modal (shadcn/Dialog)

Trigger: On app load if geminiApiKey is missing in electron-store.

Title: "Welcome to Forge3D"

Description: "To use natural language generation, please enter your free Google Gemini API key. You can also skip this and use offline regex parsing."

Input: shadcn/Input (type="password" placeholder="AIzaSy..." select-text)

Actions: <Button variant="ghost">Skip</Button> and <Button>Save Key</Button>

4.2 Export Modal (shadcn/Dialog)

Trigger: Clicking Export in Bottom Bar.

Title: "Export Model"

Controls:

Format: shadcn/Select (STL, OBJ, GLTF).

Scale Multiplier: shadcn/Input (type="number", default "1.0", select-text).

Actions: <Button className="w-full">Save to Disk</Button>

4.3 Notifications (shadcn/Sonner)

Use the sonner package integrated via shadcn.

Theme: dark

Success: "Model generated successfully." (Green check icon)

Error: "API Key invalid or rate limited. Falling back to offline mode." (Red alert icon)

Info: "File saved to ~/Documents/Forge3D Exports/" (Folder icon)