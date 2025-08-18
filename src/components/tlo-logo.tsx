import { cn } from "@/lib/utils";
import * as React from "react";

export const TloLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M88 32v40H48a8 8 0 0 0-8 8v136a8 8 0 0 0 8 8h160a8 8 0 0 0 8-8V80a8 8 0 0 0-8-8h-40V32a8 8 0 0 0-8-8H96a8 8 0 0 0-8 8Zm40 88a24 24 0 1 1-24 24 24 24 0 0 1 24-24Z"
      />
    </svg>
  );
