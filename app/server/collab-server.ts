import http from "http"
import { WebSocketServer } from "ws"
import * as Y from "yjs"
import { WebsocketProvider } from "y-websocket"

const server = http.createServer();
const wss = new WebSocketServer({ server });

// Store active documents and providers
const docs = new Map<string, Y.Doc>();
const providers = new Map<string, WebsocketProvider>();

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
  
  // Create a provider for this connection
  const provider = new WebsocketProvider(`ws://localhost:${PORT}`, docId, doc);
  providers.set(ws.toString(), provider);
  
  // Handle WebSocket messages using Yjs protocol
  ws.on("message", (message) => {
    try {
      // Yjs uses binary protocol, not JSON
      const update = new Uint8Array(message as ArrayBuffer);
      
      // Apply the update to the document
      Y.applyUpdate(doc, update);
      
      // Broadcast the update to all other connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(update);
        }
      });
      
    } catch (error) {
      console.error("Error handling Yjs update:", error);
    }
  });
  
  // Send initial document state to new client
  const initialUpdate = Y.encodeStateAsUpdate(doc);
  if (initialUpdate.length > 0) {
    ws.send(initialUpdate);
  }
  
  ws.on("close", () => {
    console.log("WebSocket connection closed");
    providers.delete(ws.toString());
  });
  
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    providers.delete(ws.toString());
  });
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`Collaboration server running on port ${PORT}`);
});