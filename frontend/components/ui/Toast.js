import { useApp } from '../../hooks/useAppContext';

export default function Toast() {
    const { toasts } = useApp();

    return (
        <div className="fixed top-20 right-6 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="toast-enter flex items-center gap-2 bg-aura-text text-white px-5 py-3 rounded-xl text-sm shadow-lg"
                >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}