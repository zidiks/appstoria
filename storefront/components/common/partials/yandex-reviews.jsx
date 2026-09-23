import React from "react";

export default function YandexReviews({ orgId }) {
  const id = String(orgId || '').trim();
  if (!id) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '80px',
        marginLeft: 'auto',
        marginRight: 'auto',
        background: 'white',
        border: 'none',
        width: '100%',
        maxWidth: '560px',
        height: '800px',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <span className="title mb-1">Отзывы</span>
      <div
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          background: 'white',
          border: 'none',
          width: '100%',
          maxWidth: '560px',
          height: '800px',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '0px'
        }}
      >
        <iframe
          style={{
            background: 'white',
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '0px'
          }}
          src={`https://yandex.ru/maps-reviews-widget/${encodeURIComponent(id)}?comments`}
          title="Отзывы на Яндекс Картах"
        ></iframe>
      </div>
    </div>
  )
}