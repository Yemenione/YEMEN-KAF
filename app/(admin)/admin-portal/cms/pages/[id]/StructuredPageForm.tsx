import React from 'react';

interface StructuredPageFormProps {
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (data: any) => void;
}

export default function StructuredPageForm({ slug, data, onChange }: StructuredPageFormProps) {
    if (!data) return <div className="p-4 text-gray-500">No structured data initialized.</div>;

    const handleHeroChange = (field: string, value: string) => {
        onChange({
            ...data,
            hero: { ...data.hero, [field]: value }
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSectionChange = (index: number, field: string, value: any) => {
        const newSections = [...data.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        onChange({ ...data, sections: newSections });
    };

    const handleFeatureChange = (sectionIndex: number, featureIndex: number, value: string) => {
        const newSections = [...data.sections];
        const newFeatures = [...newSections[sectionIndex].features];
        newFeatures[featureIndex] = value;
        newSections[sectionIndex].features = newFeatures;
        onChange({ ...data, sections: newSections });
    };

    if (slug === 'our-story') {
        return (
            <div className="space-y-8">
                {/* Hero */}
                <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <h3 className="font-bold border-b pb-2">Hero Section</h3>
                    <div>
                        <label className="block text-xs font-bold mb-1">Title</label>
                        <input className="w-full p-2 border rounded" value={data.hero?.title || ''} onChange={(e) => handleHeroChange('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Subtitle</label>
                        <textarea className="w-full p-2 border rounded" value={data.hero?.subtitle || ''} onChange={(e) => handleHeroChange('subtitle', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Image URL</label>
                        <input className="w-full p-2 border rounded" value={data.hero?.image || ''} onChange={(e) => handleHeroChange('image', e.target.value)} />
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    <h3 className="font-bold">Content Sections</h3>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {data.sections?.map((section: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border space-y-4 relative">
                            <span className="absolute top-2 right-2 text-xs bg-gray-200 px-2 py-1 rounded">Section {idx + 1} ({section.type})</span>
                            <div>
                                <label className="block text-xs font-bold mb-1">Title</label>
                                <input className="w-full p-2 border rounded" value={section.title || ''} onChange={(e) => handleSectionChange(idx, 'title', e.target.value)} />
                            </div>
                            {section.type === 'image-text' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold mb-1">Content</label>
                                        <textarea className="w-full p-2 border rounded h-24" value={section.content || ''} onChange={(e) => handleSectionChange(idx, 'content', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-1">Image URL</label>
                                        <input className="w-full p-2 border rounded" value={section.image || ''} onChange={(e) => handleSectionChange(idx, 'image', e.target.value)} />
                                    </div>
                                </>
                            )}
                            {section.type === 'grid' && (
                                <div>
                                    <label className="block text-xs font-bold mb-1">Grid Items (JSON)</label>
                                    <textarea
                                        className="w-full p-2 border rounded h-32 font-mono text-xs"
                                        value={JSON.stringify(section.items, null, 2)}
                                        onChange={(e) => {
                                            try { handleSectionChange(idx, 'items', JSON.parse(e.target.value)); } catch { }
                                        }}
                                    />
                                    <p className="text-[10px] text-gray-500">Edit as JSON for now</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (slug === 'the-farms') {
        return (
            <div className="space-y-8">
                {/* Hero */}
                <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <h3 className="font-bold border-b pb-2">Hero Section</h3>
                    <div>
                        <label className="block text-xs font-bold mb-1">Title</label>
                        <input className="w-full p-2 border rounded" value={data.hero?.title || ''} onChange={(e) => handleHeroChange('title', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Subtitle</label>
                        <textarea className="w-full p-2 border rounded" value={data.hero?.subtitle || ''} onChange={(e) => handleHeroChange('subtitle', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Tagline</label>
                        <input className="w-full p-2 border rounded" value={data.hero?.tagline || ''} onChange={(e) => handleHeroChange('tagline', e.target.value)} />
                    </div>
                </div>

                {/* Sections (Regions) */}
                <div className="space-y-4">
                    <h3 className="font-bold">Regions</h3>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {data.sections?.map((section: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg border space-y-4 relative">
                            <span className="absolute top-2 right-2 text-xs bg-gray-200 px-2 py-1 rounded">Region {idx + 1}</span>
                            <div>
                                <label className="block text-xs font-bold mb-1">Region Name (Title)</label>
                                <input className="w-full p-2 border rounded" value={section.title || ''} onChange={(e) => handleSectionChange(idx, 'title', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Location (Subtitle)</label>
                                <input className="w-full p-2 border rounded" value={section.subtitle || ''} onChange={(e) => handleSectionChange(idx, 'subtitle', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Description</label>
                                <textarea className="w-full p-2 border rounded h-24" value={section.content || ''} onChange={(e) => handleSectionChange(idx, 'content', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1">Image URL</label>
                                <input className="w-full p-2 border rounded" value={section.image || ''} onChange={(e) => handleSectionChange(idx, 'image', e.target.value)} />
                            </div>

                            {/* Features List */}
                            <div>
                                <label className="block text-xs font-bold mb-1">Features</label>
                                <div className="space-y-2">
                                    {section.features?.map((feature: string, fIdx: number) => (
                                        <div key={fIdx} className="flex gap-2">
                                            <input
                                                className="w-full p-2 border rounded text-sm"
                                                value={feature}
                                                onChange={(e) => handleFeatureChange(idx, fIdx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return <div>Structured editing not supported for this page type.</div>;
}
