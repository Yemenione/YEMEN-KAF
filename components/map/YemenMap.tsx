"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import clsx from "clsx";

// Utility to map Lat/Lon to Sphere 3D Coords
function latLongToVector3(lat: number, lon: number, radius: number): [number, number, number] {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return [x, y, z];
}

const REGIONS = [
    { name: "Haraz", lat: 15.0, lon: 43.7, description: "Mountain peaks (2500m+). Home of the finest Mocha Coffee." },
    { name: "Dhamar", lat: 14.5, lon: 44.4, description: "Ancient volcanic soil. The heart of Yemeni agriculture." },
    { name: "Hadramout", lat: 16.0, lon: 49.0, description: "Desert valleys. The only source of Royal Sidr Honey." },
];

function RegionMarker({
    position,
    data,
    isSelected,
    onSelect
}: {
    position: [number, number, number],
    data: typeof REGIONS[0],
    isSelected: boolean,
    onSelect: (name: string) => void
}) {
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            // Pulse effect for selected
            const scale = isSelected ? 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2 : 1;
            ref.current.scale.set(scale, scale, scale);
            ref.current.lookAt(0, 0, 0); // Markers face outward
        }
    });

    return (
        <group position={position} ref={ref}>
            <mesh onClick={() => onSelect(data.name)} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial
                    color={isSelected ? "#FFB300" : "#D4AF37"}
                    emissive={isSelected ? "#FFB300" : "#000000"}
                    emissiveIntensity={2}
                />
            </mesh>
            {/* Glow Ring */}
            <mesh>
                <ringGeometry args={[0.06, 0.07, 32]} />
                <meshBasicMaterial color="#FFB300" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>

            {/* Tooltip HTML Overlay */}
            {isSelected && (
                <Html distanceFactor={10} zIndexRange={[100, 0]}>
                    <div className="bg-[var(--coffee-brown)]/90 backdrop-blur-md p-4 rounded-xl border border-[var(--honey-gold)] w-64 shadow-2xl transform -translate-x-1/2 -translate-y-full mt-[-20px] text-left">
                        <h3 className="text-[var(--honey-gold)] font-serif text-xl mb-1">{data.name}</h3>
                        <div className="w-full h-[1px] bg-[var(--honey-gold)]/30 mb-2"></div>
                        <p className="text-[var(--cream-white)] text-sm font-light leading-relaxed">{data.description}</p>
                    </div>
                </Html>
            )}
        </group>
    );
}

function Globe() {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    return (
        <group rotation={[0.3, 2.5, 0]}> {/* Initial rotation to show Yemen */}
            {/* The Earth Sphere */}
            <mesh>
                <sphereGeometry args={[2, 64, 64]} />
                <meshPhysicalMaterial
                    color="#2D1B18" // Dark coffee earth
                    roughness={0.8}
                    metalness={0.2}
                    reflectivity={0.5}
                    clearcoat={0.3}
                />
            </mesh>

            {/* Wireframe/Atmosphere for aesthetic */}
            <mesh scale={[1.01, 1.01, 1.01]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#D4AF37" wireframe transparent opacity={0.05} />
            </mesh>

            {/* Region Markers */}
            {REGIONS.map((region) => (
                <RegionMarker
                    key={region.name}
                    position={latLongToVector3(region.lat, region.lon, 2.05)}
                    data={region}
                    isSelected={selectedRegion === region.name}
                    onSelect={setSelectedRegion}
                />
            ))}
        </group>
    );
}

export default function YemenMap() {
    return (
        <section className="relative w-full h-[800px] bg-[#1A100E] py-20 overflow-hidden">
            {/* Section Header */}
            <div className="absolute top-12 left-0 right-0 z-10 text-center pointer-events-none">
                <span className="text-[var(--honey-gold)] uppercase tracking-[0.4em] text-sm font-semibold">Our Origins</span>
                <h2 className="text-4xl md:text-5xl font-serif text-[var(--cream-white)] mt-4">The Land of Two Treasures</h2>
                <p className="max-w-xl mx-auto mt-4 text-[var(--cream-white)]/70 font-light">Explore the ancient volcanic peaks and desert valleys where our liquid gold and coffee cherries are born.</p>
            </div>

            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
                <ambientLight intensity={0.5} color="#D4AF37" />
                <pointLight position={[10, 10, 10]} intensity={100} color="#FFB300" />
                <spotLight position={[-10, 0, 10]} intensity={50} angle={0.5} color="#ffffff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <Globe />

                {/* Controls restricted to keep focus on the relevant side */}
                <OrbitControls
                    enableZoom={false}
                    minPolarAngle={1}
                    maxPolarAngle={2}
                    rotateSpeed={0.5}
                    enablePan={false}
                />
            </Canvas>

            {/* Instructional Overlay */}
            <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
                <span className="text-[var(--cream-white)]/40 text-xs uppercase tracking-widest animate-pulse">Drag to Explore • Click Points</span>
            </div>
        </section>
    );
}
