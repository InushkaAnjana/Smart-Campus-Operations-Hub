/**
 * ================================================================
 * useNotifications.js - Notification state management hook
 * ================================================================
 * Owner: Member 4 - Notifications Module
 *
 * TODO Member 4:
 *  - Poll for unread count every 30 seconds
 *  - Add WebSocket connection here
 *  - Integrate with NotificationContext for app-wide bell badge
 * ================================================================
 */
import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '../services/notificationService'

const useNotifications = (userId) => {
  const [notifications, setNotifications]     = useState([])
  const [unreadCount, setUnreadCount]         = useState(0)
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState(null)

  const fetchNotifications = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await notificationService.getForUser(userId)
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markRead = useCallback(async (id) => {
    await notificationService.markAsRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    await notificationService.markAllAsRead(userId)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [userId])

  useEffect(() => {
    fetchNotifications()
    // TODO: Member 4 - Add polling interval
    // const interval = setInterval(fetchNotifications, 30000)
    // return () => clearInterval(interval)
  }, [fetchNotifications])

  return { notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead }
}

export default useNotifications
