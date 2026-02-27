import { useEffect } from "react";

const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
}) => {
    // Close on ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden"; // Lock scroll
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-[90%] max-w-md transform transition-all duration-200 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Confirm Deletion
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete this task? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;