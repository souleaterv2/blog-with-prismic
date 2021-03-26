import Head from 'next/head';
import Image from 'next/image';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';

import Header from '../../components/Header';
import Loading from '../../components/Loading';

import { formatPost } from '../../util/format';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

export interface Post {
  first_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <Loading />;
  }

  const formatedPost = formatPost(post);
  const { createdAt, data } = formatedPost;

  return (
    <>
      <Head>
        <title>{data.title} | BlogDeV</title>
      </Head>
      <Header />
      <div className={styles.banner}>
        <img src={data.banerUrl} alt="banner" />
      </div>
      <main className={styles.container}>
        <h1>{post.data.title}</h1>
        <div>
          <span>
            <FiCalendar /> <span>{createdAt}</span>
          </span>
          <span>
            <FiUser />
            <span>{data.author}</span>
          </span>
          <span>
            <FiClock /> <span>{data.minutesReading} min</span>
          </span>
        </div>
        {data.content.map(contentItem => {
          return (
            <article className={styles.content} key={contentItem.heading}>
              <h2>{contentItem.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: contentItem.body }} />
            </article>
          );
        })}
      </main>
    </>
  );
};

export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );

  const paths = postsResponse.results.map(result => ({
    params: { slug: result.uid },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});
  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      author: response.data.author,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(item => ({
        heading: item.heading,
        body: item.body,
      })),
      title: response.data.title,
    },
  } as Post;

  return {
    props: {
      post,
    },
  };
};
