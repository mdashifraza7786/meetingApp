import { Metadata } from "next";
import Meeting from "./Meeting";
import { currentUser } from "@clerk/nextjs";
import MeetingLoginPage from "./MeetingLoginPage";

interface PageProps{
    params:{id:string};
    searchParams:{guest:string}
}
export function generateMetaData({params: {id}}:PageProps):Metadata{
    return {
        title : `meeting ${id}`
    }
}
export default async function Page({params:{id},searchParams:{guest}}:PageProps) {
    const user = await currentUser();

    const guestMode = guest === "true"; 

    if(!user && !guestMode){
        return <MeetingLoginPage/>
    }
    return (
        <Meeting id={id}/>
    )
}