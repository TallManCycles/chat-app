import React, { useState, useRef } from 'react';
import './Chat.css';
import { Configuration, OpenAIApi } from 'openai';
import Prism from 'prismjs';

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function TextCompletion(model, prompt, maxTokens) {
  return openai.createCompletion({
    model,
    prompt,
    max_tokens: Number.parseInt(maxTokens),
    temperature: 0,
  });
}

function ChatCompletion(model, message) {
  return openai.createChatCompletion({
    model,
    messages: [{ role: 'user', content: message }],
  });
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const messageInputRef = useRef(null);
  const sendButtonRef = useRef(null);

  function addMessage(message) {
    setMessages(messages => [...messages, message]);
  }

  function clearMessages() {
    setMessages([]);
    setIsLoading(false);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendButtonRef.current.click();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const input = event.target.elements.message;
    const message = input.value;

    const options = event.target.elements.models;
    const model = options.value;

    const tokens = event.target.elements.maxTokens;
    const maxTokens = tokens.value || 500;

    try {
      let response;
      if (model === 'gpt-3.5-turbo') {
        response = await ChatCompletion(model, message);
      } else {
        response = await TextCompletion(model, message, maxTokens);
      }

      if (!response) {
        console.log('response is invalid');
      } else {
        const messages = response.data.choices.map(choice => choice.text || choice.message.content);
        messages.forEach(addMessage);
        console.log(messages);
      }
    } catch (error) {
      console.log(error.message);
    }

    setIsLoading(false);
  }

  return (
    <div className='chat-container'>
      <div className='chat-messages'>
      {messages.map((message, index) => {
          if (message.startsWith("```") && message.endsWith("```")) {
            const code = message.slice(3, -3);
            return (
              <pre key={index} className="language-javascript">
                <code dangerouslySetInnerHTML={{ __html: Prism.highlight(code, Prism.languages.javascript, 'javascript') }} />
              </pre>
            );
          } else {
            return (
              <div key={index}>
                {message.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            );
          }
        })}
      
      </div>
      <form className='chat-form' onSubmit={handleSubmit}>
        <textarea className='chat-area' rows={2} placeholder='enter text here' name='message'
          onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('send-button').click();
          }
        }} />
        <button type='submit' id='send-button' disabled={isLoading}>
          Send
        </button>
        <button onClick={clearMessages} disabled={isLoading}>
          Clear Messages
        </button>
        <select name='models'>
          <option value='gpt-3.5-turbo'>gpt-3.5-turbo</option>
          <option value='text-davinci-003'>text-davinci-003</option>
          <option value='text-curie-001'>text-curie-001 faster and lower cost</option>
          <option value='text-babbage-001'>text-babbage-001 very fast, and lower cost</option>
          <option value='text-ada-001'>text-ada-001 fastest and lowest cost</option>
          <option value='code-davinci-002'>code-davinci-002 code</option>
        </select>
        <input name='maxTokens' placeholder='max tokens' />
      </form>
    </div>
  );
}

export default Chat;
