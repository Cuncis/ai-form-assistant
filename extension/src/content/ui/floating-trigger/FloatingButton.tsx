interface FloatingButtonProps {
  onClick: () => void
  loading: boolean
}

export function FloatingButton({ onClick, loading }: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="Generate answers with AI Form Assistant"
      className="fixed right-4 bottom-4 z-[2147483647] flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-60"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        <span className="text-lg font-semibold">AI</span>
      )}
    </button>
  )
}
