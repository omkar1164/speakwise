'use client';

type MicButtonProps = {
  isRecording: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function MicButton({ isRecording, disabled = false, onClick }: MicButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      title={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <span className={`h-4 w-4 rounded ${isRecording ? 'bg-red-500' : 'bg-white'}`} />
    </button>
  );
}
