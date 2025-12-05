import React from 'react';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  avatarUrl: string;
}

const Header: React.FC<HeaderProps> = ({ showSearch = true, avatarUrl }) => {
  return (
    <header className="sticky top-0 flex items-center justify-between whitespace-nowrap border-b border-border-light px-6 py-3 bg-surface-light z-10 w-full">
      {showSearch ? (
        <label className="flex flex-col min-w-40 !h-10 max-w-sm w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-text-light-secondary flex bg-background-light items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined !text-2xl">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light-primary focus:outline-0 focus:ring-0 border-none bg-background-light h-full placeholder:text-text-light-secondary px-4 rounded-l-none border-l-0 pl-2 text-base font-normal"
              placeholder="Search applications, users..."
            />
          </div>
        </label>
      ) : (
        <div />
      )}
      
      <div className="flex items-center justify-end gap-2">
        <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-transparent hover:bg-primary/10 text-text-light-secondary hover:text-primary transition-colors">
          <span className="material-symbols-outlined !text-2xl">notifications</span>
        </button>
        <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-transparent hover:bg-primary/10 text-text-light-secondary hover:text-primary transition-colors">
          <span className="material-symbols-outlined !text-2xl">help</span>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ml-4 border border-border-light"
          style={{ backgroundImage: `url("${avatarUrl}")` }}
        ></div>
      </div>
    </header>
  );
};

export default Header;