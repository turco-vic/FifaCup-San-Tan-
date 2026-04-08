import { useState, useEffect } from 'react'

export function usePWA() {
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Registra o service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
        }

        // Verifica se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }

        // Captura o evento de instalação
        const handler = (e: Event) => {
            e.preventDefault()
            setInstallPrompt(e)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    async function install() {
        if (!installPrompt) return
        const prompt = installPrompt as any
        prompt.prompt()
        const { outcome } = await prompt.userChoice
        if (outcome === 'accepted') {
            setIsInstalled(true)
            setInstallPrompt(null)
        }
    }

    return { installPrompt, isInstalled, install }
}
