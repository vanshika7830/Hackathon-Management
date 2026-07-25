import React from "react";

const ImageModal = ({ imageUrl, altText = "Image preview", onClose }) => {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-2xl overflow-hidden flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-all shadow-md"
                    aria-label="Close Preview"
                >
                    ✕
                </button>

                <img
                    src={imageUrl}
                    alt={altText}
                    className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                />
            </div>
        </div>
    );
};

export default ImageModal;
