import * as Dialog from '@radix-ui/react-dialog'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { ArrowLeft, Mic, Trash2 } from 'lucide-react'
import { ChangeEvent, useState } from 'react'
import { toast } from 'sonner'

interface NoteCardProps {
  note: {
    id: string
    title: string
    date: Date
    content: string
  }
  onNoteDeleted: (id: string) => void
  onNoteEdit: (id: string, title:string, content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NoteCard({ note, onNoteDeleted, onNoteEdit}: NoteCardProps) {
  const [isRecording, SetIsRecording] = useState(false)
  const [titleEdit, setTitleEdit] = useState(note.title)
  const [contentEdit, setContentEdit] = useState(note.content)

  function handleTitleEdit(event: ChangeEvent<HTMLInputElement>) {
    setTitleEdit(event.target.value)
    console.log(contentEdit)
  }

  function handleContentEdit(event: ChangeEvent<HTMLTextAreaElement>) {
    setContentEdit(event.target.value)
    console.log(contentEdit)
  }

  function handleEditNote (id: string){
    onNoteEdit(id,titleEdit,contentEdit)
    toast.success('Nota Editada com sucesso!')
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
    speechRecognition.continuous = true //continue recording when I stopped talking
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true //show the sentences while Im talking

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')

      setContentEdit(contentEdit+' '+transcription)
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
      <Dialog.Trigger className='rounded-md text-left flex flex-col bg-slate-800 p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-lime-400'>
        <div className='w-full flex justify-between items-center'>
          <span className='text-lg text-ellipsis whitespace-nowrap w-3/5 h-auto overflow-hidden'>{note.title}</span>
          <span className='text-[10px] font-medium text-slate-300 text-right'>
            {formatDistanceToNow(note.date, { locale: pt, addSuffix: true })}
          </span>
        </div>
        <p className='text-sm leading-6 text-slate-400 text-ellipsis w-full overflow-hidden'>
          {note.content}
        </p>
        <div className='absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none' />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />
        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none '>
          <div className='flex justify-between items-center p-5'>
            <div className='flex gap-3 items-center'>
              <Dialog.Close>
                <span className='text-slate-50 hover:text-slate-400'><ArrowLeft className='size-5 ' /></span>
              </Dialog.Close>
              <button type='button' className='text-slate-50 hover:text-red-600' onClick={() => onNoteDeleted(note.id)}><Trash2 className='size-4 ' /></button>
            </div>
            <span className='text-[12px] font-medium text-gray-400 text-right'>
              {formatDistanceToNow(note.date, { locale: pt, addSuffix: true })}
            </span>
          </div>
          <form className='flex-1 flex flex-col'>
            <div className='flex flex-1 flex-col gap-3 px-5'>
              <div className='flex justify-between items-center gap-3'>
                <input type='text' placeholder='Titulo:' className='w-full bg-transparent text-lg font-semibold outline-none' onChange={handleTitleEdit} value={titleEdit} />
                {isRecording ? (
                  <button type='button' className='text-red-600 bg-slate-800 p-2 rounded-full' onClick={handleStopRecording}><Mic className='size-4'/></button>
                ) : (
                  <button type="button" className='bg-slate-800 p-2 rounded-full' onClick={handleStartRecording}><Mic className='size-4'/></button>
                )}
              </div>
              <textarea autoFocus className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none' onChange={handleContentEdit} value={contentEdit} />
            </div>
            {isRecording ? (
              <button disabled type='button' className='w-full bg-lime-200 py-4 text-center text-sm text-gray-300 outline-none font-medium cursor-not-allowed'>
                Editar nota
              </button>
            ) : (
              <button type='button' className='w-full bg-lime-400 py-3 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500' onClick={() => handleEditNote(note.id)}>
              Editar nota
            </button>
            )}
            
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}