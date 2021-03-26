import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import readingTime from 'reading-time';
import { RichText } from 'prismic-dom';

import { Post as PostPage } from '../pages/post/[slug]';
import { Post } from '../pages/index';

interface FormatedPost {
  createdAt: string;
  data: {
    minutesReading: number;
    title: string;
    author: string;
    banerUrl: string;
    content: {
      heading: string;
      body: string;
    }[];
  };
}

export const formatPreViewPost = (primicData: Post[]): Post[] => {
  const formatedPosts = primicData.map(post => ({
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'd MMM Y',
      {
        locale: ptBR,
      }
    ),
  }));

  return formatedPosts;
};

export const formatPost = (post: PostPage): FormatedPost => {
  const minutesReading = post.data.content.reduce((total, item) => {
    const text = RichText.asText(item.body);

    const { minutes } = readingTime(text);

    const newTotal = Math.ceil(total + minutes);

    return newTotal;
  }, 0);

  return {
    createdAt: format(new Date(post.first_publication_date), 'd MMM y', {
      locale: ptBR,
    }),
    data: {
      minutesReading,
      author: post.data.author,
      banerUrl: post.data.banner.url,
      content: post.data.content.map(item => ({
        heading: item.heading,
        body: RichText.asHtml(item.body),
      })),
      title: post.data.title,
    },
  };
};
