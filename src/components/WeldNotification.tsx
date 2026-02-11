import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
}

export function WeldNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('weld-touchup-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tool_moves',
          filter: 'requires_weld_touchup=eq.true',
        },
        async (payload) => {
          const newMove = payload.new;

          let locationInfo = '';
          if (newMove.department_id || newMove.line_id || newMove.station_id) {
            const parts = [];

            if (newMove.department_id) {
              const { data } = await supabase
                .from('departments')
                .select('name')
                .eq('id', newMove.department_id)
                .single();
              if (data) parts.push(data.name);
            }

            if (newMove.line_id) {
              const { data } = await supabase
                .from('lines')
                .select('name')
                .eq('id', newMove.line_id)
                .single();
              if (data) parts.push(data.name);
            }

            if (newMove.station_id) {
              const { data } = await supabase
                .from('stations')
                .select('name')
                .eq('id', newMove.station_id)
                .single();
              if (data) parts.push(data.name);
            }

            locationInfo = parts.length > 0 ? ` at ${parts.join(' > ')}` : '';
          }

          const message = `New weld touch up request${locationInfo}${newMove.weld_touchup_notes ? `: ${newMove.weld_touchup_notes}` : ''}`;

          const notification: Notification = {
            id: newMove.id,
            message,
            timestamp: new Date(),
          };

          setNotifications((prev) => [...prev, notification]);

          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }, 10000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weld_touchups',
        },
        async (payload) => {
          const newWeld = payload.new;

          let locationInfo = '';
          if (newWeld.department_id || newWeld.line_id || newWeld.station_id) {
            const parts = [];

            if (newWeld.department_id) {
              const { data } = await supabase
                .from('departments')
                .select('name')
                .eq('id', newWeld.department_id)
                .maybeSingle();
              if (data) parts.push(data.name);
            }

            if (newWeld.line_id) {
              const { data } = await supabase
                .from('lines')
                .select('name')
                .eq('id', newWeld.line_id)
                .maybeSingle();
              if (data) parts.push(data.name);
            }

            if (newWeld.station_id) {
              const { data } = await supabase
                .from('stations')
                .select('name')
                .eq('id', newWeld.station_id)
                .maybeSingle();
              if (data) parts.push(data.name);
            }

            locationInfo = parts.length > 0 ? ` at ${parts.join(' > ')}` : '';
          }

          const message = `New weld touch up added${locationInfo}${newWeld.description ? `: ${newWeld.description}` : ''}`;

          const notification: Notification = {
            id: newWeld.id,
            message,
            timestamp: new Date(),
          };

          setNotifications((prev) => [...prev, notification]);

          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
          }, 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-orange-50 border-l-4 border-orange-500 shadow-lg rounded-lg p-4 flex items-start gap-3 animate-slide-in"
        >
          <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-800 mb-1">
              Weld Touch Up Alert
            </p>
            <p className="text-sm text-orange-700 break-words">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => dismissNotification(notification.id)}
            className="flex-shrink-0 text-orange-400 hover:text-orange-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
