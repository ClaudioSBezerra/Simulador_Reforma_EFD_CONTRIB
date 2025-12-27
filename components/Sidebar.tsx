
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { id: ViewType.MERCADORIAS, label: 'Mercadorias (C100)', icon: 'inventory_2' },
    { id: ViewType.ENERGIA, label: 'Água e Energia', icon: 'bolt' },
    { id: ViewType.FRETE, label: 'Frete e Transporte', icon: 'local_shipping' },
    { id: ViewType.IMPORTE, label: 'Importar SPED', icon: 'upload_file' },
  ];

  return (
    <aside className="w-64 bg-[#111a22] border-r border-[#233648] flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <span className="material-symbols-outlined text-primary text-2xl">analytics</span>
        </div>
        <div>
          <h1 className="text-white text-base font-bold leading-none">Fiscal Analytics</h1>
          <p className="text-[#92adc9] text-[10px] mt-1 uppercase tracking-wider font-semibold">Tax Specialist Pro</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
              activeView === item.id 
                ? 'bg-primary/10 text-white border border-primary/20' 
                : 'text-[#92adc9] hover:bg-[#233648] hover:text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeView === item.id ? 'text-primary' : 'text-[#92adc9] group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#233648]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#192633]">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">JS</div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">João Silva</p>
            <p className="text-[#92adc9] text-[10px] truncate">Master Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
