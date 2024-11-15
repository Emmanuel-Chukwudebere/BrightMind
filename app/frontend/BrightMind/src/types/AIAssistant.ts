// AIAssistant.ts
interface AIAssistantState {
    mode: 'fab' | 'lesson-controls' | 'input' | 'chat';
    isVisible: boolean;
    isSpeaking: boolean;
    isRecording: boolean;
  }