"use client";

import { useMemo } from 'react';

import {
  ExtrudeGeometry,
  Shape,
} from 'three';

import type {
  NavigationInstructionType,
} from '@/services/navigation/instructions';

interface ARArrowProps {
  instructionType: NavigationInstructionType | null;
}

// یک کورون تکی به شکل ">"
function createChevronShape() {
  const shape = new Shape();

  shape.moveTo(-0.35, 0.5);
  shape.lineTo(0.15, 0);
  shape.lineTo(-0.35, -0.5);
  shape.lineTo(-0.12, -0.5);
  shape.lineTo(0.38, 0);
  shape.lineTo(-0.12, 0.5);
  shape.closePath();

  return shape;
}

export const ARArrow = ({ instructionType }: ARArrowProps) => {
  const geometry = useMemo(() => {
    const shape = createChevronShape();

    return new ExtrudeGeometry(shape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 6,
    });
  }, []);

  // چرخش کم دور Y - فقط برای اینکه جهت معلوم بشه، نه کامل به پهلو بایسته
  const yRotation = useMemo(() => {
    const TURN_ANGLE = Math.PI / 5; // حدود ۳۶ درجه - قابل تنظیم

    switch (instructionType) {
      case "left":
        return TURN_ANGLE;

      case "right":
        return -TURN_ANGLE;

      case "straight":
      default:
        return 0;
    }
  }, [instructionType]);

  return (
    // ایستاده و رو به دوربین، کمی جلو مایل + کمی چپ/راست برای نشون دادن جهت
    <group rotation={[-Math.PI / 9, yRotation, 0]}>
      {/* کورون عقب */}
      <mesh geometry={geometry} position={[-0.32, 0, 0]}>
        <meshPhysicalMaterial
          color="#dbe9f5"
          transmission={0.9}
          thickness={0.6}
          roughness={0.12}
          ior={1.45}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationColor="#5f8fb8"
          attenuationDistance={0.5}
        />
      </mesh>

      {/* کورون جلو */}
      <mesh geometry={geometry} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#dbe9f5"
          transmission={0.9}
          thickness={0.6}
          roughness={0.12}
          ior={1.45}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationColor="#5f8fb8"
          attenuationDistance={0.5}
        />
      </mesh>
    </group>
  );
};
