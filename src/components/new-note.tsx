import { Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteProps{
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNote({onNoteCreated}: NewNoteProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [isRecording, SetIsRecording] = useState(false)
  const [content, setContent] = useState('')

  function handleStartEditor(){
    setShouldShowOnboarding(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){
    setContent(event.target.value)
    if(event.target.value === ''){
      setShouldShowOnboarding(true)
    }
  }

  function handleSaveNote (event: FormEvent){
    event.preventDefault()

    if(content === ''){
      return
    }
    
    onNoteCreated(content)

    setContent('')
    setShouldShowOnboarding(true)

    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording () {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable){
      alert('Infelizmente seu navegador nao suporta a API de Gravação')
      return
    }

    SetIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt'
    speechRecognition.continuous = true //continue talking when I stopped talking
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true //show the sentences while Im talking

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event)
    }

    speechRecognition.start()
  }

  function handleStopRecording (){
    SetIsRecording(false)

    if(speechRecognition !== null){
      speechRecognition.stop()
    }
  }
  return (
    <Dialog.Root>
      <Dialog.Trigger className='fixed bottom-7 right-32 bg-lime-400 p-4 rounded-full text-black'>
        <Plus className='w-6 h-6'/>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
            <X className='size-5'/>
          </Dialog.Close>
          <form className='flex-1 flex flex-col'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-300'>
                Adicionar nota
              </span>
              {shouldShowOnboarding ? (
                <p className='text-sm leading-6 text-slate-400'>
                  Comece a <button type="button" className='font-medium text-lime-400 hover:underline' onClick={handleStartRecording}>gravar uma nota</button> em aúdio ou se preferir <button type="button" onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                </p>
              ) : (
                <textarea autoFocus className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none' onChange={handleContentChange} value={content}/>
              )}
            </div>
            
            {isRecording ? (
              <button type='button' className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100' onClick={handleStopRecording}>
                <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                Gravando! (clique p/interromper)
              </button>
            ) : (
              <button type='button' className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500' onClick={handleSaveNote} >
                Salvar nota
              </button>
            )}

            
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}