import React from 'react';
import './contactos.css';


export default function Contactos() {
  const address = 'Av. Dr. Adriano Figueiredo 158, 3460-009 Tondela';
  const placeQuery = `Clinimolelos, Lda, ${address}`;
  const queryEncoded = encodeURIComponent(placeQuery);

  // Opens Google Maps in a new tab with the clinic location
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${queryEncoded}`;
  // Lightweight embed that doesn't require an API key
  const mapsEmbedSrc = `https://www.google.com/maps?q=${queryEncoded}&output=embed`;

  return (
    <main className="contactos-page">
      <div className="contactos-inner">
        <h1 className="contactos-title">Contactos</h1>

        <section className="contactos-grid" aria-label="Contactos da clínica">
          <div className="contactos-mapWrap">
            <div className="contactos-mapCard">
              <a
                className="contactos-mapLink"
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir localização da clínica no Google Maps"
              />
              <iframe
                className="contactos-mapFrame"
                title="Mapa da localização da clínica"
                src={mapsEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <div className="contactos-info">
            <div>{address}</div>
          </div>

          <div className="contactos-info">
            <div>
              Horário: De Segunda a Sábado,
              <br />
              das 9:30h às 19h
            </div>
          </div>

          <div className="contactos-info contactos-phone">
            <div>+351 232 823 220</div>
          </div>
        </section>
      </div>
    </main>
  );
}
