import { useState } from 'react'

type AdminLoginCardProps = {
  loading: boolean
  error: string
  onSubmit: (username: string, password: string) => Promise<void>
}

export default function AdminLoginCard({ loading, error, onSubmit }: AdminLoginCardProps) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')

  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await onSubmit(username.trim(), password)
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Área protegida</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">Administração da agenda</h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Entre com sua credencial administrativa para liberar dias, cadastrar horários e controlar o que aparece no
        formulário público.
      </p>

      {error ? (
        <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <form onSubmit={submitHandler} className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-username" className="mb-2 block text-sm font-medium text-slate-200">
            Usuário
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
            placeholder="admin"
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-slate-200">
            Senha
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
            placeholder="Sua senha administrativa"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50"
        >
          {loading ? 'Entrando...' : 'Entrar na área administrativa'}
        </button>
      </form>
    </section>
  )
}