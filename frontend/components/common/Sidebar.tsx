import React from 'react';

interface SidebarItemProps {
  icon: string;
  label: string;
  active?: boolean;
  filled?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, filled, onClick }) => {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick?.(); }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-text-light-secondary hover:bg-primary/10 hover:text-primary'
      }`}
    >
      <span className={`material-symbols-outlined !text-2xl ${filled ? 'filled' : ''}`}>
        {icon}
      </span>
      <p className="text-sm font-medium">{label}</p>
    </a>
  );
};

interface SidebarProps {
  title: string;
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  menuItems: Array<{ icon: string; label: string; active?: boolean; filled?: boolean; onClick?: () => void }>;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ title, user, menuItems, onLogout }) => {
  return (
    <nav className="sticky top-0 h-screen flex flex-col bg-surface-light border-r border-border-light p-4 w-64 flex-shrink-0 hidden md:flex">
      <div className="flex items-center gap-3 p-3 mb-4">
        <div className="size-8 text-primary">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"></path>
          </svg>
        </div>
        <h2 className="text-text-light-primary text-lg font-bold">{title}</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {menuItems.map((item, idx) => (
            <SidebarItem key={idx} {...item} />
          ))}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-4">
        <SidebarItem icon="settings" label="Settings" />
        
        <div className="flex flex-col gap-2 border-t border-border-light pt-4">
           {onLogout && (
             <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-text-light-secondary hover:bg-red-50 hover:text-red-600 text-left w-full"
             >
                <span className="material-symbols-outlined !text-2xl">logout</span>
                <p className="text-sm font-medium">Sign Out</p>
             </button>
           )}
           
          <div className="flex gap-3 items-center pt-2">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{ backgroundImage: `url("${user.avatar}")` }}
            ></div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-text-light-primary text-base font-medium truncate">{user.name}</h1>
              <p className="text-text-light-secondary text-sm font-normal truncate">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;