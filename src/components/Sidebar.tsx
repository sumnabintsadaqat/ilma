import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  BookMarked, 
  PenTool, 
  FolderKanban, 
  History,
  LogOut 
} from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../App';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sessions', icon: History, label: 'Sessions' },
  { to: '/hifz', icon: BookOpen, label: 'Hifz' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/reading', icon: BookMarked, label: 'Reading' },
  { to: '/writing', icon: PenTool, label: 'Writing' },
];

export default function Sidebar() {
  const { profile } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-black/5 flex flex-col p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-serif text-ink">Ilm</h1>
        <p className="text-gold arabic-naskh text-sm -mt-1">علم</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isActive 
                ? "bg-parchment text-gold shadow-sm" 
                : "text-ink/60 hover:bg-parchment hover:text-ink"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-black/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{profile?.name}</p>
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full",
              profile?.role === 'student' ? "bg-gold/10 text-gold" : "bg-sage/10 text-sage"
            )}>
              {profile?.role}
            </span>
          </div>
        </div>
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-2 text-ink/60 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
