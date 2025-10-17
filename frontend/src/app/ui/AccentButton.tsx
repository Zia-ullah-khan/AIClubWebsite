interface AccentButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const AccentButton: React.FC<AccentButtonProps> = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="bg-[#875FFF] hover:bg-[#6e46cc] disabled:bg-[#6e46cc]/50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#875FFF]/50"
  >
    {children}
  </button>
);
export default AccentButton;