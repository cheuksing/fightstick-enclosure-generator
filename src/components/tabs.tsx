type TabItems = Array<{id: string; title: string}>;

type TabsProps<T extends TabItems> = {
  tabs: T;
  currentTab: T[0]['id'];
  onTabChange: (id: T[0]['id']) => void;
};

export function Tabs<T extends TabItems>({tabs, currentTab, onTabChange}: TabsProps<T>) {
  return (
    <div className='tabs'>
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab ${currentTab === tab.id ? 'active' : ''}`}
          onClick={() => {
            onTabChange(tab.id);
          }}
        >
          {tab.title}
        </div>
      ))}
    </div>
  );
}
