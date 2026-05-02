import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { getAccessToken } from "../store/authStore";

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL}/hubs/orders`;
const ORDER_CREATED_EVENT = "orderCreated";

export interface OrderCreatedPayload {
  id: number;
  orderDate: string;
  dailyOrderNumber: number;
  customerFirstName: string;
  customerLastName: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

let sharedAudioCtx: AudioContext | null = null;

function playBeep(): void {
  try {
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContext();
    }
    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext may be blocked until first user gesture; silent fail.
  }
}

export function useOrderNotifications(): HubConnectionState {
  const queryClient = useQueryClient();
  const connectionRef = useRef<HubConnection | null>(null);
  const [state, setState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected,
  );

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => getAccessToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on(ORDER_CREATED_EVENT, () => {
      playBeep();
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    });

    connection.onreconnecting(() =>
      setState(HubConnectionState.Reconnecting),
    );
    connection.onreconnected(() => setState(HubConnectionState.Connected));
    connection.onclose(() => setState(HubConnectionState.Disconnected));

    connectionRef.current = connection;

    connection
      .start()
      .then(() => setState(HubConnectionState.Connected))
      .catch((err) => {
        console.warn("OrdersHub connect failed", err);
        setState(HubConnectionState.Disconnected);
      });

    return () => {
      void connection.stop();
      connectionRef.current = null;
    };
  }, [queryClient]);

  return state;
}
