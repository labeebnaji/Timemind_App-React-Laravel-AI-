import { useState, useEffect, useRef } from 'react'
import { chatAPI, tasksAPI } from '../services/api'
import { Send, Wrench, X, MessageCircle, Bot, BarChart2, ClipboardList, Sparkles, Flame } from 'lucide-react'

const ChatTimeMind = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [tasks, setTasks] = useState([])
  const [organizeMode, setOrganizeMode] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: 'مرحباً! أنا **TimeMind AI**\n\nمساعدك الذكي لإدارة المهام والوقت. يمكنني مساعدتك في تنظيم مهامك، تقييم أدائك، وتقديم ملخصات شاملة.\n\nاستخدم زر **الأدوات** للوصول السريع للميزات، أو اكتب سؤالك مباشرة.'
    }])
    loadTasks()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll()
      setTasks(response.data)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const sendMessage = async (customMessage = null, toolType = null) => {
    const messageToSend = customMessage || input.trim()
    if (!messageToSend && !toolType) return

    // Check if in organize mode
    const isOrganizing = organizeMode && !toolType
    const actualToolType = isOrganizing ? 'organize_task' : toolType

    const userMessage = messageToSend
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setLoading(true)
    setShowTools(false)
    
    if (isOrganizing) {
      setOrganizeMode(false)
    }

    try {
      const response = await chatAPI.send({
        message: messageToSend,
        tool_type: actualToolType,
        tasks: tasks
      })
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response 
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'عذراً، حدث خطأ. حاول مرة أخرى.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  const getToolLabel = (type) => {
    const labels = {
      'evaluate': 'قم بتقييمي',
      'summary': 'ملخص المهام',
      'organize': 'رتب مهمتي',
      'motivate': 'حفزني'
    }
    return labels[type] || type
  }

  const getToolIcon = (type) => {
    const icons = {
      'evaluate': BarChart2,
      'summary': ClipboardList,
      'organize': Sparkles,
      'motivate': Flame
    }
    return icons[type] || Wrench
  }

  const handleToolClick = (toolType) => {
    if (toolType === 'organize') {
      setOrganizeMode(true)
      setShowTools(false)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '**أداة ترتيب المهمة**\n\nاكتب وصفاً عشوائياً لمهمتك وسأقوم بترتيبها لك بالشكل التالي:\n• اسم مناسب للمهمة\n• وصف واضح ومفصل\n• تاريخ انتهاء مقترح\n• التصنيف المناسب (عمل/دراسة/شخصي/صحة)\n• الأولوية (عالية/متوسطة/منخفضة)\n\nاكتب وصف مهمتك الآن...'
      }])
    } else {
      sendMessage(null, toolType)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const tools = [
    { id: 'evaluate', icon: BarChart2, label: 'قم بتقييمي', desc: 'تقييم شامل لأدائك' },
    { id: 'summary', icon: ClipboardList, label: 'ملخص المهام', desc: 'ملخص كامل لمهامك' },
    { id: 'organize', icon: Sparkles, label: 'رتب مهمتي', desc: 'تنظيم مهمة جديدة' },
    { id: 'motivate', icon: Flame, label: 'حفزني', desc: 'تحفيز مخصص لك' }
  ]

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageCircle className="text-blue-600" size={28} />
        Chat TimeMind
      </h1>
      
      {/* Chat Container */}
      <div className="flex-1 card !p-0 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                  {formatMessage(msg.content)}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-end">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3 sm:p-4">
          {/* Organize Mode Indicator */}
          {organizeMode && (
            <div className="mb-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-purple-700 flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600" />
                وضع ترتيب المهمة - اكتب وصف مهمتك
              </span>
              <button 
                onClick={() => setOrganizeMode(false)}
                className="text-purple-500 hover:text-purple-700"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={organizeMode ? "اكتب وصف مهمتك هنا..." : "اكتب رسالتك..."}
              className="flex-1 resize-none border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              rows="1"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 rounded-xl font-bold disabled:opacity-50 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <Send size={18} />
              إرسال
            </button>
          </div>
          
          {/* Tools Button */}
          <div className="relative mt-2">
            <button
              onClick={() => setShowTools(!showTools)}
              className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <Wrench size={16} />
              <span>الأدوات</span>
              <span className={`transition-transform ${showTools ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Tools Dropdown */}
            {showTools && (
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 min-w-[220px] z-10">
                {tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-right"
                  >
                    <tool.icon className="text-blue-600" size={20} />
                    <div>
                      <p className="font-medium text-sm">{tool.label}</p>
                      <p className="text-xs text-gray-500">{tool.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Format message with basic markdown
const formatMessage = (text) => {
  if (!text) return ''
  
  // Bold
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Line breaks
  formatted = formatted.split('\n').map((line, i) => (
    <span key={i}>
      <span dangerouslySetInnerHTML={{ __html: line }} />
      {i < text.split('\n').length - 1 && <br />}
    </span>
  ))
  
  return formatted
}

export default ChatTimeMind
