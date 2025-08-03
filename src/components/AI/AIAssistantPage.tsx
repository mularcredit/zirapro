import { useState, useEffect } from 'react'
import { queryDeepSeek } from '../../services/deepseek'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Cpu, Database, Users, Activity, Sparkles, Bot, BarChart2 } from 'lucide-react'

export const AIAssistantPage = () => {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<Array<{role: string, content: string, id: string}>>([])
  const [loading, setLoading] = useState(false)
  const [hrData, setHrData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHrData = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
        
        if (error) throw error
        
        setHrData(data)
        setConversation([{
          role: 'system',
          content: `There are ${data.length} employees in the system.`,
          id: 'system-init'
        }, {
          role: 'assistant',
          content: `Hello! I'm your HR AI Assistant. I can help you analyze data for ${data.length} employees. What would you like to know?`,
          id: 'welcome-message'
        }])
      } catch (err) {
        setError('Failed to load HR data')
        console.error(err)
      }
    }
    fetchHrData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return
    
    setLoading(true)
    setError(null)
    const userMessage = { 
      role: 'user', 
      content: message,
      id: Date.now().toString() 
    }
    setConversation(prev => [...prev, userMessage])
    
    try {
      const context = [
        `Current employee count: ${hrData?.length || 0}`,
        ...conversation.map(c => c.content)
      ].join('\n')
      
      const result = await queryDeepSeek(message, context)
      
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: result.response,
          id: `ai-${Date.now()}`
        }
      ])
      setMessage('')
    } catch (error) {
      setError('Failed to get AI response')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate some HR metrics
  const activeEmployees = hrData?.filter((e: any) => e.status === 'active').length
  const avgTenure = hrData?.reduce((acc: number, e: any) => {
    const startDate = new Date(e.start_date)
    const tenure = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    return acc + tenure
  }, 0) / hrData?.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20">
                <Bot className="w-8 h-8" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                HR AI Assistant
              </span>
            </h1>
            <p className="text-white/80 mt-2 max-w-lg">
              AI-powered workforce analytics and insights for your organization
            </p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium text-white">AI Assistant</span>
          </motion.div>
        </motion.header>

        {/* HR Summary Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white/90">Total Employees</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {hrData ? hrData.length : '--'}
              <span className="text-sm font-normal ml-2 text-white/60">employees</span>
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg text-green-300">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white/90">Active Employees</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {activeEmployees || '--'}
              <span className="text-sm font-normal ml-2 text-white/60">active</span>
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white/90">Avg. Tenure</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {avgTenure ? avgTenure.toFixed(1) : '--'}
              <span className="text-sm font-normal ml-2 text-white/60">years</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Chat Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-xl"
        >
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <AnimatePresence>
              {conversation
                .filter(m => m.role !== 'system')
                .map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-5 ${msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-none' 
                      : 'bg-white/10 text-white rounded-bl-none border border-white/10'}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {msg.role === 'user' ? (
                          <div className="p-1.5 bg-white/20 rounded-full">
                            <User className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-blue-500/30 rounded-full">
                            <Cpu className="w-4 h-4 text-blue-300" />
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {msg.role === 'user' ? 'You' : 'HR Assistant'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm/relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white rounded-2xl rounded-bl-none p-5 max-w-[80%] border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/30 rounded-full">
                        <Cpu className="w-4 h-4 text-blue-300" />
                      </div>
                      <span className="text-sm font-medium">HR Assistant</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-5 bg-white/5 backdrop-blur-md">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-red-500/10 text-red-300 p-3 rounded-lg text-sm border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-white placeholder-white/40 text-sm"
                placeholder="Ask about your HR data (e.g. 'Show turnover trends')"
                disabled={loading}
              />
              <motion.button
                type="submit"
                disabled={loading || !message.trim()}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="p-3.5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
            <p className="text-xs text-white/50 mt-3 text-center">
              AI assistant may produce inaccurate information about people or policies
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}