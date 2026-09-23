import Head from 'next/head';

export default function ServiceUnavailable({ retryUrl = '/' }) {
  return (
    <main className="main">
      <Head>
        <title>Сервис временно недоступен | Mac Plus</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="page-content pt-10 pb-10">
        <div className="container text-center pt-10 pb-10">
          <h1 className="page-title mb-3">Сервис временно недоступен</h1>
          <p className="mb-5">
            Не удалось загрузить данные. Попробуйте обновить страницу через несколько секунд.
          </p>
          <a className="btn btn-dark btn-rounded" href={retryUrl}>
            Обновить страницу
          </a>
        </div>
      </div>
    </main>
  );
}
