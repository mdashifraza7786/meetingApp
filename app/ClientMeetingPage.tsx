"use client"

import { useUser } from "@clerk/nextjs";
import { Call, MemberRequest, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { getUserId } from "./actions";
import Button from "@/components/Button";
import Link from "next/link";


export default function CreateMeetingPage() {
    const [descInput, setDescInput] = useState("");
    const [startTimeInput, setStartTimeInput] = useState("");
    const [participantsInput, setParticipantsInput] = useState("");
    const [call, setCall] = useState<Call>();

    const client = useStreamVideoClient();
    const { user } = useUser();

    async function createMeeting() {
        if (!client || !user) {
            return;
        }

        try {
            const id = crypto.randomUUID();

            const callType = participantsInput ? "private-meeting" : "default";


            const call = client.call(callType, id);

            const membersEmails = participantsInput.split(",").map(email => email.trim());
            const membersIds = await getUserId(membersEmails);

            const members: MemberRequest[] = membersIds.map(id => ({ user_id: id, role: "call_member" })).concat({ user_id: user.id, role: "call_member" }).filter((v, i, a) => a.findIndex((v2) => v2.user_id === v.user_id) === i);

            const starts_at = new Date(startTimeInput || Date.now()).toISOString();

            await call.getOrCreate({
                data: {
                    starts_at,
                    members,
                    custom: { description: descInput }
                }
            });

            setCall(call);
        } catch (error) {
            console.log(error)
            alert("somthing went wrong");
        }
    }

    if (!client || !user) {
        return <Loader2 className="mx-auto animate-spin" />;
    }
    return (
        <div className="flex flex-col items-center space-y-6">
            <h1 className="text-center text-2xl font-bold">
                Welcome {user.username}
            </h1>
            <div className="w-80 mx-auto space-y-6 rounded-md bg-slate-100 p-5">
                <h2 className="text-xl font-bold">Create a new meeting</h2>
                <DescInput
                    value={descInput}
                    onChange={setDescInput} />

                <StartTimeInput
                    value={startTimeInput}
                    onChange={setStartTimeInput}
                />
                <ParticipantsInputs
                    value={participantsInput}
                    onChange={setParticipantsInput}
                />
                <Button onClick={createMeeting} className="w-full ">
                    Create Meeting
                </Button>
            </div>
            {call && <MeetingLink call={call} />}
        </div>
    )
}

interface DescriptionInputProps {
    value: string,
    onChange: (value: string) => void
}

function DescInput({ value, onChange }: DescriptionInputProps) {
    const [active, setActive] = useState(false);

    return (
        <div className="space-y-2">
            <div className="font-medium">Meeting info:</div>
            <label className="flex items-center gap-1.5">
                <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => {
                        setActive(e.target.checked)
                        onChange("");
                    }}
                />
                Add description
            </label>
            {active && (
                <label className="block space-y-1">
                    <span className="font-medium">Description:</span>
                    <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={500} className="w-full rounded-md border border-gray-300 p-2"></textarea>
                </label>
            )}
        </div>
    )

}

interface StartTimeInputProps {
    value: string,
    onChange: (value: string) => void,
}

function StartTimeInput({ value, onChange }: StartTimeInputProps) {

    const dateTimeLocal = new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60_000
    ).toISOString().slice(0, 16);
    const [active, setActive] = useState(false);


    return (
        <div className="space-y-2">
            <div className="font-medium">Meeting start:</div>
            <label className="flex items-center gap-1.5">
                <input type="radio" checked={!active} onChange={() => { setActive(false); onChange("") }} />
                Start Meeting Immediately
            </label>
            <label className="flex items-center gap-1.5">
                <input type="radio" checked={active} onChange={() => { setActive(true); onChange(dateTimeLocal) }} />
                Start meeting at date/time
            </label>
            {active && (
                <label>
                    <span className="font-medium ">Start time</span>
                    <input type="datetime-local" value={value} min={dateTimeLocal} onChange={(e) => { onChange(e.target.value) }} className="w-full rounded-md border border-gray-300 p-2" />
                </label>
            )}
        </div>
    )

}

interface ParticipantsProps {
    value: string,
    onChange: (value: string) => void
}

function ParticipantsInputs({ value, onChange }: ParticipantsProps) {
    const [active, setActive] = useState(false);

    return (
        <div className="space-y-2">
            <div className="font-medium">Participants:</div>
            <label className="flex items-center gap-1.5">
                <input type="radio" checked={!active} onChange={() => { setActive(false); onChange("") }} />
                Everyone with this link can join
            </label>
            <label className="flex items-center gap-1.5">
                <input type="radio" checked={active} onChange={() => { setActive(true); }} />
                Private meeting
            </label>
            {active && (
                <label className="block space-y-1">
                    <span className="font-medium"> Participant emails</span>
                    <textarea
                        value={value}
                        onChange={(e) => { onChange(e.target.value) }}
                        placeholder="Enter participant email address sepereated by commas"
                        className="w-full rounded-md border border-gray-300 p-2"
                    />
                </label>
            )}
        </div>
    )
}

interface MeetingLinkProps {
    call: Call;
}

function MeetingLink(call: MeetingLinkProps) {
    const meetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call.call.id}`;

    return (
        <div className="text-center flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
                <span>
                    Invitation Link: {" "}
                    <Link href={meetLink} className="font-medium">
                        {meetLink}
                    </Link>
                </span>
                <button title="Copy Invitation Link" onClick={()=>{
                    navigator.clipboard.writeText(meetLink)

                }}>
                    <Copy/>
                </button>
            </div>
            <a href={getMailToLink(
                meetLink,
                call.call.state.startedAt,
                call.call.state.custom.description
            )} target="_blank">
                Send email invitation
            </a>
        </div>
    )
}



function getMailToLink(
    meetingLink:string,
    startesAt?:Date,
    description?:string,

){
    const startDateFormatted = startesAt ? startesAt.toLocaleString("en-IN",{
        dateStyle:"full",
        timeStyle:"short"
    })
    : undefined

    const subject = "Join my meeting" + (startDateFormatted ? `at ${startDateFormatted}`:"")
    const body = `join my meeting at ${meetingLink}. ` + (startDateFormatted ? `\n\nThe meeting starts at ${startDateFormatted}.`:"") + (description ? `\n\nDescription: ${description}`:"");

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}