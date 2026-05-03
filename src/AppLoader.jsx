import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import GlobalLoader from "./components/common/GlobalLoader";

const AppLoader = () => {

  const isFetching = useSelector((state) =>
    Object.values(state.api.queries || {}).some(q => q?.status === "pending")
  );

  const isMutating = useSelector((state) =>
    Object.values(state.api.mutations || {}).some(m => m?.status === "pending")
  );

 
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer;

    if (isFetching || isMutating) {
      timer = setTimeout(() => setShow(true), 300); 
    } else {
      setShow(false);
    }

    return () => clearTimeout(timer);
  }, [isFetching, isMutating]);

  if (!show) return null;

  return <GlobalLoader />;
};

export default AppLoader;