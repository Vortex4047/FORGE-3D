import * as THREE from 'three'
import type { ModelConfig } from './types'

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape()
  const w = width / 2
  const h = height / 2
  const r = Math.min(radius, w * 0.4, h * 0.4)
  shape.moveTo(-w + r, -h)
  shape.lineTo(w - r, -h)
  shape.quadraticCurveTo(w, -h, w, -h + r)
  shape.lineTo(w, h - r)
  shape.quadraticCurveTo(w, h, w - r, h)
  shape.lineTo(-w + r, h)
  shape.quadraticCurveTo(-w, h, -w, h - r)
  shape.lineTo(-w, -h + r)
  shape.quadraticCurveTo(-w, -h, -w + r, -h)
  return shape
}

function addHole(shape: THREE.Shape, model: ModelConfig, width: number, height: number): void {
  const holeRadius = Math.max(0.02, model.holeSize / 50)
  const hole = new THREE.Path()
  let x = 0, y = 0
  if (model.holePosition === 'top-left') {
    x = -width / 2 + holeRadius * 2.5
    y = height / 2 - holeRadius * 2.5
  } else if (model.holePosition === 'top-right') {
    x = width / 2 - holeRadius * 2.5
    y = height / 2 - holeRadius * 2.5
  } else if (model.holePosition === 'bottom-center') {
    x = 0
    y = -height / 2 + holeRadius * 2.5
  }
  hole.absellipse(x, y, holeRadius, holeRadius, 0, Math.PI * 2, false, 0)
  shape.holes.push(hole)
}

export function createModelGeometry(model: ModelConfig): THREE.BufferGeometry {
  const scale = model.scale / 25
  const W = (model.width * scale) / 2
  const H = (model.height * scale) / 2
  const T = (model.thickness * scale) / 2

  if (model.type === 'box') {
    return new THREE.BoxGeometry(W, H, T, 2, 2, 2)
  }
  if (model.type === 'cylinder') {
    return new THREE.CylinderGeometry(W / 2, W / 2, T * 1.5, 64, 1)
  }
  if (model.type === 'sphere') {
    return new THREE.SphereGeometry(W / 2, 64, 48)
  }
  if (model.type === 'ring') {
    return new THREE.TorusGeometry(W / 2, Math.max(0.04, T / 4), 32, 100)
  }
  if (model.type === 'plate') {
    const geo = new THREE.BoxGeometry(W * 2, T * 0.5, H, 2, 1, 2)
    return geo
  }
  // keychain (default)
  const shape = createRoundedRectShape(W, H, Math.max(0.02, model.edgeRadius / 30))
  if (model.holeSize > 0) addHole(shape, model, W, H)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.04, T),
    bevelEnabled: model.edgeRadius > 0,
    bevelSize: Math.max(0.005, model.edgeRadius / 120),
    bevelSegments: 4,
    steps: 2,
  })
  geo.center()
  geo.computeVertexNormals()
  return geo
}

export function computeDimensions(model: ModelConfig): { x: number; y: number; z: number } {
  const scale = model.scale / 25
  return {
    x: parseFloat((model.width * scale * 25).toFixed(1)),
    y: parseFloat((model.height * scale * 25).toFixed(1)),
    z: parseFloat((model.thickness * scale * 25).toFixed(1)),
  }
}

export function exportSTL(geometry: THREE.BufferGeometry): Blob {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const triangleCount = index ? index.count / 3 : position.count / 3
  const buffer = new ArrayBuffer(84 + triangleCount * 50)
  const view = new DataView(buffer)
  let offset = 80
  view.setUint32(offset, triangleCount, true)
  offset += 4
  const vA = new THREE.Vector3()
  const vB = new THREE.Vector3()
  const vC = new THREE.Vector3()
  const normal = new THREE.Vector3()
  for (let i = 0; i < triangleCount; i++) {
    const a = index ? index.getX(i * 3) : i * 3
    const b = index ? index.getX(i * 3 + 1) : i * 3 + 1
    const c = index ? index.getX(i * 3 + 2) : i * 3 + 2
    vA.fromBufferAttribute(position, a)
    vB.fromBufferAttribute(position, b)
    vC.fromBufferAttribute(position, c)
    normal.crossVectors(vB.clone().sub(vA), vC.clone().sub(vA)).normalize()
    view.setFloat32(offset, normal.x, true); offset += 4
    view.setFloat32(offset, normal.y, true); offset += 4
    view.setFloat32(offset, normal.z, true); offset += 4
    for (const v of [vA, vB, vC]) {
      view.setFloat32(offset, v.x, true); offset += 4
      view.setFloat32(offset, v.y, true); offset += 4
      view.setFloat32(offset, v.z, true); offset += 4
    }
    view.setUint16(offset, 0, true); offset += 2
  }
  return new Blob([buffer], { type: 'application/octet-stream' })
}

export function exportOBJ(geometry: THREE.BufferGeometry): Blob {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  let out = '# Forge3D OBJ Export\n'
  for (let i = 0; i < position.count; i++) {
    out += `v ${position.getX(i).toFixed(6)} ${position.getY(i).toFixed(6)} ${position.getZ(i).toFixed(6)}\n`
  }
  const triCount = index ? index.count / 3 : position.count / 3
  for (let i = 0; i < triCount; i++) {
    const a = (index ? index.getX(i * 3) : i * 3) + 1
    const b = (index ? index.getX(i * 3 + 1) : i * 3 + 1) + 1
    const c = (index ? index.getX(i * 3 + 2) : i * 3 + 2) + 1
    out += `f ${a} ${b} ${c}\n`
  }
  return new Blob([out], { type: 'text/plain' })
}
