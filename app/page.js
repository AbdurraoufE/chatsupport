"use client" 
import Image from "next/image";
import { Box, Stack } from "@mui/material";
import { useState} from "react"

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi! I am your virtual support agent. How can I help you today?`
  }]);

  const [message, setMessage] = useState("") //what user types in the chat box

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        {/* for the messaging */}
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {
            // display out messages
            messages.map((message, index) => (
              <Box 
                key={index} 
                display="flex" 
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                {/* container for our text message */}
                <Box
                  bgcolor={
                    message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                  }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))
          }
        </Stack>
      </Stack>
    </Box>
  );
}
