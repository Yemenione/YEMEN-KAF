"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./HeroScene"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#3E2723]" />
});

export default function DynamicHero() {
    return <HeroScene />;
}
