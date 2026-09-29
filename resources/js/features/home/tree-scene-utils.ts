import type {BufferGeometry, InstancedMesh, Material, Mesh, Object3D, Texture,} from "three";

export interface TreeDimensions {
  width: number;
  height: number;
  depth: number;
}

/** Fit both dimensions, including depth, without cropping a portrait viewport. */
export function getTreeCameraFit(
  dimensions: TreeDimensions,
  aspect: number,
  verticalFovDegrees = 38,
) {
  const { width, height, depth } = dimensions;
  if (
    ![width, height, depth, aspect, verticalFovDegrees].every(
      Number.isFinite,
    ) ||
    Math.min(width, height, aspect, verticalFovDegrees) <= 0 ||
    depth < 0 ||
    verticalFovDegrees >= 180
  ) {
    throw new Error("The 3D model has invalid dimensions.");
  }

  const halfVerticalFov = (verticalFovDegrees * Math.PI) / 360;
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * aspect);
  const radius = Math.hypot(width, height, depth) / 2;
  const distance =
    Math.max(
      height / (2 * Math.tan(halfVerticalFov)),
      width / (2 * Math.tan(halfHorizontalFov)),
    ) *
      1.14 +
    depth / 2;

  return {
    distance,
    near: Math.max(radius / 100, 0.001),
    far: distance + radius * 8,
  };
}

/** GLTF materials and instanced meshes share resources; release each once. */
export function disposeTreeObject(root: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const bitmaps = new Set<ImageBitmap>();

  root.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;

    geometries.add(mesh.geometry);
    const meshMaterials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const material of meshMaterials) materials.add(material);
    const instancedMesh = object as InstancedMesh;
    if (instancedMesh.isInstancedMesh) instancedMesh.dispose();
  });

  for (const material of materials) {
    for (const value of Object.values(material)) {
      const texture = value as Texture | null;
      if (texture?.isTexture) textures.add(texture);
    }
  }

  for (const texture of textures) {
    const image: unknown = texture.source.data;
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
      bitmaps.add(image);
    }
    texture.dispose();
  }
  for (const bitmap of bitmaps) bitmap.close();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}
