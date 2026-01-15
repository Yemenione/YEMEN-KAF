"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, PerspectiveCamera, ContactShadows, Sparkles } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function HoneyJar() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Rotating animation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    return (
        <group>
            {/* Jar Content (Honey) */}
            <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.9, 0.9, 2.5, 32]} />
                <meshPhysicalMaterial
                    color="#FFB300"
                    roughness={0.1}
                    transmission={0.6} // Glass-like but thick
                    thickness={1}
                    ior={1.4}
                    clearcoat={1}
                />
            </mesh>

            {/* Jar Glass Container */}
            <mesh ref={meshRef}>
                <cylinderGeometry args={[1, 1, 3, 32]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0}
                    metalness={0.1}
                    transmission={0.95}
                    thickness={2}
                    ior={1.5}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Gold Lid */}
            <mesh position={[0, 1.6, 0]}>
                <cylinderGeometry args={[1.05, 1.05, 0.2, 32]} />
                <meshStandardMaterial
                    color="#D4AF37"
                    metalness={1}
                    roughness={0.3}
                />
            </mesh>
        </group>
    );
}

function FloatingBean({ position, speed }: { position: [number, number, number], speed: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const randomRot = useMemo(() => [Math.random(), Math.random(), Math.random()], []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x += 0.01 * speed;
            ref.current.rotation.y += 0.02 * speed;
            // Slight vertical float
            ref.current.position.y += Math.sin(state.clock.elapsedTime * speed) * 0.002;
        }
    });

    return (
        <mesh ref={ref} position={position} rotation={[randomRot[0], randomRot[1], randomRot[2]]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#3E2723" roughness={0.8} />
        </mesh>
    );
}

function CoffeeRain() {
    const count = 30;
    const positions = useMemo(() => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            pos.push([
                (Math.random() - 0.5) * 10, // x
                (Math.random() - 0.5) * 10, // y
                (Math.random() - 0.5) * 5   // z
            ] as [number, number, number]);
        }
        return pos;
    }, []);

    return (
        <group>
            {positions.map((pos, i) => (
                <FloatingBean key={i} position={pos} speed={0.5 + Math.random()} />
            ))}
        </group>
    );
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--coffee-brown)] to-[#2D1B18]">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                {/* Cinematic Lighting */}
                <ambientLight intensity={0.5} color="#3E2723" />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={500} color="#FFB300" castShadow />
                <pointLight position={[-10, -10, -10]} intensity={200} color="#D4AF37" />

                {/* Environment for Reflections */}
                <Environment preset="city" />

                {/* Main Floating Elements */}
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <HoneyJar />
                </Float>

                {/* Atmospheric Particles */}
                <CoffeeRain />
                <Sparkles count={50} scale={10} size={4} speed={0.4} opacity={0.5} color="#FFB300" />

                {/* Soft Shadows */}
                <ContactShadows resolution={1024} scale={10} blur={2.5} opacity={0.5} far={10} color="#000000" />
            </Canvas>
        </div>
    );
}
