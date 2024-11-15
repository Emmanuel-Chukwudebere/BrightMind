// components/AIAssistantSystem/AIAssistantSystem.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { ArrowLeft, Brain, Speaker, Mic, SendFilled } from '@fluentui/react-native-icons';
import axios from 'axios';

interface AIAssistantSystemProps {
  mode?: 'fab' | 'lesson-controls';
  lessonContent?: string;
  tabBarHeight?: number;
  isLessonScreen?: boolean;
}

export const AIAssistantSystem: React.FC<AIAssistantSystemProps> = ({
  mode = 'fab',
  lessonContent = '',
  tabBarHeight = 0,
  isLessonScreen = false,
}) => {
  // State management
  const [state, setState] = useState<AIAssistantState>({
    mode: mode,
    isVisible: true,
    isSpeaking: false,
    isRecording: false,
  });
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);

  // Refs for animations and audio
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const chatWindowHeight = useRef(new Animated.Value(0)).current;
  const sound = useRef<Audio.Sound | null>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      width: '100%',
      ...Platform.select({
        ios: {
          bottom: tabBarHeight,
        },
        android: {
          bottom: tabBarHeight,
        },
      }),
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: tabBarHeight + 16,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FDFDFD',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    lessonControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#FDFDFD',
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#FDFDFD',
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
    },
    input: {
      flex: 1,
      marginHorizontal: 12,
      padding: 12,
      backgroundColor: '#FDFDFD',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#EEEEEE',
    },
    chatWindow: {
      position: 'absolute',
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
      bottom: tabBarHeight,
    },
    messageContainer: {
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 12,
      maxWidth: '80%',
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#FDFDFD',
      borderWidth: 1,
      borderColor: '#EEEEEE',
    },
    aiMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#FDFDFD',
    },
    leftControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
    },
    logo: {
        width: 44,
        height: 48,
      },
  });

  // Animation handlers
  const animateTransition = (newMode: AIAssistantState['mode']) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setState(prev => ({ ...prev, mode: newMode }));
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    });
  };

  const showChatWindow = () => {
    Animated.spring(chatWindowHeight, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const hideChatWindow = () => {
    Animated.spring(chatWindowHeight, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      setMessages([]);
      setState(prev => ({ ...prev, mode: isLessonScreen ? 'lesson-controls' : 'fab' }));
    });
  };

  // API handlers
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user' as const,
      content: inputText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    try {
      const response = await axios.post('url/api/v1/ai/ask-ai', {
        message: inputText,
        type: 'text',
      });

      const aiMessage = {
        type: 'ai' as const,
        content: response.data.text,
      };

      setMessages(prev => [...prev, aiMessage]);

      if (response.data.audioUrl) {
        playAudioResponse(response.data.audioUrl);
      }

      showChatWindow();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Audio handlers
  const handleTextToSpeech = async () => {
    try {
      if (state.isSpeaking) {
        await sound.current?.stopAsync();
        setState(prev => ({ ...prev, isSpeaking: false }));
        return;
      }

      setState(prev => ({ ...prev, isSpeaking: true }));
      const response = await axios.post('url/api/v1/ai/text-to-speech', {
        text: lessonContent,
      });

      sound.current = new Audio.Sound();
      await sound.current.loadAsync({ uri: response.data.audioUrl });
      await sound.current.playAsync();

      sound.current.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setState(prev => ({ ...prev, isSpeaking: false }));
        }
      });
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return;

      setState(prev => ({ ...prev, isRecording: true }));
      recording.current = new Audio.Recording();
      await recording.current.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.current.startAsync();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      setState(prev => ({ ...prev, isRecording: false }));

      if (uri) {
        const response = await axios.post('url/api/v1/ai/speech-to-text', {
          audio: uri,
        });

        const transcription = response.data.text;
        setMessages(prev => [...prev, { type: 'user', content: transcription }]);
        
        const aiResponse = await axios.post('url/api/v1/ai/ask-ai', {
          message: transcription,
          type: 'voice',
        });

        setMessages(prev => [...prev, { type: 'ai', content: aiResponse.data.text }]);
        showChatWindow();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playAudioResponse = async (audioUrl: string) => {
    try {
      const audioSound = new Audio.Sound();
      await audioSound.loadAsync({ uri: audioUrl });
      await audioSound.playAsync();
    } catch (error) {
      console.error('Error playing audio response:', error);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      sound.current?.unloadAsync();
      recording.current?.unloadAsync();
    };
  }, []);

  // Render methods based on state
  const renderFAB = () => (
    <Animated.View 
      style={[
        styles.fab,
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity
        onPress={() => animateTransition('input')}
      >
        <Image source={require('../../assets/images/brightmind-logo-blue-icon.png')} style={styles.logo} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLessonControls = () => (
    <Animated.View 
      style={[
        styles.lessonControls,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.leftControls}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTextToSpeech}>
          <Speaker color={state.isSpeaking ? '#0066CC' : '#000000'} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => animateTransition('input')}>
      <Image source={require('../../assets/images/brightmind-logo-blue-icon.png')} style={styles.logo} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderInput = () => (
    <Animated.View 
      style={[
        styles.inputContainer,
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity 
        onPress={() => animateTransition(isLessonScreen ? 'lesson-controls' : 'fab')}
      >
        <ArrowLeft />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="I have a question on..."
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={handleSendMessage}
      />
      <TouchableOpacity
        onPressIn={startRecording}
        onPressOut={stopRecording}
      >
        <Mic color={state.isRecording ? '#FF0000' : '#000000'} />
      </TouchableOpacity>
      {inputText.trim() && (
        <TouchableOpacity onPress={handleSendMessage}>
          <SendFilled />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderChatWindow = () => (
    <Animated.View 
      style={[
        styles.chatWindow,
        {
          transform: [{
            translateY: chatWindowHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [600, 0],
            }),
          }],
        },
      ]}
    >
      <View style={{ maxHeight: 400 }}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.type === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <Text>{message.content}</Text>
          </View>
        ))}
      </View>
      {renderInput()}
    </Animated.View>
  );

  // Main render
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {state.mode === 'fab' && renderFAB()}
      {state.mode === 'lesson-controls' && renderLessonControls()}
      {state.mode === 'input' && renderInput()}
      {messages.length > 0 && renderChatWindow()}
    </KeyboardAvoidingView>
  );
};

export default AIAssistantSystem;