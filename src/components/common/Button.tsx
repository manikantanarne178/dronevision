interface ButtonProps {
  title: string;
  onClick?: () => void;
  loading?: boolean;
}

export default function Button({
  title,
  onClick,
  loading,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-cyan-500 hover:bg-cyan-600 transition-all px-8 py-4 rounded-xl font-semibold shadow-lg shadow-cyan-500/20"
    >
      {loading ? "Processing..." : title}
    </button>
  );
}