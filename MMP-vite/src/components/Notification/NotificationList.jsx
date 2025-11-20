import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { url } from "../../app.config";

export default function NotificationList({ userId }) {
  const [list, setList] = useState([]);

  const handleClose = (id) => {
    setList((prev) => prev.filter((n) => n.id !== id));
    axios.put(`${url}/notifications/notification/close`, { ids: [id] }).catch(console.error);
  };

  const handleCloseAll = () => {
    setList([]);
    axios.put(`${url}/notifications/notification/close`).catch(console.error);
  };

  useEffect(() => {
    // const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    fetch(`${url}/notifications/repairNotification?userid=${userId}`)
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch(console.error);

    const stompClient = new Client({
      brokerURL: null,
      webSocketFactory: () => new SockJS(`${url}/ws`),
      connectHeaders: { userId },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected as user:", userId);

        stompClient.subscribe(`/user/queue/notifications`, (msg) => {
          try {
            const data = JSON.parse(msg.body);
            setList((prev) => [data, ...prev]);
          } catch (err) {
            console.error(err);
          }
        });
      },
      reconnectDelay: 5000,
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 320,
        maxHeight: "80vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        zIndex: 1000,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {list.length > 10 && (
        <div
          onClick={handleCloseAll}
          style={{
            padding: 12,
            background: "#d32f2f",
            color: "#fff",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "center",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
        >
          Close All
        </div>
      )}

      {list.map((n) => (
        <div
          key={n.id}
          style={{
            padding: 12,
            background: "#1976d2",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.5s",
          }}
        >
          <strong style={{ fontSize: 14 }}>Board: {n.boardSerialNumber}</strong>
          <span style={{ fontSize: 13 }}>Reworker: {n.reworkerName}</span>
          <span style={{ fontSize: 12, color: "#eee" }}>End: {n.endDate}</span>
          <span
            onClick={() => handleClose(n.id)}
            style={{
              position: "absolute",
              top: 6,
              right: 8,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            ✕
          </span>
        </div>
      ))}

      {/* Fade-in animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </div>
  );
}
