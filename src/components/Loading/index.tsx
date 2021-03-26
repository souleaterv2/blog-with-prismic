import styles from './loading.module.scss';

const Loading: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src="/assets/capa.svg" alt="loaging" />
      <span>Carregando...</span>
    </div>
  );
};

export default Loading;
