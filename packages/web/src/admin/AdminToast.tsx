interface Props {
  saving: boolean;
  uploading: boolean;
  message: string;
}

export function AdminToast({ saving, uploading, message }: Props) {
  const busy = saving || uploading;

  return (
    <>
      {busy && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-gold bg-[#1a1a1a] px-6 py-4 shadow-2xl"
          role="status"
          aria-live="polite"
        >
          <span
            className="inline-block h-5 w-5 shrink-0 rounded-full border-2 border-gold/30 border-t-gold"
            style={{ animation: 'quenns-spin 0.7s linear infinite' }}
          />
          <span className="text-sm font-medium text-gold">
            {uploading ? 'Subiendo imagen...' : 'Guardando cambios...'}
          </span>
        </div>
      )}

      {!busy && message && (
        <div
          className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg border px-6 py-3 text-sm font-medium shadow-2xl ${
            message.includes('Error')
              ? 'border-red-500 bg-red-950 text-red-300'
              : 'border-green-600 bg-green-950 text-green-300'
          }`}
          role="status"
        >
          {message}
        </div>
      )}

      <style>{`
        @keyframes quenns-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
