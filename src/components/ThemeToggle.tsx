interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

function ThemeToggle({ isDarkMode, onToggle }: ThemeToggleProps) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Cambiar tema">
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggle;