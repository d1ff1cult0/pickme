'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadZoneProps {
    onParsed: (parsed: {
        aanwezig: string[];
        verontschuldigd: string[];
        afwezig: string[];
    }) => void;
}

export default function UploadZone({ onParsed }: UploadZoneProps) {
    const [error, setError] = useState<string | null>(null);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                onParsed(data);
            } else {
                setError(data.error || 'Failed to parse document');
            }
        } catch (err) {
            setError('An error occurred while uploading the file: ' + (err as Error).message);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/html': ['.html'] },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 p-6 rounded text-center cursor-pointer mb-4"
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the exported Google Doc (.html) here...</p>
            ) : (
                <p>Drag and drop a Google Doc export (.html) here, or click to select</p>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}