import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button, Flex } from '@radix-ui/themes';
import { api } from '../lib/api';

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setItems(data || []);
    } catch (err) {
      console.error('Error loading notifications', err);
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <Flex
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-700"
   
      
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Flex>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            <Button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
              size="1"
              variant="ghost"
            >
              Close
            </Button>
          </div>
          <div className="divide-y">
            {items.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">No notifications</div>
            ) : (
              items.map((n) => (
                <div key={n._id} className="px-3 py-3 hover:bg-gray-50">
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
