import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon, { IconType } from 'react-native-dynamic-vector-icons';
import CurvedHeaderLayout from '../../components/layouts/CurvedHeaderLayout';
import { IVOO_COLORS, IVOO_TYPOGRAPHY } from '../../styles';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ivitoo';
}

const IvitooChatScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '¡Hola! 👋 Soy Ivitoo, tu asistente inteligente de Creditivoo.', sender: 'ivitoo' },
    { id: '2', text: '¿En qué puedo ayudarte hoy?', sender: 'ivitoo' },
  ]);
  
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const sessionIdRef = useRef(`session_${Math.random().toString(36).substring(7)}`);  
  //const sessionIdRef = useRef(Math.random().toString(36).substring(7)); 
  //const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (inputText.trim() === '' || loading) return;

    // Tipado explícito para quitar las líneas rojas de VS Code
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('https://automatizac1on-n8n.ovf68d.easypanel.host/webhook/d7affed3-554f-4747-96e6-90fd560f1f33', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ 
          chatInput: userMsg.text,  // Revisa que en n8n el nodo espere "chatInput"
          sessionId: sessionIdRef.current 
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      
      // Tipado explícito también aquí
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.output || data.text || 'Ivitoo recibió tu mensaje.',
        sender: 'ivitoo',
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error n8n:', error);
      
      // ID único para evitar el error de "same key"
      const errorMsg: Message = { 
        id: `error-${Date.now()}`, 
        text: '❌ No se pudo conectar con el servidor.', 
        sender: 'ivitoo' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.ivitooMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'user' ? styles.userText : styles.ivitooText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <CurvedHeaderLayout
      title="Chat con Ivitoo"
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      scroll={false} // <--- CLAVE: Desactivamos el scroll del layout para evitar el error
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.container}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={IVOO_COLORS.primary} />
            <Text style={styles.loadingText}>Ivitoo está escribiendo...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje aquí..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Icon 
              name="send" 
              type={IconType.Ionicons} 
              size={24} 
              color={IVOO_COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </CurvedHeaderLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContent: { padding: 15, paddingBottom: 20 },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0add73',
    borderBottomRightRadius: 2,
  },
  ivitooMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 2,
  },
  messageText: { 
    fontSize: 14, 
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular 
  },
  userText: { color: '#fff' },
  ivitooText: { color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10, // Ajuste para notch
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
    fontFamily: IVOO_TYPOGRAPHY.fonts.interRegular,
    color: '#000'
  },
  sendButton: {
    backgroundColor: '#0add73',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#CCC' },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 20, 
    marginBottom: 10 
  },
  loadingText: { 
    fontSize: 12, 
    color: '#999', 
    marginLeft: 8, 
    fontStyle: 'italic' 
  }
});

export default IvitooChatScreen;