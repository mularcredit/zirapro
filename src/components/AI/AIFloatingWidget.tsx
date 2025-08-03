import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { queryDeepSeek } from '../../services/deepseek'

export const AIFloatingWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [hrSummary, setHrSummary] = useState('')

  useEffect(() => {
    // Fetch initial HR summary
    const fetchHrData = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(5)
      
      if (!error && data) {
        setHrSummary(JSON.stringify(data))
      }
    }
    fetchHrData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await queryDeepSeek(message, hrSummary)
      setResponse(result.response)
    } catch (error) {
      setResponse('Error connecting to AI service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!isMinimized && (
        <motion.div
          className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">HR Assistant</h3>
            <div className="flex gap-2">
              <button onClick={() => setIsMinimized(true)} className="text-white">
                −
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white">
                ×
              </button>
            </div>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            {response ? (
              <div className="text-sm">{response}</div>
            ) : (
              <div className="text-sm text-gray-500">
                Ask me about your HR data, employee stats, or any HR-related questions.
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="Ask about your HR data..."
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                {loading ? '...' : 'Ask'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isMinimized && (
        <motion.button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50"
          whileHover={{ scale: 1.1 }}
        >
          <span>HR AI</span>
        </motion.button>
      )}
    </>
  )
}