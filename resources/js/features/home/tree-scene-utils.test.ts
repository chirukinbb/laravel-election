import {
    BoxGeometry,
    Group,
    InstancedMesh,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    Texture,
    Vector3,
} from "three";
import {describe, expect, it, vi} from "vitest";

import {disposeTreeObject, getTreeCameraFit,} from "@/features/home/tree-scene-utils";

describe("technical tree scene camera", () => {
  it.each([390 / 844, 844 / 390, 16 / 9])(
    "keeps every model corner inside the viewport at aspect %s",
    (aspect) => {
      const dimensions = { width: 18, height: 24, depth: 9 };
      const fit = getTreeCameraFit(dimensions, aspect);
      const camera = new PerspectiveCamera(38, aspect, fit.near, fit.far);
      camera.position.set(0, 0, fit.distance);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld(true);

      for (const x of [-dimensions.width / 2, dimensions.width / 2]) {
        for (const y of [-dimensions.height / 2, dimensions.height / 2]) {
          for (const z of [-dimensions.depth / 2, dimensions.depth / 2]) {
            const corner = new Vector3(x, y, z).project(camera);
            expect(Math.abs(corner.x)).toBeLessThan(1);
            expect(Math.abs(corner.y)).toBeLessThan(1);
            expect(corner.z).toBeGreaterThan(-1);
            expect(corner.z).toBeLessThan(1);
          }
        }
      }
    },
  );

  it("rejects empty or invalid bounds instead of producing a blank frame", () => {
    expect(() =>
      getTreeCameraFit({ width: 0, height: 0, depth: 0 }, 1),
    ).toThrow();
    expect(() =>
      getTreeCameraFit({ width: 12, height: 20, depth: Number.NaN }, 1),
    ).toThrow();
    expect(() =>
      getTreeCameraFit({ width: 12, height: 20, depth: 8 }, 0),
    ).toThrow();
  });
});

describe("technical tree scene cleanup", () => {
  it("releases shared GPU resources once, including instancing buffers", () => {
    const texture = new Texture();
    const material = new MeshStandardMaterial({
      map: texture,
      normalMap: texture,
    });
    const geometry = new BoxGeometry();
    const instances = new InstancedMesh(geometry, material, 1000);
    const group = new Group();
    group.add(instances, new Mesh(geometry, [material, material]));
    const textureDispose = vi.spyOn(texture, "dispose");
    const materialDispose = vi.spyOn(material, "dispose");
    const geometryDispose = vi.spyOn(geometry, "dispose");
    const instanceDispose = vi.spyOn(instances, "dispose");

    disposeTreeObject(group);

    expect(textureDispose).toHaveBeenCalledOnce();
    expect(materialDispose).toHaveBeenCalledOnce();
    expect(geometryDispose).toHaveBeenCalledOnce();
    expect(instanceDispose).toHaveBeenCalledOnce();
  });
});
