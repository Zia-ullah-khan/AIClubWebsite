import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#0F0F19] border-t border-[#875FFF]/10 text-gray-400 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 rounded-full border-2 border-[#875FFF] flex items-center justify-center">
            <span className="text-[9px] text-[#875FFF] font-bold">AI</span>
          </div>
          <span className="font-semibold text-white">AI Club</span>
          <span className="opacity-60">•</span>
          <span>2025</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="Twitter" className="hover:text-white transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.633 7.997c.013.177.013.355.013.533 0 5.42-4.125 11.67-11.67 11.67-2.32 0-4.477-.68-6.29-1.853.322.038.63.05.966.05a8.25 8.25 0 0 0 5.11-1.76 4.125 4.125 0 0 1-3.85-2.86c.254.038.508.063.775.063.368 0 .736-.05 1.079-.139a4.117 4.117 0 0 1-3.3-4.045v-.05c.546.303 1.17.494 1.836.52a4.11 4.11 0 0 1-1.837-3.43c0-.761.203-1.457.559-2.067a11.7 11.7 0 0 0 8.49 4.31 4.647 4.647 0 0 1-.101-.946 4.12 4.12 0 0 1 7.133-2.815 8.14 8.14 0 0 0 2.61-.994 4.13 4.13 0 0 1-1.81 2.274 8.24 8.24 0 0 0 2.37-.635 8.8 8.8 0 0 1-2.062 2.14z"/></svg>
          </a>
          <a href="#" aria-label="GitHub" className="hover:text-white transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.486 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.218.682-.485 0-.24-.009-.876-.014-1.72-2.782.605-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.071 1.533 1.032 1.533 1.032.892 1.53 2.341 1.088 2.91.833.092-.65.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.094.39-1.988 1.03-2.688-.103-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 7.52c.85.004 1.706.116 2.504.34 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.31.678.92.678 1.855 0 1.338-.013 2.417-.013 2.746 0 .27.18.583.688.484A10.025 10.025 0 0 0 22 12.02C22 6.486 17.523 2 12 2z" clipRule="evenodd"/></svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-white transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.762 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.79-1.75-1.764 0-.972.784-1.761 1.75-1.761s1.75.789 1.75 1.761c0 .974-.784 1.764-1.75 1.764zm13.5 11.268h-3v-5.604c0-1.337-.027-3.059-1.863-3.059-1.864 0-2.149 1.454-2.149 2.957v5.706h-3v-10h2.879v1.367h.041c.401-.76 1.381-1.562 2.843-1.562 3.04 0 3.602 2.001 3.602 4.602v5.593z"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
