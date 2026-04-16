import { memo, useCallback, useState } from 'react'

const hostImageCandidates = [
  '/images/wagner_agenda.webp',
  '/images/wagner_agenda.jpg',
  '/imagens/wagner_agenda.webp',
  '/imagens/wagner_agenda.jpg',
]

function BookingHostCardComponent() {
  const [imageIndex, setImageIndex] = useState(0)

  const handleImageError = useCallback(() => {
    setImageIndex((current) => {
      if (current >= hostImageCandidates.length - 1) {
        return current
      }

      return current + 1
    })
  }, [])

  return (
    <div className="mx-auto mt-8 max-w-md sm:max-w-xl">
      <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/75 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-5">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.4rem] border border-cyan-400/20 bg-slate-800 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <img
              src={hostImageCandidates[imageIndex]}
              alt="Wagner Viviani"
              className="h-full w-full object-cover"
              loading="lazy"
              onError={handleImageError}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 sm:text-[0.72rem]">
              Quem conduzirá a conversa
            </p>
            <p className="mt-2 text-xl font-semibold text-white">Wagner Viviani</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Você falará diretamente com quem vai entender seu contexto, analisar o cenário atual e conduzir
              o diagnóstico inicial da sua demanda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const BookingHostCard = memo(BookingHostCardComponent)

export default BookingHostCard