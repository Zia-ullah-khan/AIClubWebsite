const MessageBox: React.FC<{ title: string, message: string, onClose: () => void }> = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-2xl max-w-sm w-full border border-[#875FFF]">
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="w-full bg-[#875FFF] hover:bg-[#6e46cc] text-white py-2 rounded-lg font-semibold transition"
      >
        Close
      </button>
    </div>
  </div>
);
export default MessageBox;