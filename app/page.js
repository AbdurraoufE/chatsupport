"use client";
import Image from "next/image";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I am your virtual support agent. How can I help you today?`,
    },
  ]);

  const [message, setMessage] = useState(""); //what user types in the chat box

  const sendMessage = async () => {
    const userMessage = message;
    setMessage(""); // when you send a message, the textbox will automatically be empty

    // Add the user message
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    //fetches the response from the server
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: userMessage }]), //send another user message
      // we get the response from the server
    }).then(async (res) => {
      //read it
      const reader = res.body.getReader();
      const decoder = new TextDecoder(); //decode it because we encoded it in the backend

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result; //
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((prevMessages) => {
          let lastMessage = prevMessages[prevMessages.length - 1]; //last msg
          let otherMessages = prevMessages.slice(0, prevMessages.length - 1); //gets all messages except the last one
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={dark}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="#1e1e1e" // Dark background color
      margin="0" // Remove default margins
      padding="0" // Remove default paddings
      overflow="hidden" // Prevent scrolling outside the chatbox
    >
      <Stack
        direction="column"
        width="100%"
        maxWidth="800px" // Wider chat container
        height="100%" // Full height of the viewport
        borderRadius={12} // Slightly rounded corners for the container
        bgcolor="#2c2c2c" // Darker background for the chat area
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.3)" // Subtle shadow for depth
        p={2}
        spacing={2}
        overflow="hidden" // Prevent overflow inside the chat container
      >
        {/* Messaging section */}
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          p={2}
          sx={{ 
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { backgroundColor: '#2c2c2c' }, // Match scrollbar track with the background
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: '4px' } // Darker thumb color blending with the background
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant" ? "#333" : "#007bff" // Dark gray for assistant, blue for user
                }
                color="white"
                borderRadius={8} // Slightly rounded corners
                p={2}
                maxWidth="80%" // Adjusted width for chat bubbles
                sx={{ wordBreak: 'break-word' }} // Prevent overflow of long words
              >
                <ReactMarkdown components={components}>
                  {message.content}
                </ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
  
        {/* Text field and button */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          p={1}
          borderTop="1px solid #444" // Darker border color
          bgcolor="#2c2c2c" // Matching background color with the chat container
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 20,
              bgcolor: "#333", // Dark background for the text field
              input: { color: 'white' }, // White text color
              fieldset: { borderColor: '#444' } // Darker border for the text field
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{ 
              borderRadius: 20,
              bgcolor: '#007bff', // Blue background for the button
              '&:hover': { bgcolor: '#0056b3' }, // Darker blue on hover
              px: 3, // Extra padding for a better button appearance
              textTransform: 'capitalize' // Ensure the text is properly capitalized
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
