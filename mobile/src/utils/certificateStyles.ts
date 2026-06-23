export const getCertificateCSS = () => `
  /* Typography */
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .text-right { text-align: right; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .font-black { font-weight: 900; }
  .text-xs { font-size: 0.75rem; line-height: 1rem; }
  .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
  .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
  .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
  .text-2xl { font-size: 1.5rem; line-height: 2rem; }
  .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
  .text-5xl { font-size: 3rem; line-height: 1; }
  .text-6xl { font-size: 3.75rem; line-height: 1; }
  .text-\\[9px\\] { font-size: 9px; }
  .text-\\[10px\\] { font-size: 10px; }
  .text-\\[11px\\] { font-size: 11px; }
  .text-\\[12px\\] { font-size: 12px; }
  .text-\\[12\\.5px\\] { font-size: 12.5px; }
  .text-\\[13px\\] { font-size: 13px; }
  .text-\\[14px\\] { font-size: 14px; }
  .uppercase { text-transform: uppercase; }
  .capitalize { text-transform: capitalize; }
  .tracking-wider { letter-spacing: 0.05em; }
  .tracking-widest { letter-spacing: 0.1em; }
  .tracking-wide { letter-spacing: 0.025em; }
  .leading-relaxed { line-height: 1.625; }
  .leading-snug { line-height: 1.375; }

  /* Colors */
  .text-white { color: #ffffff; }
  .text-slate-400 { color: #94a3b8; }
  .text-slate-500 { color: #64748b; }
  .text-slate-600 { color: #475569; }
  .text-slate-700 { color: #334155; }
  .text-slate-800 { color: #1e293b; }
  .text-indigo-50 { color: #eef2ff; }
  .text-indigo-100 { color: #e0e7ff; }
  .text-indigo-500 { color: #6366f1; }
  .text-indigo-600 { color: #4f46e5; }
  .text-indigo-700 { color: #4338ca; }
  .text-indigo-800 { color: #3730a3; }
  .text-emerald-500 { color: #10b981; }
  .text-emerald-600 { color: #059669; }
  .text-emerald-800 { color: #065f46; }
  .text-amber-500 { color: #f59e0b; }
  .text-amber-600 { color: #d97706; }
  .text-amber-800 { color: #92400e; }
  .text-blue-500 { color: #3b82f6; }
  .text-blue-800 { color: #1e40af; }
  .text-rose-500 { color: #f43f5e; }
  .text-rose-600 { color: #e11d48; }
  .text-rose-800 { color: #9f1239; }
  .text-sky-500 { color: #0ea5e9; }
  .text-sky-600 { color: #0284c7; }
  .text-sky-800 { color: #075985; }
  .text-teal-600 { color: #0d9488; }
  .text-teal-800 { color: #115e59; }
  .text-orange-500 { color: #f97316; }
  .text-orange-800 { color: #9a3412; }
  .text-fuchsia-600 { color: #c026d3; }
  .text-fuchsia-800 { color: #86198f; }
  .text-violet-600 { color: #7c3aed; }
  .text-violet-800 { color: #5b21b6; }

  /* Backgrounds */
  .bg-white { background-color: #ffffff; }
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-indigo-500 { background-color: #6366f1; }
  .bg-indigo-600 { background-color: #4f46e5; }
  .bg-indigo-100 { background-color: #e0e7ff; }
  .bg-emerald-600 { background-color: #059669; }
  .bg-amber-500 { background-color: #f59e0b; }
  .bg-rose-600 { background-color: #e11d48; }
  .bg-sky-500 { background-color: #0ea5e9; }
  .bg-sky-600 { background-color: #0284c7; }
  .bg-teal-600 { background-color: #0d9488; }
  .bg-orange-500 { background-color: #f97316; }
  .bg-fuchsia-600 { background-color: #c026d3; }
  .bg-violet-600 { background-color: #7c3aed; }
  .bg-slate-700 { background-color: #334155; }

  /* Semi-transparent backgrounds */
  .bg-indigo-50\\/50 { background-color: rgba(238, 242, 255, 0.5); }
  .bg-emerald-50\\/50 { background-color: rgba(236, 253, 245, 0.5); }
  .bg-amber-50\\/50 { background-color: rgba(255, 251, 235, 0.5); }
  .bg-blue-50\\/50 { background-color: rgba(239, 246, 255, 0.5); }
  .bg-rose-50\\/50 { background-color: rgba(255, 241, 242, 0.5); }
  .bg-sky-50\\/50 { background-color: rgba(240, 249, 255, 0.5); }
  .bg-teal-50\\/50 { background-color: rgba(240, 253, 250, 0.5); }
  .bg-orange-50\\/50 { background-color: rgba(255, 237, 213, 0.5); }
  .bg-fuchsia-50\\/50 { background-color: rgba(253, 244, 255, 0.5); }
  .bg-violet-50\\/50 { background-color: rgba(245, 243, 255, 0.5); }
  .bg-slate-50\\/50 { background-color: rgba(248, 250, 252, 0.5); }

  /* Layout */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .items-start { align-items: flex-start; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .gap-2 { gap: 0.5rem; }
  .gap-2\\.5 { gap: 0.625rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .gap-6 { gap: 1.5rem; }
  .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
  .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }

  /* Spacing */
  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 0.75rem; }
  .p-3\\.5 { padding: 0.875rem; }
  .p-5 { padding: 1.25rem; }
  .p-10 { padding: 2.5rem; }
  .p-12 { padding: 3rem; }
  .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
  .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
  .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
  .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .px-8 { padding-left: 2rem; padding-right: 2rem; }
  .px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
  .px-12 { padding-left: 3rem; padding-right: 3rem; }
  .pt-3 { padding-top: 0.75rem; }
  .pb-4 { padding-bottom: 1rem; }
  .pl-2 { padding-left: 0.5rem; }
  .pl-3 { padding-left: 0.75rem; }
  .m-0 { margin: 0; }
  .mt-0\\.5 { margin-top: 0.125rem; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-8 { margin-top: 2rem; }
  .mt-auto { margin-top: auto; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-1\\.5 { margin-bottom: 0.375rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-5 { margin-bottom: 1.25rem; }
  .mb-8 { margin-bottom: 2rem; }
  .mb-12 { margin-bottom: 3rem; }
  .mb-16 { margin-bottom: 4rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }

  /* Borders */
  .border { border-width: 1px; border-style: solid; }
  .border-2 { border-width: 2px; border-style: solid; }
  .border-4 { border-width: 4px; border-style: solid; }
  .border-t { border-top-width: 1px; border-style: solid; }
  .border-b { border-bottom-width: 1px; border-style: solid; }
  .border-b-2 { border-bottom-width: 2px; border-style: solid; }
  .border-l-4 { border-left-width: 4px; border-style: solid; }
  .border-indigo-100 { border-color: #e0e7ff; }
  .border-indigo-200 { border-color: #c7d2fe; }
  .border-indigo-500 { border-color: #6366f1; }
  .border-slate-100 { border-color: #f1f5f9; }
  .border-slate-200 { border-color: #e2e8f0; }
  .border-emerald-100 { border-color: #d1fae5; }
  .border-amber-100 { border-color: #fef3c7; }
  .border-blue-100 { border-color: #dbeafe; }
  .border-blue-200 { border-color: #bfdbfe; }
  .border-rose-100 { border-color: #ffe4e6; }
  .border-sky-100 { border-color: #e0f2fe; }
  .border-teal-100 { border-color: #ccfbf1; }
  .border-orange-100 { border-color: #ffedd5; }
  .border-fuchsia-100 { border-color: #fae8ff; }
  .border-violet-100 { border-color: #ede9fe; }

  /* Rounded */
  .rounded-lg { border-radius: 0.5rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-full { border-radius: 9999px; }

  /* Shadows */
  .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
  .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }

  /* Misc */
  .opacity-75 { opacity: 0.75; }
  .opacity-90 { opacity: 0.9; }
  .absolute { position: absolute; }
  .inset-8 { top: 2rem; right: 2rem; bottom: 2rem; left: 2rem; }
  .inset-10 { top: 2.5rem; right: 2.5rem; bottom: 2.5rem; left: 2.5rem; }
  .bottom-16 { bottom: 4rem; }
  .w-full { width: 100%; }
  .w-12 { width: 3rem; }
  .w-16 { width: 4rem; }
  .h-1 { height: 0.25rem; }
  .h-12 { height: 3rem; }
  .h-16 { height: 4rem; }
  .h-full { height: 100%; }
  .max-w-lg { max-width: 32rem; }
  .max-w-2xl { max-width: 42rem; }
  .col-span-2 { grid-column: span 2 / span 2; }
  .pointer-events-none { pointer-events: none; }
  .inline-block { display: inline-block; }
  .transform { transform: translate(0,0); }
  .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
  .duration-300 { transition-duration: 300ms; }
`;
