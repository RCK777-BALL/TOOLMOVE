interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'activity', label: 'Activity' },
    { id: 'tool-moves', label: 'Tool Moves' },
    { id: 'weld-touch-ups', label: 'Weld Touch Ups' },
    { id: 'locations', label: 'Locations' },
    { id: 'reasons', label: 'Reasons' },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
