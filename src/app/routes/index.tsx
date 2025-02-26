import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { Particles } from "@/components/magicui/particles";

export const Route = createFileRoute("/")({
  component: Home,
});

const text = [
  {
    title: "AFTER APP",
    description:
      "A modern fullstack framework built with React, TanStack Router, and Node.js",
    link: "https://reactafterdocs.vercel.app/docs/after-app/installation",
  },
];

export default function Home() {
  const { theme } = useTheme();
  const [color, setColor] = useState("#fff");

  useEffect(() => {
    setColor(theme === "dark" ? "#fff" : "#000");
  }, [theme]);

  return (
    <div className="w-full h-full flex items-center justify-center text-center">
      {text.map((item) => (
        <div className="flex flex-col gap-2 p-2">
          <div className="flex text-center items-center space-x-8 justify-center">
            <h1 className="text-6xl font-bold italic">{item.title}</h1>
          </div>
          <p>{item.description}</p>
          <Button
            onClick={() => window.open(item.link, "_blank")}
            variant={"outline"}
            className="hover:cursor-pointer"
          >
            Get Started
          </Button>
        </div>
      ))}
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
    </div>
  );
}
