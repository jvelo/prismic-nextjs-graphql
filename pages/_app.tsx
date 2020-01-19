import "../style.css";
import React, { useEffect, useState } from "react";
import Router from "next/router";
import Loading from "../components/Loading";
import Head from "next/head";

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
    <>
      <Head>
        <style>
          @import
          url('https://fonts.googleapis.com/css?family=Roboto:400,900&display=swap');
        </style>
      </Head>

      <Loading isRouteChanging={isRouteChanging} loadingKey={loadingKey} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
