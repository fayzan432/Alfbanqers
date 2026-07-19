"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getToken, WS_URL } from "@/lib/apiClient";
import { blobToBase64, computeRms, pickRecorderMimeType } from "@/lib/audio";
import { useAppStore } from "@/store/useAppStore";

const WAKE_CHECK_INTERVAL_MS = 1800;
const WAKE_CHUNK_DURATION_MS = 1600;
const SILENCE_RMS_THRESHOLD = 0.02;
const SILENCE_TIMEOUT_MS = 1200;
const MAX_UTTERANCE_MS = 12000;

export function useJarvisVoice() {
  const setOrbState = useAppStore((s) => s.setOrbState);
  const setAmplitude = useAppStore((s) => s.setAmplitude);
  const setCurrentConversationId = useAppStore((s) => s.setCurrentConversationId);
  const currentConversationId = useAppStore((s) => s.currentConversationId);
  const setPendingConfirmation = useAppStore((s) => s.setPendingConfirmation);

  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const wakeLoopRef = useRef<number | null>(null);
  const modeRef = useRef<"idle" | "wake-chunk" | "utterance">("idle");
  const silenceStartRef = useRef<number | null>(null);
  const speechDetectedRef = useRef(false);
  const utteranceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const conversationIdRef = useRef<string | null>(currentConversationId);

  useEffect(() => {
    conversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // --- WebSocket lifecycle ---
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/api/voice/ws?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "wake_result") {
        if (data.detected) {
          startUtteranceRecording();
        }
      } else if (data.type === "transcript") {
        setTranscript(data.text);
      } else if (data.type === "assistant_message") {
        setLastReply(data.text);
        conversationIdRef.current = data.conversation_id;
        setCurrentConversationId(data.conversation_id);
        if (data.pending_confirmation_token) {
          setPendingConfirmation({ token: data.pending_confirmation_token, text: data.text });
        }
        setOrbState("thinking");
      } else if (data.type === "tts_audio") {
        playTtsAudio(data.audio_base64, data.mime);
      } else if (data.type === "error") {
        // eslint-disable-next-line no-console
        console.error("Voice error:", data.message);
        setOrbState("idle");
      }
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Microphone setup ---
  const ensureMic = useCallback(async () => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const node = audioCtx.createAnalyser();
    node.fftSize = 1024;
    source.connect(node);
    analyserRef.current = node;
    setAnalyser(node);

    return stream;
  }, []);

  const stopUtteranceRecording = useCallback(() => {
    if (utteranceTimeoutRef.current) clearTimeout(utteranceTimeoutRef.current);
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  // --- Amplitude feed loop (drives the orb while listening) ---
  const startAmplitudeLoop = useCallback(() => {
    const dataArray = new Uint8Array(analyserRef.current?.fftSize ?? 1024);

    const tick = () => {
      const node = analyserRef.current;
      if (node) {
        node.getByteTimeDomainData(dataArray);
        const rms = computeRms(dataArray);
        setAmplitude(Math.min(1, rms * 4));

        if (modeRef.current === "utterance") {
          if (rms > SILENCE_RMS_THRESHOLD) {
            speechDetectedRef.current = true;
            silenceStartRef.current = null;
          } else if (speechDetectedRef.current) {
            if (silenceStartRef.current === null) silenceStartRef.current = performance.now();
            else if (performance.now() - silenceStartRef.current > SILENCE_TIMEOUT_MS) {
              stopUtteranceRecording();
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [setAmplitude, stopUtteranceRecording]);

  useEffect(() => {
    startAmplitudeLoop();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startAmplitudeLoop]);

  // --- Wake-word rolling check loop ---
  const runWakeCheckCycle = useCallback(async () => {
    if (modeRef.current !== "idle" || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const stream = await ensureMic();
    modeRef.current = "wake-chunk";

    const mimeType = pickRecorderMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      modeRef.current = "idle";
      if (modeRef.current === ("utterance" as typeof modeRef.current)) return; // superseded by wake detection
      const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
      const base64 = await blobToBase64(blob);
      wsRef.current?.send(JSON.stringify({ type: "wake_check", audio_base64: base64, format: "webm" }));
    };
    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, WAKE_CHUNK_DURATION_MS);
  }, [ensureMic]);

  useEffect(() => {
    if (!wakeWordEnabled) {
      if (wakeLoopRef.current) window.clearInterval(wakeLoopRef.current);
      return;
    }
    wakeLoopRef.current = window.setInterval(runWakeCheckCycle, WAKE_CHECK_INTERVAL_MS);
    return () => {
      if (wakeLoopRef.current) window.clearInterval(wakeLoopRef.current);
    };
  }, [wakeWordEnabled, runWakeCheckCycle]);

  // --- Utterance recording (either wake-triggered or push-to-talk) ---
  const startUtteranceRecording = useCallback(async () => {
    if (modeRef.current === "utterance") return;
    const stream = await ensureMic();
    modeRef.current = "utterance";
    speechDetectedRef.current = false;
    silenceStartRef.current = null;
    setOrbState("listening");
    setTranscript("");

    const mimeType = pickRecorderMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = async () => {
      modeRef.current = "idle";
      setOrbState("thinking");
      const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
      const base64 = await blobToBase64(blob);
      wsRef.current?.send(
        JSON.stringify({
          type: "utterance",
          conversation_id: conversationIdRef.current,
          audio_base64: base64,
          format: "webm",
        })
      );
    };
    recorderRef.current = recorder;
    recorder.start();

    utteranceTimeoutRef.current = setTimeout(() => stopUtteranceRecording(), MAX_UTTERANCE_MS);
  }, [ensureMic, setOrbState, stopUtteranceRecording]);

  // --- TTS playback (drives orb "speaking" state + amplitude) ---
  const playTtsAudio = useCallback(
    (audioBase64: string, mime: string) => {
      setOrbState("speaking");
      const audio = new Audio(`data:${mime};base64,${audioBase64}`);

      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const node = ctx.createAnalyser();
      node.fftSize = 512;
      source.connect(node);
      node.connect(ctx.destination);

      const dataArray = new Uint8Array(node.fftSize);
      let raf: number;
      const pump = () => {
        node.getByteTimeDomainData(dataArray);
        setAmplitude(Math.min(1, computeRms(dataArray) * 5));
        raf = requestAnimationFrame(pump);
      };
      pump();

      audio.onended = () => {
        cancelAnimationFrame(raf);
        setAmplitude(0);
        setOrbState("idle");
      };
      audio.play().catch(() => {
        cancelAnimationFrame(raf);
        setOrbState("idle");
      });
    },
    [setOrbState, setAmplitude]
  );

  const sendText = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      setOrbState("thinking");
      wsRef.current.send(JSON.stringify({ type: "text", conversation_id: conversationIdRef.current, text }));
    },
    [setOrbState]
  );

  return {
    connected,
    wakeWordEnabled,
    setWakeWordEnabled,
    transcript,
    lastReply,
    analyser,
    startPushToTalk: startUtteranceRecording,
    stopPushToTalk: stopUtteranceRecording,
    sendText,
  };
}
