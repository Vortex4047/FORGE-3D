import type { ModelConfig, MaterialConfig, ParseResult } from './types'

// ─── Helpers ────────────────────────────────────────────────────────────────────

function parseNum(v: string | undefined): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toMm(value: number, unit: string | undefined): number {
  if (!unit || unit === 'mm') return value
  if (unit === 'cm') return value * 10
  if (unit === 'in' || unit === 'inch' || unit === 'inches') return value * 25.4
  return value
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

// ─── Local Regex Parser ──────────────────────────────────────────────────────────

export function parsePromptLocal(prompt: string, current: ModelConfig): ParseResult {
  const norm = prompt.toLowerCase()
  const model: Partial<ModelConfig> = {}
  const material: Partial<MaterialConfig> = {}

  // Type detection
  if (norm.includes('keychain'))                                         model.type = 'keychain'
  else if (norm.includes('box') || norm.includes('cube'))                model.type = 'box'
  else if (norm.includes('cylinder') || norm.includes('tube'))           model.type = 'cylinder'
  else if (norm.includes('sphere') || norm.includes('ball'))             model.type = 'sphere'
  else if (norm.includes('ring') || norm.includes('torus') || norm.includes('pendant')) model.type = 'ring'
  else if (norm.includes('plate') || norm.includes('slab'))              model.type = 'plate'

  // Text
  const textM = prompt.match(/(?:says?|text|name|initials?|print|write|label)\s+["']?([A-Za-z0-9_\- ]{1,20})["']?/i)
  if (textM?.[1]) model.text = textM[1].trim().toUpperCase().slice(0, 12)

  // Thickness
  const thickM = prompt.match(/([\d.]+)\s*(mm|cm|in|inch|inches)?\s*thick/i)
  if (thickM) {
    const n = parseNum(thickM[1])
    if (n !== null) model.thickness = clamp(toMm(n, thickM[2]?.toLowerCase()), 2, 50)
  }

  // Width
  const widthM = prompt.match(/([\d.]+)\s*(mm|cm|in|inch|inches)\s*(?:wide|width|size|large|big)/i)
  if (widthM) {
    const n = parseNum(widthM[1])
    if (n !== null) {
      const mm = clamp(toMm(n, widthM[2]?.toLowerCase()), 15, 250)
      model.width = mm; model.height = mm
    }
  }

  // Hole
  const holeM = prompt.match(/([\d.]+)\s*(mm|cm|in|inch|inches)?\s*hole/i)
  if (holeM) {
    const n = parseNum(holeM[1])
    if (n !== null) model.holeSize = clamp(toMm(n, holeM[2]?.toLowerCase()), 1, 40)
  }

  // Hole position
  if (norm.includes('top-left') || norm.includes('top left'))               model.holePosition = 'top-left'
  if (norm.includes('top-right') || norm.includes('top right'))             model.holePosition = 'top-right'
  if (norm.includes('bottom-center') || norm.includes('bottom center'))     model.holePosition = 'bottom-center'
  if (norm.includes('center hole') || norm.includes('middle hole'))         model.holePosition = 'center'

  // Edge
  if (norm.includes('round') || norm.includes('bevel') || norm.includes('smooth'))
    model.edgeRadius = clamp(current.edgeRadius + 2, 1, 12)

  // Scale
  const biggerM = prompt.match(/([\d.]+)\s*%\s*bigger/i)
  if (biggerM?.[1]) { const n = parseNum(biggerM[1]); if (n !== null) model.scale = clamp(current.scale * (1 + n / 100), 0.1, 8) }
  const smallerM = prompt.match(/([\d.]+)\s*%\s*smaller/i)
  if (smallerM?.[1]) { const n = parseNum(smallerM[1]); if (n !== null) model.scale = clamp(current.scale * (1 - n / 100), 0.1, 8) }

  // Material presets
  if (norm.includes('steel') || norm.includes('brushed')) {
    material.baseColor = '#C3C7CC'; material.roughness = 0.42; material.metallic = 0.95
  } else if (norm.includes('gold')) {
    material.baseColor = '#D4A847'; material.roughness = 0.3; material.metallic = 1.0
  } else if (norm.includes('matte') || norm.includes('plastic')) {
    material.roughness = 0.85; material.metallic = 0.05
  } else if (norm.includes('shiny') || norm.includes('glossy')) {
    material.roughness = 0.05; material.metallic = 0.85
  } else if (norm.includes('red')) {
    material.baseColor = '#EF4444'
  } else if (norm.includes('blue')) {
    material.baseColor = '#3B82F6'
  } else if (norm.includes('green')) {
    material.baseColor = '#10B981'
  } else if (norm.includes('black')) {
    material.baseColor = '#1E293B'; material.roughness = 0.6
  } else if (norm.includes('white')) {
    material.baseColor = '#F1F5F9'; material.roughness = 0.7
  }

  const colorM = prompt.match(/#([A-Fa-f0-9]{6})/)
  if (colorM?.[1]) material.baseColor = `#${colorM[1].toUpperCase()}`

  return { model, material }
}

// ─── Ollama Local API ──────────────────────────────────────────────────────────
// Ollama runs locally at http://localhost:11434 — no API key or proxy needed.
// Default model: llama3.2 (any model installed via `ollama pull <model>` works)

export const OLLAMA_BASE_URL = 'http://localhost:11434'
export const DEFAULT_OLLAMA_MODEL = 'llama3.2'

// Maps unsupported shape names → nearest supported type
const TYPE_ALIASES: Record<string, string> = {
  cone: 'cylinder',
  pyramid: 'box',
  cube: 'box',
  torus: 'ring',
  pendant: 'ring',
  disc: 'plate',
  disk: 'plate',
  slab: 'plate',
  tube: 'cylinder',
  ball: 'sphere',
}
const VALID_TYPES = new Set(['keychain', 'box', 'cylinder', 'sphere', 'ring', 'plate'])

const SYSTEM_PROMPT = `You are a JSON parameter extractor for a 3D modeling app called Forge3D.

RULES:
1. Reply with ONLY a valid JSON object. No explanation, no markdown fences, no extra text.
2. Only include keys that are directly mentioned or implied by the user prompt.
3. NEVER copy text from these instructions into any field value.
4. For "text", output only what the user wants engraved/printed, in UPPERCASE. If nothing is mentioned, omit the field entirely.
5. Valid types: keychain, box, cylinder, sphere, ring, plate. Map cone→cylinder, cube→box, torus→ring, disc→plate, ball→sphere.

JSON schema (all fields optional — only include what applies):
{
  "model": {
    "type": "keychain" | "box" | "cylinder" | "sphere" | "ring" | "plate",
    "text": "SHORT_UPPERCASE_LABEL",
    "width": <number in mm>,
    "height": <number in mm>,
    "thickness": <number in mm>,
    "holeSize": <number in mm>,
    "holePosition": "center" | "top-left" | "top-right" | "bottom-center",
    "edgeRadius": <0 to 12>,
    "scale": <0.1 to 8>
  },
  "material": {
    "baseColor": "<#RRGGBB hex>",
    "roughness": <0.0 to 1.0>,
    "metallic": <0.0 to 1.0>
  }
}

Examples:
- "create a red sphere 40mm wide" → {"model":{"type":"sphere","width":40},"material":{"baseColor":"#EF4444"}}
- "make a gold keychain that says ALEX, 5mm thick" → {"model":{"type":"keychain","text":"ALEX","thickness":5},"material":{"baseColor":"#D4A847","metallic":1.0,"roughness":0.3}}
- "create a cone with a 20mm bottom radius" → {"model":{"type":"cylinder","width":40}}
- "make it shiny blue" → {"material":{"baseColor":"#3B82F6","roughness":0.05,"metallic":0.85}}`

/** Extract the first valid JSON object from arbitrary text (handles extra prose/fences). */
function extractJson(text: string): string {
  // 1. Strip markdown fences
  const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()

  // 2. Try to find the outermost { ... } block
  const start = stripped.indexOf('{')
  if (start === -1) throw new Error('No JSON object found in Ollama response')

  let depth = 0
  let end = -1
  for (let i = start; i < stripped.length; i++) {
    if (stripped[i] === '{') depth++
    else if (stripped[i] === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }
  if (end === -1) throw new Error('Malformed JSON in Ollama response')
  return stripped.slice(start, end + 1)
}

/** Sanitise a ParseResult: remove junk values that look like prompt/schema text. */
function sanitiseResult(result: ParseResult): ParseResult {
  if (result.model) {
    const m = result.model
    // If text looks like it was copied from the schema description, discard it
    if (
      m.text &&
      (/max \d+ chars|uppercase|lowercase|placeholder|label|example/i.test(m.text) ||
        m.text.length > 12)
    ) {
      delete m.text
    }
    // Remap unsupported types
    if (m.type) {
      const alias = TYPE_ALIASES[m.type.toLowerCase()]
      if (alias) m.type = alias as ModelConfig['type']
      if (!VALID_TYPES.has(m.type)) delete m.type
    }
  }
  return result
}

export async function parsePromptWithOllama(
  prompt: string,
  model: ModelConfig,
  ollamaModel: string = DEFAULT_OLLAMA_MODEL,
  baseUrl: string = OLLAMA_BASE_URL,
): Promise<ParseResult> {
  const userPrompt = `Current model: type=${model.type}, text="${model.text}", width=${model.width}mm, thickness=${model.thickness}mm, scale=${model.scale}

User request: "${prompt}"

Reply with ONLY a JSON object.`

  let res: Response
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        stream: false,
        format: 'json',           // Force structured JSON output
        options: {
          temperature: 0.0,       // Zero temperature = deterministic, no hallucination
          num_predict: 300,
          repeat_penalty: 1.1,
        },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    })
  } catch {
    throw new Error(
      'Cannot reach Ollama at ' + baseUrl +
      '. Make sure Ollama is running (`ollama serve`) and the model is pulled (`ollama pull ' + ollamaModel + '`).'
    )
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText)
    if (res.status === 404 && /model.*not found/i.test(errText)) {
      throw new Error(`Ollama model "${ollamaModel}" not found. Run: ollama pull ${ollamaModel}`)
    }
    throw new Error(`Ollama HTTP ${res.status}: ${errText.slice(0, 200)}`)
  }

  const data = await res.json() as {
    message?: { content?: string }
    error?: string
  }

  if (data.error) throw new Error(`Ollama error: ${data.error}`)

  const rawText = data?.message?.content ?? ''
  if (!rawText.trim()) throw new Error('Ollama returned empty response')

  const jsonText = extractJson(rawText)
  const parsed = JSON.parse(jsonText) as ParseResult
  const sanitised = sanitiseResult(parsed)

  // Safety clamps on numeric values
  if (sanitised.model) {
    const m = sanitised.model
    if (m.thickness  !== undefined) m.thickness  = clamp(m.thickness,  2,   50)
    if (m.width      !== undefined) m.width      = clamp(m.width,      15,  250)
    if (m.height     !== undefined) m.height     = clamp(m.height,     15,  250)
    if (m.holeSize   !== undefined) m.holeSize   = clamp(m.holeSize,   0,   40)
    if (m.edgeRadius !== undefined) m.edgeRadius = clamp(m.edgeRadius, 0,   12)
    if (m.scale      !== undefined) m.scale      = clamp(m.scale,      0.1, 8)
  }

  return sanitised
}

