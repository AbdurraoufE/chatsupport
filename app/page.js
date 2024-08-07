"use client" 
import Image from "next/image";
import { Box } from "@mui/material";
import { useState} from "react"

export default function Home() {
  const [messages, setMessages] = useState({
    role: "assistant",
    content: `Hi! I am your virtual support agent. How can I help you today?`
  })

  const [message, setMessage] = useState("") //what user types in the chat box

  return <Box 
  width="100vw" 
  height="100vh" 
  display="flex" 
  flexDirection="column" 
  justifyContent="center" 
  alignItems="center"
  ></Box>
}
