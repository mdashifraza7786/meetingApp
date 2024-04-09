import { Metadata } from "next";
import Meeting from "./Meeting";
import { currentUser } from "@clerk/nextjs";
import MeetingLoginPage from "./MeetingLoginPage";
import { useEffect } from "react";

interface PageProps{
    params:{id:string};
    searchParams:{guest:string}
}
export const metadata: Metadata = {
    title: `Meeting`
};

export default async function Page({params:{id},searchParams:{guest}}:PageProps) {
 
    metadata.title = `Meeting ${id}`;

    
    const user = await currentUser();

    const guestMode = guest === "true"; 

    if(!user && !guestMode){
        return <MeetingLoginPage/>
    }
    return (
        <Meeting id={id}/>
    )
}