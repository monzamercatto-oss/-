import React, { useCallback, useEffect } from 'react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept: string;
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, label }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(Array.from(e.dataTransfer.files));
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(Array.from(e.target.files));
    }
  };

  // Handle Ctrl+V (Paste)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Access clipboard data
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files);
        // Filter for accepted types (images and PDF)
        const validFiles = files.filter(f => 
          f.type.startsWith('image/') || f.type === 'application/pdf'
        );

        if (validFiles.length > 0) {
          e.preventDefault();
          onFileSelect(validFiles);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onFileSelect]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-emerald-800 bg-gray-900/50 rounded-lg p-10 text-center hover:bg-gray-800/50 transition cursor-pointer group"
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept={accept}
        multiple
        onChange={handleChange}
      />
      <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-emerald-600 mb-4 group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-xl font-cinzel text-emerald-100">{label}</span>
        <span className="text-sm text-gray-400 mt-2">
          Нажмите, перетащите файлы или <span className="text-emerald-500 font-bold">Ctrl+V</span> (буфер)
        </span>
      </label>
    </div>
  );
};