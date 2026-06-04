// REMOVED: FlowSimulator.jsx
// REMOVED: RoleSwitcher.jsx
// REMOVED: POV switcher banner panels
// REMOVED: states like povRole, simulatorMode, switchRole(), handlePOVChange()

"use client";

import React from "react";

export default function Workspace() {
  return (
    <div id="legacy-workspace-cleanup" className="bg-white rounded-3xl border p-8 shadow-sm text-center font-bold text-xs text-slate-500 font-mono">
      <p>SISTEM TELAH DI-REFACTOR MENJADI MODULAR PRODUCTION-READY ROUTING.</p>
      <p className="mt-1 text-[10px] text-[#114E8D] font-bold uppercase tracking-wider">
        Referensi dialihkan sepenuhnya ke sub-halaman dashboard per role Next.js App Router.
      </p>
    </div>
  );
}
