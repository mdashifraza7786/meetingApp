import { cn } from "@/lib/utils";

export default function Button({
    className,
    ...props
}:React.ButtonHTMLAttributes<HTMLButtonElement>){
    return (
        <button 
        className={cn("flex items-center justify-center gap-2 rounded-full bg-[#0C0C0C] px-3 py-2 font-semibold text-white transition-color hover:bg-[#040404] active:bg-[#040404] disabled:bg-[#151515]",className)}
        {...props}
        />
        
    )
}