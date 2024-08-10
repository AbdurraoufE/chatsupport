"use client";
import Image from "next/image";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I am your virtual support agent. How can I help you today?`,
    },
  ]);

  const [message, setMessage] = useState(""); // What user types in the chat box
  const [user, loading] = useAuthState(auth); // Returns array of current user
  const router = useRouter();
  const [userSession, setUserSession] = useState(null);

  // Only run on the client side
  useEffect(() => {
    const session = sessionStorage.getItem("user");
    setUserSession(session);
  }, []);

  // If there's no user signed up, get them to the signup page
  useEffect(() => {
    if (!loading && !user && !userSession) {
      router.push("/signup");
    }
  }, [loading, user, userSession, router]);

  const sendMessage = async () => {
    const userMessage = message;
    setMessage(""); // When you send a message, the textbox will automatically be empty

    // Add the user message
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    // Fetches the response from the server
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: userMessage }]), // Send another user message
      // We get the response from the server
    }).then(async (res) => {
      // Read it
      const reader = res.body.getReader();
      const decoder = new TextDecoder(); // Decode it because we encoded it in the backend

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((prevMessages) => {
          let lastMessage = prevMessages[prevMessages.length - 1]; // Last msg
          let otherMessages = prevMessages.slice(0, prevMessages.length - 1); // Gets all messages except the last one
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
      bgcolor="#1e1e1e"
      margin="0"
      padding="0"
      overflow="hidden"
    >
      {/* Logout button at the top */}
      <Box
        width="100%"
        display="flex"
        justifyContent="flex-end"
        p={2}
        position="absolute"
        top="0"
        zIndex={1}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            signOut(auth)
              .then(() => {
                console.log("Sign-out successful.");
                router.push("/signup"); // Redirect after sign out
              })
              .catch((error) => {
                console.error("Sign-out error:", error);
              });
          }}
          sx={{
            borderRadius: 20,
            bgcolor: '#d32f2f',
            '&:hover': { bgcolor: '#b71c1c' },
            px: 3,
            textTransform: 'capitalize'
          }}
        >
          Logout
        </Button>
      </Box>

      <Stack
        direction="column"
        width="100%"
        maxWidth="800px"
        height="100%"
        borderRadius={12}
        bgcolor="#2c2c2c"
        boxShadow="0 4px 8px rgba(0, 0, 0, 0.3)"
        p={2}
        spacing={2}
        overflow="hidden"
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
            '&::-webkit-scrollbar-track': { backgroundColor: '#2c2c2c' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: '4px' }
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
                  message.role === "assistant" ? "#333" : "#007bff"
                }
                color="white"
                borderRadius={8}
                p={2}
                maxWidth="80%"
                sx={{ wordBreak: 'break-word' }}
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
          borderTop="1px solid #444"
          bgcolor="#2c2c2c"
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
              bgcolor: "#333", 
              input: { color: 'white' }, 
              fieldset: { borderColor: '#444' } 
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{
              borderRadius: 20,
              bgcolor: '#007bff',
              '&:hover': { bgcolor: '#0056b3' },
              px: 3,
              textTransform: 'capitalize'
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
