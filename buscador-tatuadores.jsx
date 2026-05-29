import React, { useState } from 'react';

export default function TatuadoresBuscador() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTatuador, setSelectedTatuador] = useState(null);

  const tatuadores = [
    {
      id: 1,
      name: "Oscar",
      artistName: "Spiker",
      estilos: ["BlackWork", "realismo", "tradicional"],
      experience: 10,
      description: "Especialista en líneas precisas y realismo detallado. Oscar lleva una década creando obras maestras.",
      imagen: "🎨",
      redes: { instagram: "@spiker_tattoo" }
    },
    {
      id: 2,
      name: "Casiel",
      artistName: "Compe",
      estilos: ["BlackWork", "realismo", "tradicional"],
      experience: 6,
      description: "Artista versátil con foco en BlackWork moderno. Casiel combina técnica tradicional con diseños contemporáneos.",
      imagen: "✨",
      redes: { instagram: "@compe.ttt" }
    }
  ];

  const buscarPorEstilo = (termino) => {
    if (!termino.trim()) return [];
    const termLower = termino.toLowerCase();
    return tatuadores.filter(tatuador =>
      tatuador.estilos.some(estilo => estilo.toLowerCase().includes(termLower)) ||
      tatuador.artistName.toLowerCase().includes(termLower) ||
      tatuador.name.toLowerCase().includes(termLower)
    );
  };

  const resultados = buscarPorEstilo(searchTerm);

  const handleVerPerfil = (tatuador) => {
    setSelectedTatuador(tatuador);
    setCurrentPage('perfil');
  };

  const handleVolver = () => {
    setCurrentPage('home');
    setSelectedTatuador(null);
    setSearchTerm('');
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #0a0e27;
          color: #ffffff;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
      `}</style>

      {currentPage === 'home' ? (
        // Página Principal
        <div style={styles.homePage}>
          {/* Header */}
          <header style={styles.header}>
            <div style={styles.headerContent}>
              <h1 style={styles.logo}>INK</h1>
              <p style={styles.tagline}>Encuentra tu tatuador perfecto</p>
            </div>
            <div style={styles.decoration}></div>
          </header>

          {/* Buscador */}
          <section style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Busca por estilo: realismo, blackwork, tradicional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
              <span style={styles.searchIcon}>🔍</span>
            </div>
          </section>

          {/* Resultados */}
          <section style={styles.resultsSection}>
            {searchTerm.trim() === '' ? (
              <div style={styles.welcomeState}>
                <div style={styles.welcomeContent}>
                  <h2 style={styles.welcomeTitle}>Explora nuestros tatuadores</h2>
                  <p style={styles.welcomeText}>
                    Busca por estilo de tatuaje para encontrar al artista perfecto para tu próxima obra.
                  </p>
                  <div style={styles.stylesGrid}>
                    {['realismo', 'BlackWork', 'tradicional'].map((estilo) => (
                      <button
                        key={estilo}
                        onClick={() => setSearchTerm(estilo)}
                        style={styles.styleButton}
                      >
                        {estilo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : resultados.length > 0 ? (
              <div style={styles.resultsGrid}>
                {resultados.map((tatuador, index) => (
                  <div
                    key={tatuador.id}
                    style={{
                      ...styles.resultCard,
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.avatarSection}>
                        <div style={styles.avatar}>{tatuador.imagen}</div>
                      </div>
                      <div style={styles.cardInfo}>
                        <h3 style={styles.cardName}>{tatuador.artistName}</h3>
                        <p style={styles.cardSubname}>{tatuador.name}</p>
                        <p style={styles.experience}>
                          {tatuador.experience} años de experiencia
                        </p>
                      </div>
                    </div>

                    <div style={styles.estilosContainer}>
                      {tatuador.estilos.map((estilo, i) => (
                        <span
                          key={i}
                          style={{
                            ...styles.estiloBadge,
                            backgroundColor: estilo.toLowerCase().includes(searchTerm.toLowerCase())
                              ? '#ff6b35'
                              : '#2a2f4f'
                          }}
                        >
                          {estilo}
                        </span>
                      ))}
                    </div>

                    <p style={styles.cardDescription}>{tatuador.description}</p>

                    <button
                      onClick={() => handleVerPerfil(tatuador)}
                      style={styles.perfilButton}
                    >
                      Ver perfil completo
                      <span style={{ marginLeft: '8px' }}>→</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.noResults}>
                <p style={styles.noResultsText}>
                  No encontramos tatuadores con ese estilo.
                </p>
                <p style={styles.noResultsSubtext}>
                  Prueba con: realismo, blackwork o tradicional
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        // Página de Perfil
        <div style={styles.perfilPage}>
          <button onClick={handleVolver} style={styles.backButton}>
            ← Volver a resultados
          </button>

          <div style={styles.perfilContent}>
            <div style={styles.perfilHeader}>
              <div style={styles.perfilAvatar}>{selectedTatuador.imagen}</div>
              <div style={styles.perfilInfo}>
                <h1 style={styles.perfilTitle}>{selectedTatuador.artistName}</h1>
                <p style={styles.perfilRealName}>{selectedTatuador.name}</p>
              </div>
            </div>

            <div style={styles.perfilGrid}>
              <div style={styles.perfilCard}>
                <h3 style={styles.perfilCardTitle}>Sobre mí</h3>
                <p style={styles.perfilDescription}>{selectedTatuador.description}</p>
              </div>

              <div style={styles.perfilCard}>
                <h3 style={styles.perfilCardTitle}>Experiencia</h3>
                <div style={styles.experienceBox}>
                  <span style={styles.experienceNumber}>{selectedTatuador.experience}</span>
                  <p style={styles.experienceText}>Años en la industria</p>
                </div>
              </div>

              <div style={styles.perfilCard}>
                <h3 style={styles.perfilCardTitle}>Estilos</h3>
                <div style={styles.perfilEstilos}>
                  {selectedTatuador.estilos.map((estilo, i) => (
                    <span key={i} style={styles.perfilEstiloBadge}>
                      {estilo}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.perfilCard}>
                <h3 style={styles.perfilCardTitle}>Contacto</h3>
                <p style={styles.contactInfo}>
                  {selectedTatuador.redes.instagram}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Redirigiendo a la página de ${selectedTatuador.artistName}...`);
              }}
              style={styles.contactButton}
            >
              Agendar cita
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0e27',
    color: '#ffffff',
    fontFamily: '"Inter", sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },

  // ===== HOME PAGE =====
  homePage: {
    width: '100%',
    minHeight: '100vh'
  },

  header: {
    background: 'linear-gradient(135deg, #0f1535 0%, #1a1f3a 100%)',
    padding: '60px 40px',
    textAlign: 'center',
    position: 'relative',
    borderBottom: '2px solid #ff6b35',
    overflow: 'hidden'
  },

  headerContent: {
    position: 'relative',
    zIndex: 1
  },

  logo: {
    fontSize: '4rem',
    fontWeight: '800',
    fontFamily: '"Playfair Display", serif',
    letterSpacing: '8px',
    marginBottom: '10px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  tagline: {
    fontSize: '1.2rem',
    color: '#a8aec8',
    letterSpacing: '2px'
  },

  decoration: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
    borderRadius: '50%'
  },

  searchSection: {
    padding: '40px 20px',
    background: '#0a0e27',
  },

  searchContainer: {
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto'
  },

  searchInput: {
    width: '100%',
    padding: '16px 20px',
    paddingRight: '50px',
    fontSize: '1rem',
    background: '#1a1f3a',
    border: '2px solid #2a2f4f',
    borderRadius: '12px',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: '"Inter", sans-serif'
  },

  searchIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.2rem',
    pointerEvents: 'none'
  },

  resultsSection: {
    padding: '40px 20px 80px',
    maxWidth: '1200px',
    margin: '0 auto'
  },

  welcomeState: {
    textAlign: 'center',
    padding: '60px 40px'
  },

  welcomeContent: {
    animation: 'fadeInUp 0.8s ease-out'
  },

  welcomeTitle: {
    fontSize: '2.5rem',
    fontFamily: '"Playfair Display", serif',
    marginBottom: '20px',
    color: '#ffffff'
  },

  welcomeText: {
    fontSize: '1.1rem',
    color: '#a8aec8',
    marginBottom: '40px',
    maxWidth: '500px',
    margin: '0 auto 40px'
  },

  stylesGrid: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },

  styleButton: {
    padding: '12px 28px',
    fontSize: '1rem',
    background: '#1a1f3a',
    color: '#ff6b35',
    border: '2px solid #ff6b35',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '600',
    fontFamily: '"Inter", sans-serif'
  },

  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  },

  resultCard: {
    background: 'linear-gradient(135deg, #1a1f3a 0%, #232847 100%)',
    border: '1px solid #2a2f4f',
    borderRadius: '12px',
    padding: '24px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '16px'
  },

  avatarSection: {
    flex: '0 0 auto'
  },

  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem'
  },

  cardInfo: {
    flex: 1
  },

  cardName: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '4px',
    color: '#ffffff'
  },

  cardSubname: {
    fontSize: '0.9rem',
    color: '#a8aec8',
    marginBottom: '8px'
  },

  experience: {
    fontSize: '0.85rem',
    color: '#ff6b35',
    fontWeight: '600'
  },

  estilosContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },

  estiloBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    background: '#2a2f4f',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#ffffff',
    transition: 'all 0.3s ease'
  },

  cardDescription: {
    fontSize: '0.95rem',
    color: '#c5c7d8',
    marginBottom: '20px',
    lineHeight: '1.6'
  },

  perfilButton: {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", sans-serif'
  },

  noResults: {
    textAlign: 'center',
    padding: '60px 40px'
  },

  noResultsText: {
    fontSize: '1.3rem',
    color: '#ffffff',
    marginBottom: '10px'
  },

  noResultsSubtext: {
    fontSize: '1rem',
    color: '#a8aec8'
  },

  // ===== PERFIL PAGE =====
  perfilPage: {
    minHeight: '100vh',
    padding: '40px 20px 80px',
    maxWidth: '900px',
    margin: '0 auto'
  },

  backButton: {
    background: 'none',
    border: 'none',
    color: '#ff6b35',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '40px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", sans-serif'
  },

  perfilContent: {
    animation: 'fadeInUp 0.6s ease-out'
  },

  perfilHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '50px',
    paddingBottom: '30px',
    borderBottom: '2px solid #2a2f4f'
  },

  perfilAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3.5rem',
    flexShrink: 0
  },

  perfilInfo: {
    flex: 1
  },

  perfilTitle: {
    fontSize: '2.5rem',
    fontFamily: '"Playfair Display", serif',
    marginBottom: '8px',
    color: '#ffffff'
  },

  perfilRealName: {
    fontSize: '1.1rem',
    color: '#a8aec8'
  },

  perfilGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },

  perfilCard: {
    background: 'linear-gradient(135deg, #1a1f3a 0%, #232847 100%)',
    border: '1px solid #2a2f4f',
    borderRadius: '12px',
    padding: '24px'
  },

  perfilCardTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#ff6b35'
  },

  perfilDescription: {
    fontSize: '1rem',
    color: '#c5c7d8',
    lineHeight: '1.8'
  },

  experienceBox: {
    textAlign: 'center'
  },

  experienceNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ff6b35',
    display: 'block',
    marginBottom: '8px'
  },

  experienceText: {
    fontSize: '0.95rem',
    color: '#a8aec8'
  },

  perfilEstilos: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px'
  },

  perfilEstiloBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff'
  },

  contactInfo: {
    fontSize: '1rem',
    color: '#c5c7d8'
  },

  contactButton: {
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8a50 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", sans-serif'
  }
};
