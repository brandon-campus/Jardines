import { useEffect, useState, useCallback } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones de escritorio.');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const p = await Notification.requestPermission();
      setPermission(p);
      return p === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      // Chrome en Android no permite new Notification(): ahí solo queda la campanita.
      try {
        const notification = new Notification(title, {
          icon: '/favicon.svg',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.warn('No se pudo mostrar la notificación del sistema:', err);
      }
}
  }, [permission]);

  return { permission, requestPermission, sendNotification };
}
