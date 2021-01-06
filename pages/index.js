import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";

const defautlApi = "https://rickandmortyapi.com/api/character/";

export async function getServerSideProps() {
  const res = await fetch(defautlApi);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

export default function Home({ data }) {
  const { info, results: defaultResults = [] } = data;
  const [results, setResults] = useState(defaultResults);
  const [page, setPage] = useState({
    ...info,
    current: defautlApi,
  });
  const { current } = page;

  useEffect(() => {
    if (current === defautlApi) return;

    async function request() {
      const res = await fetch(current);
      const nextData = await res.json();

      setPage({
        current,
        ...nextData.info,
      });

      if (!nextData.info?.prev) {
        setResults(nextData.results);
        return;
      }

      setResults((prev) => {
        return [...prev, ...nextData.results];
      });
    }

    request();
  }, [current]);

  const handleLoadMore = () => {
    setPage((prev) => {
      return {
        ...prev,
        current: page?.next,
      };
    });
  };

  const handleOnSubmitSearch = (event) => {
    event.preventDefault();

    const { currentTarget = {} } = event;
    const fields = Array.from(currentTarget?.elements);
    const fieldQuery = fields.find((field) => field.name === "query");

    const value = fieldQuery.value || "";
    const endpoint = `https://rickandmortyapi.com/api/character/?name=${value}`;

    setPage({
      current: endpoint,
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Rick and Morty App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Rick and Morty App</h1>

        <p className={styles.description}>Rick and Morty NextJS APP</p>

        <form className="search" onSubmit={handleOnSubmitSearch}>
          <input name="query" type="search" />
          <button>Search</button>
        </form>

        <ul className={styles.grid}>
          {results.map((result) => {
            const { id, name, image } = result;

            return (
              <li key={id} className={styles.card}>
                <Link href="/character/[id]" as={`/character/${id}`}>
                  <a>
                    <img src={image} alt={name} />
                    <h3>{name}</h3>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
        <p>
          <button onClick={handleLoadMore}>Load More</button>
        </p>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}
