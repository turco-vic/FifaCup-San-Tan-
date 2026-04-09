import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = 'BHpk9PimV-1ZlHBO3GzOFkuHjoTPMSxyjcH2QWF6h6hxRrrpUOXVTLevlVcPDhU3pb1dXfW3iwqjG59EEJapcN8';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export function usePushNotifications() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkSubscription();
    }, []);

    async function checkSubscription() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
    }

    async function subscribe() {
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('push_subscriptions').upsert({
                user_id: user.id,
                subscription: sub.toJSON()
            });

            setIsSubscribed(true);
        } catch (err) {
            console.error('Erro ao assinar notificações:', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function unsubscribe() {
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await sub.unsubscribe();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
                }
            }
            setIsSubscribed(false);
        } catch (err) {
            console.error('Erro ao cancelar notificações:', err);
        } finally {
            setIsLoading(false);
        }
    }

    return { isSubscribed, isLoading, subscribe, unsubscribe };
}
