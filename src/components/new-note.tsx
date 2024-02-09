import * as Dialog from '@radix-ui/react-dialog'
import { X, Mic, Plus } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteProps{
  onNoteCreated: (title:string, content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNote({onNoteCreated}: NewNoteProps) {
  const [isRecording, SetIsRecording] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>){
    setContent(event.target.value)
  }

  function handleTitleChange (event: ChangeEvent<HTMLInputElement>){
    setTitle(event.target.value)
  }

  function handleSaveNote (event: FormEvent){
    event.preventDefault()

    if((content === '') || (title === '')){
      toast.info('Título ou Conteúdo Vazio!')
      return
    }else{
      onNoteCreated(title,content)
    }

    setContent('')
    setTitle('')

    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording () {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable){
      toast.error('Infelizmente seu navegador nao suporta a API de Gravação')
      return
    }

    SetIsRecording(true)

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
      <Dialog.Trigger className='fixed bottom-7 right-10 md:right-24 bg-lime-400 p-4 rounded-full text-black'>
        <Plus className='w-6 h-6'/>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
            <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
              <X className='size-5'/>
            </Dialog.Close>
          <form className='flex-1 flex flex-col mt-5'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <div className='flex justify-between items-center gap-3'>
                <input type='text' placeholder='Titulo:' className='w-full bg-transparent text-lg font-semibold outline-none' onChange={handleTitleChange} value={title}/>
                {isRecording ? (
                  <button type='button' className='text-red-600 bg-slate-800 p-2 rounded-full' onClick={handleStopRecording}><Mic className='size-4'/></button>
                ) : (
                  <button type="button" className='bg-slate-800 p-2 rounded-full' onClick={handleStartRecording}><Mic className='size-4'/></button>
                  
                )}
              </div>
              {isRecording ? (
                <textarea autoFocus className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none' onChange={handleContentChange} value={content}/>
              ) : (
                <textarea placeholder='Escreva a sua nota aqui' autoFocus className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none' onChange={handleContentChange} value={content}/>
              )}
                
            </div>
            
            {isRecording ? (
              <button disabled type='button' className='w-full bg-lime-200 py-4 text-center text-sm text-gray-300 outline-none font-medium cursor-not-allowed'>
                Salvar nota
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