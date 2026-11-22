import React, { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { useGenerateDailyTokenMutation } from "../redux/apiSlice";

/**
 * Props-driven Daily.co join UI (call-object mode).
 * Does not create rooms — only joins with roomName + meetLink + token.
 */
export default function JoinCall({
  roomName,
  meetLink,
  userName = "center",
  onExit,
  onInfo,
}) {
  const callRef = useRef(null);
  const localVideoRef = useRef(null);
  const [participants, setParticipants] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Preparing call...");
  const [generateDailyToken] = useGenerateDailyTokenMutation();

  const updateParticipants = () => {
    if (!callRef.current) return;
    setParticipants({ ...callRef.current.participants() });
  };

  const getToken = async () => {
    const data = await generateDailyToken({ roomName, userName }).unwrap();
    return data?.token ?? null;
  };

  const leaveCall = async () => {
    if (callRef.current) {
      try {
        await callRef.current.leave();
      } catch {
        /* ignore */
      }
      try {
        callRef.current.destroy();
      } catch {
        /* ignore */
      }
      callRef.current = null;
    }
    setIsJoined(false);
    onExit?.();
  };

  const toggleMute = async () => {
    if (!callRef.current) return;
    const next = !isMuted;
    await callRef.current.setLocalAudio(!next);
    setIsMuted(next);
  };

  useEffect(() => {
    if (!meetLink || !roomName) {
      setStatusMessage("Please wait. consultation has not started yet.");
      return undefined;
    }

    let cancelled = false;

    const joinCall = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token received");
        if (cancelled) return;

        if (callRef.current) {
          await callRef.current.leave();
          callRef.current.destroy();
          callRef.current = null;
        }

        const call = DailyIframe.createCallObject({
          subscribeToTracksAutomatically: true,
        });
        callRef.current = call;

        call.on("joined-meeting", () => {
          setIsJoined(true);
          setStatusMessage("You joined the call.");
          updateParticipants();
          const local = call.participants().local;
          if (local?.tracks?.video?.track && localVideoRef.current) {
            localVideoRef.current.srcObject = new MediaStream([
              local.tracks.video.track,
            ]);
          }
        });

        call.on("participant-joined", updateParticipants);
        call.on("participant-updated", updateParticipants);
        call.on("participant-left", updateParticipants);

        call.on("left-meeting", () => {
          setIsJoined(false);
          setParticipants({});
          onExit?.();
        });

        call.on("error", (e) => {
          const msg = (e?.errorMsg || "").toLowerCase();
          if (msg.includes("expired")) {
            onInfo?.("This consultation room has expired.");
          } else if (msg.includes("not found")) {
            onInfo?.("This consultation room does not exist anymore.");
          } else {
            onInfo?.(e?.errorMsg || "Unknown error");
          }
          setStatusMessage("Failed to join call.");
          onExit?.();
        });

        await call.join({ url: meetLink, token });
        await call.startCamera();
      } catch {
        if (!cancelled) setStatusMessage("Failed to join call.");
      }
    };

    joinCall();

    return () => {
      cancelled = true;
      if (callRef.current) {
        callRef.current.leave();
        callRef.current.destroy();
        callRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, meetLink]);

  if (!meetLink || !roomName) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <p className="text-slate-600 text-center">
          Please wait. consultation has not started yet.
        </p>
      </div>
    );
  }

  const remotes = Object.values(participants).filter((p) => !p.local);

  return (
    <div className="min-h-[70vh] bg-slate-900 text-white p-4 flex flex-col gap-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative rounded-xl overflow-hidden bg-slate-800 min-h-[240px]">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
            You {isMuted ? "(Muted)" : ""}
          </div>
        </div>

        {remotes.map((p) => {
          const videoTrack = p.tracks?.video?.track;
          const audioTrack = p.tracks?.audio?.track;
          return (
            <div
              key={p.session_id}
              className="relative rounded-xl overflow-hidden bg-slate-800 min-h-[240px]"
            >
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                ref={(el) => {
                  if (videoTrack && el) {
                    el.srcObject = new MediaStream([videoTrack]);
                  }
                }}
              />
              <audio
                autoPlay
                playsInline
                ref={(el) => {
                  if (audioTrack && el) {
                    el.srcObject = new MediaStream([audioTrack]);
                  }
                }}
              />
              {p.tracks?.audio?.state === "off" && (
                <span className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
                  Muted
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 py-3">
        {isJoined ? (
          <>
            <button
              type="button"
              onClick={toggleMute}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={leaveCall}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
            >
              End Call
            </button>
          </>
        ) : (
          <p className="text-slate-300">{statusMessage}</p>
        )}
      </div>
    </div>
  );
}
