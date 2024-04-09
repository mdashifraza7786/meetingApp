import { useUser } from "@clerk/nextjs";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export default function useLoadRecording(call: Call) {
    const { user } = useUser();

    const [recording, setRecording] = useState<CallRecording[]>([]);
    const [recordingLoading, setRecordingLoading] = useState(true);


    useEffect(() => {
        async function loadRecordings() {
            setRecordingLoading(true);

            if (!user?.id) return;

            const { recordings } = await call.queryRecordings();
            setRecording(recording);
            setRecordingLoading(false);

        }
        loadRecordings();

    }, [call, user?.id]);

    return { recording, recordingLoading };
}