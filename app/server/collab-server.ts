import http from "http"
import { WebSocketServer } from "ws"
import * as Y from "yjs"

const server = http.createServer();
const wss = new WebSocketServer({ server });

// Store active documents
const docs = new Map<string, Y.Doc>();

wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection");
  
  // Extract document ID from URL
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const docId = url.searchParams.get("docId") || "default";
  
  // Get or create document
  let doc = docs.get(docId);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(docId, doc);
  }
  
  // Handle WebSocket messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Handle Yjs protocol messages here
      console.log("Received message:", data);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });
  
  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
  
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});