"use client"

import useStreamCall from "@/hooks/useStreamCall";
import { useUser } from "@clerk/nextjs"
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyMeetingsPage(){
    const {user} = useUser();
    const client = useStreamVideoClient();
    const [calls,setCalls] = useState<Call[]>();

    useEffect(()=>{
        async function loadCalls(){
            if(!client || !user?.id){
                return;
            }
    
            const {calls} = await client.queryCalls({
                sort:[{field:"starts_at",direction:-1}],
                filter_conditions:{
                    starts_at: {$exists:true},
                    $or:[
                        {created_by_user_id:user.id},
                        {members: {$in:[user.id] } },

                    ]
                }
            });
            setCalls(calls);
        }
        loadCalls();
    },[client,user?.id]);

    return (
        <div className="space-y-3">
            <h1 className="text-center text-2xl font-bold">My Meetings</h1>
            {!calls && <Loader2 className="mx-auto animate-spin"/>}
            {calls?.length === 0 && <p>No meetings found</p>}

            <ul className="list-inside list-disc space-y-2">
                {calls?.map(call=>  <MeetingsLists key={call.id} call={call}/>)}
            </ul>
        </div>
    )
}

interface MeetingsProps{
    call:Call;
}
function MeetingsLists({call}:MeetingsProps){
    const meetingLink = `/meeting/${call.id}`

    const inFuture =  call.state.startsAt && new Date(call.state.startsAt) > new Date();
    
    const hasEnded = !!call.state.endedAt;

    return  (
        <li>
            <Link href={meetingLink} className="hover:underline">
                {call.state.startsAt?.toLocaleString()}
                {inFuture && " (Upcomming)"}
                {hasEnded && "(Ended)"}
            </Link>
            <p className="ml-6 text-gray-500">{call.state.custom.description}</p>
        </li>
    )
}