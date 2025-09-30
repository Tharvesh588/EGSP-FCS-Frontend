import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 11.272V6.577a2 2 0 0 1 1.09-1.803l5-2.887a2 2 0 0 1 1.82 0l5 2.887A2 2 0 0 1 21 6.577v4.695" />
      <path d="M3 12.577a2 2 0 0 0-1.09 1.803l-1.388.8a2 2 0 0 0 0 3.606l1.388.8A2 2 0 0 0 3 20.392V12.577Z" />
      <path d="M12 22.577a2 2 0 0 1-1.09-1.803v-7.22a2 2 0 0 1 1.09-1.803l5-2.887a2 2 0 0 1 1.82 0l5 2.887A2 2 0 0 1 24 13.577v4.695a2 2 0 0 1-1.09 1.803l-5 2.887a2 2 0 0 1-1.82 0l-5-2.887A2 2 0 0 1 12 22.392v-7.22" />
    </svg>
  );
}
