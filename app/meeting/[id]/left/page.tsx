import Button from "@/components/Button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PageProps{
    params: {id:string}
}
export default function Page({params: {id}}:PageProps){
    return (
        <div className="flex flex-col items-center gap-3">
            <p className="font-bold">You left this meeting.</p>
            <Link href={`/meeting/${id}/`} className="px-3 py-1 bg-[#0c0c0c] text-white rounded-full">Rejoin</Link>
        </div>
    )
}