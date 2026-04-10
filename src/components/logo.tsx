import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import { ChefHat } from "lucide-react";

const Logo = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <ChefHat 
    className={cn("w-10 h-10 drop-shadow-md text-primary transition-transform duration-500 hover:scale-105", className)} 
    {...props} 
  />
);

export default Logo;
