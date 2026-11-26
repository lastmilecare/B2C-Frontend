import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import JoinCall from "../components/JoinCall";
import { healthAlerts } from "../utils/healthSwal";

/**
 * Thin wrapper: reads room_name + meet_link from query, joins as center staff.
 */
export default function OhcJoinCallPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const roomName = params.get("room_name") || "";
  const meetLink = params.get("meet_link") || "";

  const onExit = () => {
    navigate("/ohc-prescription-form", { state: { goToList: true } });
  };

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-sky-800">Tele Consultation</h1>
        <button
          type="button"
          onClick={onExit}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Back to list
        </button>
      </div>
      <JoinCall
        roomName={roomName}
        meetLink={meetLink}
        userName="center"
        onExit={onExit}
        onInfo={(message) => healthAlerts.warning(message)}
      />
    </div>
  );
}
