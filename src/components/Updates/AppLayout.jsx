import React, { memo, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

const SIDEBAR_WIDTH = 260;


const sidebarTransition = { duration: 0.4, ease: "circOut" };

function useIsLg() {
  const [isLg, setIsLg] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isLg;
}

const MainContent = memo(function MainContent({ children }) {
  return <div className="p-6 overflow-auto flex-1">{children}</div>;
});

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isLg = useIsLg();

  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((open) => !open),
    [],
  );
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const pushMain = isSidebarOpen && isLg;

  return (
    <div className="relative flex h-screen bg-[#f3f6fb] overflow-hidden">
      <AppSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        width={SIDEBAR_WIDTH}
        transition={sidebarTransition}
      />

      <motion.div
        className="flex min-w-0 flex-1 flex-col will-change-transform"
        initial={false}
        animate={{ x: pushMain ? SIDEBAR_WIDTH : 0 }}
        transition={sidebarTransition}
      >
        <AppHeader toggleSidebar={toggleSidebar} />
        <MainContent>{children}</MainContent>
      </motion.div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
          aria-hidden
        />
      )}
    </div>
  );
};

export default AppLayout;
