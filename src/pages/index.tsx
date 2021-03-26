import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import Prismic from '@prismicio/client';

import { FiUser, FiCalendar } from 'react-icons/fi';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { formatPreViewPost } from '../util/format';

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export const Home: React.FC<HomeProps> = ({ postsPagination }) => {
  const { results, next_page } = postsPagination;

  const [posts, setposts] = useState(formatPreViewPost(results));
  const [nextPage, seNextPage] = useState<string | null>(next_page);

  const handleFetchPost = async (): Promise<void> => {
    try {
      const response = await fetch(nextPage);

      const data: ApiSearchResponse = await response.json();

      const newsPosts = formatPreViewPost(data.results);

      setposts([...posts, ...newsPosts]);

      seNextPage(data.next_page);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Post | BlogDeV</title>
      </Head>
      <Header />
      <main className={styles.container}>
        <div className={styles.post}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <div>
                  <span>
                    <FiCalendar />
                    <span>{post.first_publication_date}</span>
                  </span>
                  <span>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {nextPage && (
          <span
            onClick={handleFetchPost}
            onKeyDown={handleFetchPost}
            role="button"
            tabIndex={0}
          >
            Carregar mais posts
          </span>
        )}
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      author: post.data.author,
      subtitle: post.data.subtitle,
      title: post.data.title,
    },
  }));

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};

export default Home;
