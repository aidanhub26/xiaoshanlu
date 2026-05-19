import { useState } from 'react'
import { supabase } from '../lib/supabase'
import LotusIcon from '../components/LotusIcon'

const GREEN = '#2D6A4F'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (err) setError(err.message)
    else setStep('code')
  }

  const handleVerify = async () => {
    if (code.length < 6) return
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setLoading(false)
    if (err) setError('验证码无效或已过期，请重新获取')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 pb-16" style={{ background: '#FAFAF8' }}>
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/icon-512.png" alt="小善录" className="w-20 h-20 rounded-2xl mb-4" />
          <h1 className="text-xl font-semibold text-[#1A1A1A] tracking-wide">小善录</h1>
          <p className="text-sm text-[#999] mt-1">每日三恩一施，点滴善念记录</p>
        </div>

        {step === 'email' ? (
          <div>
            <p className="text-sm text-[#888] mb-4 text-center">输入邮箱，获取验证码登录</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="your@email.com"
              autoFocus
              className="w-full bg-white border border-[#E8E4DC] rounded-xl px-4 py-3.5 text-[15px] text-[#1A1A1A] placeholder-[#BDBDBD] mb-3"
            />
            {error && <p className="text-xs text-red-400 mb-3 text-center">{error}</p>}
            <button
              onClick={handleSend}
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-xl text-white font-medium text-[15px] transition-opacity"
              style={{ backgroundColor: (loading || !email.trim()) ? '#9CA3AF' : GREEN }}
            >
              {loading ? '发送中…' : '获取验证码'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#888] mb-1 text-center">验证码已发送至</p>
            <p className="text-sm font-medium text-[#1A1A1A] mb-5 text-center">{email}</p>
            <input
              type="number"
              value={code}
              onChange={e => setCode(e.target.value.slice(0, 8))}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="请输入验证码"
              autoFocus
              inputMode="numeric"
              className="w-full bg-white border border-[#E8E4DC] rounded-xl px-4 py-3.5 text-center text-xl tracking-widest text-[#1A1A1A] placeholder-[#BDBDBD] mb-3"
            />
            {error && <p className="text-xs text-red-400 mb-3 text-center">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading || code.length < 6}
              className="w-full py-3.5 rounded-xl text-white font-medium text-[15px] mb-3 transition-opacity"
              style={{ backgroundColor: (loading || code.length < 6) ? '#9CA3AF' : GREEN }}
            >
              {loading ? '验证中…' : '登录'}
            </button>
            <button
              onClick={() => { setStep('email'); setCode(''); setError('') }}
              className="w-full text-xs text-[#BDBDBD] text-center py-1"
            >
              重新发送验证码
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
