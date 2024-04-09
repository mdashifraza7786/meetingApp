"use client"

import Button from "@/components/Button";
import CallLayout from "@/components/CallLayout";
import PermissionPrompt from "@/components/PermissionPrompt";
import RecordingsLists from "@/components/RecordingsLists";
import VolumeIndicator from "@/components/VolumeIndicator";
import useLoadCall from "@/hooks/useLoadCall";
import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs";
import { Call, CallControls, CallingState, DeviceSettings, SpeakerLayout, StreamCall, StreamTheme, VideoPreview, useCall, useCallStateHooks, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MeetingPageProps {
    id: string
}

export default function Meeting({ id }: MeetingPageProps) {

    const { user, isLoaded: userLoaded } = useUser();

    const { call, callLoading } = useLoadCall(id);

    const client = useStreamVideoClient();

    if (!userLoaded || callLoading) {
        return <Loader2 className="mx-auto animate-spin" />
    }

    if (!call) {
        return (
            <p className="text-center font-bold">Call Not Found</p>
        )
    }

    const notAllowed = call.type === "private-type" && (!user || !call.state.members.find(m => m.user_id === user.id))
    if (notAllowed) {
        return (
            <p className="text-center font-bold">
                You are not allowed to join
            </p>
        )
    }
    return (
        <StreamCall call={call}>
            <StreamTheme>
                {/* <SpeakerLayout/>
                <CallControls/> */}
                <MeetingScreen />
            </StreamTheme>
        </StreamCall>
    )
}

function MeetingScreen() {
    const call = useStreamCall();
    const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
    const callEndedAt = useCallEndedAt();
    const callStartsAt = useCallStartsAt();

    const [setupcompletes, setSetupcompletes] = useState(false);

    async function handleSetupComplete() {
        call.join();
        setSetupcompletes(true);
    }
    const callIsInFuture = callStartsAt && new Date(callStartsAt) > new Date();
    const CallHasEnded = !!callEndedAt;

    if (CallHasEnded) {
        return <MeetingEndedScreen />
    }
    if (callIsInFuture) {
        return <UpcomingMeetingScreen />

    }

    const desc = call.state.custom.description;
    return (
        <div className="space-y-6">
            {desc && (
                <p className="text-center">
                    Meeting description: <span className="font-bold">{desc}</span>

                </p>
            )}

            {setupcompletes ? (
                <CallUI />
            ) : (
                <SetupUI onSetupComplete={handleSetupComplete} />
            )}
        </div>
    )
}

interface setupUIProps {
    onSetupComplete: () => void;

}

function SetupUI({ onSetupComplete }: setupUIProps) {
    const call = useStreamCall();
    const { useMicrophoneState, useCameraState } = useCallStateHooks();
    const micState = useMicrophoneState();
    const cameraState = useCameraState();

    const [micCamDisabled, setMicCamDisabled] = useState(false);

    useEffect(() => {
        if (micCamDisabled) {
            call.camera.disable();
            call.microphone.disable();

        } else {
            call.camera.enable();
            call.microphone.enable();
        }
    }, [micCamDisabled, call])

    if (!micState.hasBrowserPermission || !cameraState.hasBrowserPermission) {
        return <PermissionPrompt />
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <h1 className="text-center text-2xl font-bold">Setup</h1>
            <VideoPreview />
            <div className="flex h-16 items-center gap-3">
                <VolumeIndicator />
                <DeviceSettings />
            </div>
            <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" checked={micCamDisabled} onChange={(e) => { setMicCamDisabled(e.target.checked) }} />
                Join with mic and camera off
            </label>
            <Button onClick={onSetupComplete}>
                Join Meeting
            </Button>
        </div>
    )
}

function CallUI() {
    const { useCallCallingState } = useCallStateHooks();
    const callingstate = useCallCallingState();

    if (callingstate !== CallingState.JOINED) {
        return <Loader2 className="mx-auto animate-spin" />
    }

    return <CallLayout />
}

function UpcomingMeetingScreen() {
    const call = useStreamCall();
    return (
        <div className="flex flex-col items-center gap-6">
            <p>This Meeting has not started yet. It will start at {" "}
                <span className="font-bold">
                    {call.state.startsAt?.toLocaleString()}
                </span>
            </p>
            {call.state.custom.description && (
                <p>Description: {" "}
                    <span className="font-bold">
                        {call.state.custom.description}
                    </span>
                </p>
            )}
            <Link href="/">Go back home</Link>
        </div>
    )
}

function MeetingEndedScreen() {
    return (
        <div className="flex flex-col items-center gap-6">
            <p className="font-bold">
                This Meeting has been ended
            </p>
            <Link href={"/"}>Go to Home</Link>
            <div className="space-y-3">
                <h2 className="text-center text-xl font-bold">
                    Recordings
                </h2>
                <RecordingsLists />
            </div>
        </div>
    )
}