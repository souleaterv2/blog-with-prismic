import Link from 'next/link';

import styles from './header.module.scss';

const Hedaer: React.FC = () => {
  return (
    <Link href="/">
      <a className={styles.container}>
        <img src="/assets/Logo.svg" alt="logo" />
      </a>
    </Link>
  );
};

export default Hedaer;
