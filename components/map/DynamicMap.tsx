"use client";

import dynamic from "next/dynamic";

const YemenMap = dynamic(() => import("./YemenMap"), {
    ssr: false,
    loading: () => <div className="w-full h-[800px] bg-[#1A100E] animate-pulse" />
});

export default function DynamicMap() {
    return <YemenMap />;
}
