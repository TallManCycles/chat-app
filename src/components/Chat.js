import {React, useState} from 'react'
import './Chat.css'
import { Configuration, OpenAIApi } from 'openai'

const Chat = () => {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    console.log(process.env.REACT_APP_OPENAI_API_KEY)

    const configuration = new Configuration({
        apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      });

    const openai = new OpenAIApi(configuration);

    const addMessage = (message) => {
        setMessages([...messages, message]);
    };

    const handleClearMessages = () => {
        setMessages([]);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsLoading(true)

        console.log("started event")

        const input = event.target.elements.message;
        const text = input.value;

        const options = event.target.elements.models;
        const model = options.value

        const tokens = event.target.elements.maxTokens;
        const maxTokens = tokens.value;

        try {
            const response = await openai.createCompletion({
                model: model,
                prompt: text,
                max_tokens: Number.parseInt(maxTokens),
                temperature: 0,
              })
    
            response.data.choices.forEach(message => {
                addMessage(message.text);
                });    
            
        } catch (error) {
            addMessage(error.message)
        }
        
        console.log("loading finished")

        setIsLoading(false)
        }

  return (
    <div className='chat-container'>
        {/* <h1 className=''>Chat App</h1> */}
        <div className='chat-messages'>
        {messages.map((message, index) => (
            <div key={index}> <p>{message}</p></div>
        ))}
        </div>
        <form className='chat-form' 
            onSubmit={handleSubmit}>
            <textarea rows={10} placeholder='enter text here' name='message'/>
            <button type="submit" disabled={isLoading}>Send</button>
            <button onClick={handleClearMessages} disabled={isLoading}>Clear Messages</button>
            <select name="models">
                <option value="text-davinci-003">text-davinci-003</option>
                <option value="text-curie-001">text-curie-001 faster and lower cost</option>
                <option value="text-babbage-001">text-babbage-001 very fast, and lower cost</option>
                <option value="text-ada-001">text-ada-001 fastest and lowest cost</option>
                <option value="code-davinci-002">code-davinci-002 code</option>
            </select>
            <input name='maxTokens' placeholder='max tokens'></input>
        </form>
    </div>
  )
}

export default Chat;