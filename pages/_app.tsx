import "../style.css";
import { Container } from "next/app";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import Loading from "../components/Loading";

function MyApp({ Component, pageProps }) {
  const [isRouteChanging, setRouteChanging] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string>(null);

  const routeChangeStartHandler = () => {
    setRouteChanging(true);
    setLoadingKey(
      [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join("")
    );
  };

  const routeChangeEndHandler = () => {
    setRouteChanging(false);
  };

  useEffect(() => {
    Router.events.on("routeChangeStart", routeChangeStartHandler);
    Router.events.on("routeChangeComplete", routeChangeEndHandler);
    Router.events.on("routeChangeError", routeChangeEndHandler);

    return () => {
      Router.events.off("routeChangeStart", routeChangeStartHandler);
      Router.events.off("routeChangeComplete", routeChangeEndHandler);
      Router.events.off("routeChangeError", routeChangeEndHandler);
    };
  });

  return (
    <Container>
      <Loading isRouteChanging={isRouteChanging} loadingKey={loadingKey} />
      <Component {...pageProps} />
    </Container>
  );
}

export default MyApp;
