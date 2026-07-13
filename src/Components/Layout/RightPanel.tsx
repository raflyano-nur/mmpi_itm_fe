import React from 'react';
import { FiMoreVertical, FiStar, FiClock, FiSearch } from 'react-icons/fi';

interface SavedTopic {
  id: string;
  title: string;
  timestamp: string;
  isStarred: boolean;
}

interface RecentChat {
  id: string;
  title: string;
  timestamp: string;
}

const RightPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const savedTopics: SavedTopic[] = [
    {
      id: '1',
      title: 'Give me unique name logo for...',
      timestamp: 'Edited 2m ago',
      isStarred: true
    },
    {
      id: '2',
      title: 'Create a logo for a tech startup',
      timestamp: 'Edited Oct 2, 2:05 PM',
      isStarred: true
    }
  ];

  const recentChats: RecentChat[] = [
    {
      id: '1',
      title: 'New Chat',
      timestamp: 'Edited 1m ago'
    },
    {
      id: '2',
      title: 'Give me unique name logo for...',
      timestamp: 'Edited 2m ago'
    },
    {
      id: '3',
      title: 'Create a logo for a tech startup',
      timestamp: 'Edited 5m ago'
    },
    {
      id: '4',
      title: 'Design a logo for a sustainable...',
      timestamp: 'Edited Oct 3, 1:44 PM'
    },
    {
      id: '5',
      title: 'Develop a logo for an online le...',
      timestamp: 'Edited Oct 4, 2:55 PM'
    },
    {
      id: '6',
      title: 'Create content for privacy poli...',
      timestamp: 'Edited Oct 6, 3:06 PM'
    }
  ];

  return (
    <div className="w-80 bg-[#131314] border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors">
            <FiSearch size={18} />
          </button>
          <button className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors">
            📊
          </button>
          <button className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors">
            📤
          </button>
          <button className="p-2 hover:bg-[#1e1e1e] rounded-lg transition-colors">
            <FiMoreVertical size={18} />
          </button>
        </div>
        <button className="px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-lg border border-gray-800 flex items-center gap-2 transition-colors text-sm">
          New Chat
          <span className="text-blue-400">✨</span>
        </button>
      </div>

      {/* Search Box */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-gray-700 transition-colors"
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 bg-[#2a2a2a] border border-gray-700 rounded text-xs text-gray-400">
            ⌘ F
          </kbd>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Saved Topics Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiStar size={16} className="text-gray-400" />
              <span className="text-sm font-medium">Saved topic</span>
            </div>
            <button className="p-1 hover:bg-[#1e1e1e] rounded transition-colors">
              <FiMoreVertical size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-2">
            {savedTopics.map((topic) => (
              <div
                key={topic.id}
                className="group p-3 hover:bg-[#1e1e1e] rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm flex-1 line-clamp-2">{topic.title}</h4>
                  <FiStar size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0 ml-2" />
                </div>
                <p className="text-xs text-gray-500">{topic.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Chats Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock size={16} className="text-gray-400" />
              <span className="text-sm font-medium">Recent Chats</span>
            </div>
            <button className="p-1 hover:bg-[#1e1e1e] rounded transition-colors">
              <FiMoreVertical size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                className="group p-3 hover:bg-[#1e1e1e] rounded-lg transition-colors cursor-pointer relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm line-clamp-2 mb-1">{chat.title}</h4>
                    <p className="text-xs text-gray-500">{chat.timestamp}</p>
                  </div>
                  <button className="w-5 h-5 rounded-full border border-gray-700 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2a2a2a]">
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;