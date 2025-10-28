import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { url } from "../../app.config";

export default function NotificationList() {
  const [list, setList] = useState([]);

  const handleClose = (id) => {
    setList((prev) => prev.filter((n) => n.id !== id));
    axios
      .put(`${url}/notifications/notification/close`, { ids: [id] })
      .catch((err) => console.error(err));
  };

  const handleCloseAll = () => {
    setList([]);
    axios
      .put(`${url}/notifications/notification/close`)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    fetch(`${url}/notifications/repairNotification?userid=${userId}`)
      .then((res) => res.json())
      .then((data) => setList(data))
      .catch((err) => console.error(err));

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
            console.log("Received:", data);
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
        width: 300,
        maxHeight: "80vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        gap: "5px",
        zIndex: 1000,
      }}
    >
      {list.length > 10 && (
        <div
          style={{
            padding: 10,
            background: "#d32f2f",
            color: "#fff",
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "center",
          }}
          onClick={handleCloseAll}
        >
          Close All
        </div>
      )}

      {list.map((n) => (
        <div
          key={n.id}
          style={{
            padding: 10,
            background: "#1976d2",
            color: "#fff",
            borderRadius: 5,
            position: "relative",
          }}
        >
          <strong>Board: {n.boardSerialNumber}</strong>
          <div>Reworker: {n.reworkerName}</div>
          <div>End: {n.endDate}</div>
          <span
            onClick={() => handleClose(n.id)}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </span>
        </div>
      ))}
    </div>
  );
}
