import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import { url } from "../../app.config";

export default function NotificationList({ userId, setNotificationCount }) {
  const [list, setList] = useState([]);
  const stompClientRef = useRef(null);
  const [repairList, setRepairList] = useState([]);
  const [deliveryList, setDeliveryList] = useState([]);


  // const handleClose = (id) => {
  //   setList((prev) => prev.filter((n) => n.id !== id));
  //   axios.put(`${url}/notifications/notification/close`, { ids: [id] }).catch(console.error);
  // };

  // const handleCloseAll = () => {
  //   setList([]);
  //   axios.put(`${url}/notifications/notification/close`).catch(console.error);
  // };

  const handleClose = (value, type) => {
  setList(prev =>
    prev.filter(n =>
      type === "DELIVERY"
        ? n.ticketNo !== value
        : n.boardSerialNumber !== value
    )
  );

  if (type === "DELIVERY") {
    axios.put(`${url}/notifications/Deliver/notification/close`, {
      ticketNos: [value],
    }).catch(console.error);
  }

  if (type === "REPAIR") {
    axios.put(`${url}/notifications/Repair/notification/close`, {
      boardSerialNumbers: [value],
    }).catch(console.error);
  }
};


  const handleCloseAll = () => {
  const ticketNos = list
    .filter(n => n.type === "DELIVERY")
    .map(n => n.ticketNo);

  const boardSerialNumbers = list
    .filter(n => n.type === "REPAIR")
    .map(n => n.boardSerialNumber);

  if (ticketNos.length) {
    axios.put(`${url}/notifications/Deliver/notification/close`, {
      ticketNos,
    });
  }

  if (boardSerialNumbers.length) {
    axios.put(`${url}/notifications/Repair/notification/close`, {
      boardSerialNumbers,
    });
  }

  setList([]);
};


  // ✅ SEND COUNT TO HEADER
  useEffect(() => {
    if (typeof setNotificationCount === "function") {
      setNotificationCount(list.length);
    }
  }, [list, setNotificationCount]);

  console.log("WS userId:", userId);
  useEffect(() => {
    // 🔥 LOGOUT CASE
    if (!userId) {
      setList([]);

      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      return;
    }


    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    // REST API
    Promise.all([
      fetch(`${url}/notifications/repairNotification?userid=${userId}`).then(res => res.json()),
      fetch(`${url}/notifications/RequesterNotification?userid=${userId}`).then(res => res.json())
    ])
      .then(([repairData, requesterData]) => {
        const mappedRepairData = repairData.map(item => ({
          id: item.id,
          boardSerialNumber: item.boardSerialNumber || "",
          reworkerName: item.reworkerName || "",
          endDate: item.endDate || "",
          type: "REPAIR"
        }));

        const mappedRequesterData = requesterData.map(item => ({
          id: item.id,
          ticketNo: item.ticketNo || "",
          deliveredBy: item.deliveredBy || "",
          deliveryOn: item.deliveryOn || "",
          type: "DELIVERY"
        }));

        setList([...mappedRepairData, ...mappedRequesterData]);
      })
      .catch(console.error);

    // WEBSOCKET
    stompClientRef.current = new Client({
      webSocketFactory: () => new SockJS(`${url}/ws`),
      connectHeaders: { userId },
      // reconnectDelay: 5000,

      onConnect: () => {
        stompClientRef.current.subscribe("/user/queue/notifications", msg => {
          setList(prev => [JSON.parse(msg.body), ...prev]);
        });
        stompClientRef.current.subscribe(
          "/user/queue/delivery",
          msg => setList(prev => [JSON.parse(msg.body), ...prev])
        );

      }
    });

    stompClientRef.current.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [userId]); 


  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 320,
        maxHeight: "39vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        gap: "10px",
        zIndex: 1000,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      {list.length > 5 && (
        <div
          onClick={handleCloseAll}
          style={{
            padding: 3,
            background: "#fa2222",
            color: "#fff",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: '13px'
          }}
        >
          Close All
        </div>
      )}

      {list.map((n) =>
        n.type === "DELIVERY" ? (
          /* ✅ DELIVERY TEMPLATE (ONLY ADDITION) */
          <div
            key={n.ticketNo }
            style={{
              padding: 12,
              background: "#2e7d32",
              color: "#fff",
              borderRadius: 12,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <strong style={{ fontSize: 14 }}>Ticket: {n.ticketNo}</strong>
            <span style={{ fontSize: 13 }}>Delivered By: {n.deliveredBy}</span>
            <span style={{ fontSize: 12, color: "#eee" }}>Delivered On: {n.deliveryOn}</span>
            <span
             onClick={() => handleClose(n.ticketNo, "DELIVERY")}
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
        ) : (
          /* ✅ EXISTING TEMPLATE (UNCHANGED) */
          <div
            key={n.boardSerialNumber}
            style={{
              padding: 12,
              background: "#1976d2",
              color: "#fff",
              borderRadius: 12,
              boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <strong style={{ fontSize: 14 }}>Board: {n.boardSerialNumber}</strong>
            <span style={{ fontSize: 13 }}>Reworker: {n.reworkerName}</span>
            <span style={{ fontSize: 12, color: "#eee" }}>End: {n.endDate}</span>
            <span
              onClick={() => handleClose(n.boardSerialNumber, "REPAIR")}
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
        )
      )}
    </div>
  );
}
