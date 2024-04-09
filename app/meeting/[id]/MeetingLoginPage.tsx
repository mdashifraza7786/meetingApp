import Button from "@/components/Button";
import { ClerkLoaded, SignInButton } from "@clerk/nextjs";
import Link from "next/link";


export default function MeetingLoginPage() {

    return (
        <div className="mx-auto w-fit space-y-3">
            <h1 className="text-center text-2xl font-bold">Join meeting</h1>
            <ClerkLoaded>
                <SignInButton>
                    <Button className="w-44">Sign in</Button>
                </SignInButton>

                <Link href={`?guest=true`} >
                    <Button className="w-44 mt-4 bg-blue-400" >Join as guest</Button>
                </Link>
            </ClerkLoaded>
        </div>
    )
}