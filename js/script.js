const pics = [
    {
      image: 'img/01.jpg',
      title: 'Svezia',
      text: 'Scandinavia\'s blend of nature and innovation.',
      lat: 59.3293,
      lng: 18.0686,
      location: 'Stoccolma, Svezia'
    }, 
    {
      image: 'img/02.jpg',
      title: 'Norvegia',
      text: 'Fjords, mountains, and coastal charm in Nordic splendor.',
      lat: 60.472,
      lng: 8.4689,
      location: 'Norvegia'
    }, 
    {
      image: 'img/03.jpg',
      title: 'Alaska',
      text: 'Untamed wilderness and rugged beauty in the Last Frontier.',
      lat: 64.2008,
      lng: -149.4937,
      location: 'Denali National Park, Alaska'
    }, 
    {
      image: 'img/04.jpg',
      title: 'Gran Canyon',
      text: 'Nature\'s masterpiece, a colorful tapestry of cliffs.',
      lat: 36.0544,
      lng: -112.2401,
      location: 'Grand Canyon, Arizona'
    }, 
    {
      image: 'img/05.jpg',
      title: "Skyrim",
      text: 'Epic Nordic fantasy with dragons and ancient magic.',
      lat: 64.9631,
      lng: -19.0208,
      location: 'Islanda (Ispirazione per Skyrim)'
    }
];

// Variabili globali
let activeImage = 0;
let images;
let thumbnailElements;
let intervalId;
let map;
let marker;
const colorThief = new ColorThief();

// DEFINIZIONE DELLE FUNZIONI
// Crea la singola immagine
const createImage = ({ image, title, text }) => {
  return `<figure>
            <img src="./${image}" alt="${title}">
            <figcaption>
                <h2>${title}</h2>
                <h3>${text}</h3>
            </figcaption>
          </figure>`;
}

// Renderizza tutte le immagini
const renderImages = (array) => {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = array.map(item => createImage(item)).join('');
}

// Crea le thumbnails
const renderThumbnails = (array) => {
  const thumbnailsContainer = document.querySelector('.thumbnails');
  let thumbnails = array.map((item, index) => {
    const basePath = item.image.substring(0, item.image.lastIndexOf('.'));
    return `<img src="${basePath}.webp" alt="${item.title}" class="thumbnail" data-index="${index}" onerror="this.src='./${item.image}';">`;
  }).join('');
  
  thumbnailsContainer.innerHTML = thumbnails;
}

// Aggiorna la thumbnail attiva
const updateActiveThumbnail = () => {
  thumbnailElements.forEach((thumbnail, index) => {
    thumbnail.classList.toggle('active', index === activeImage);
  });
}

// Aggiorna la descrizione dell'immagine
const updateImageDescription = () => {
  const descriptionTitle = document.querySelector('.description-title');
  const descriptionText = document.querySelector('.description-text');
  const descriptionContainer = document.querySelector('.image-description');
  
  descriptionTitle.textContent = pics[activeImage].title;
  descriptionText.textContent = pics[activeImage].text;
  
  // Animazione
  descriptionContainer.classList.remove('animate');
  void descriptionContainer.offsetWidth;
  descriptionContainer.classList.add('animate');
}

// Aggiorna il colore di sfondo in base all'immagine
const updateBackgroundColor = (img) => {
  if (!img.complete) return;
  
  try {
    const color = colorThief.getColor(img);
    const container = document.querySelector('.container');
    const descriptionElement = document.querySelector('.image-description');
    
    if (container) {
      container.style.background = `linear-gradient(135deg, rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9), rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.4))`;
      
      // Aggiusta contrasto testo
      const brightness = (color[0] * 299 + color[1] * 587 + color[2] * 114) / 1000;
      container.style.color = brightness < 128 ? '#fff' : '#333';
    }
    
    if (descriptionElement) {
      descriptionElement.style.borderLeftColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      descriptionElement.style.boxShadow = `0 6px 15px rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`;
    }
  } catch (e) {
    console.log('Impossibile estrarre il colore:', e);
  }
}

// Funzione per inizializzare la mappa di OpenStreetMap con Leaflet
const initMap = () => {
  // Crea la mappa centrata sulla prima posizione
  map = L.map('map').setView([pics[0].lat, pics[0].lng], 7);
  
  // Aggiungi il layer di OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Crea il marker
  marker = L.marker([pics[0].lat, pics[0].lng])
    .addTo(map)
    .bindPopup(pics[0].title)
    .openPopup();
  
  // Inizializza info location
  updateLocationInfo(0);
};

// Funzione per aggiornare la mappa
const updateMap = (index) => {
  if (!map || !marker) return;
  
  // Nuova posizione
  const newLatLng = [pics[index].lat, pics[index].lng];
  
  // Anima la transizione alla nuova posizione
  map.flyTo(newLatLng, 7, {
    duration: 1.5,
    easeLinearity: 0.5
  });
  
  // Aggiorna il marker
  marker.setLatLng(newLatLng);
  marker.bindPopup(pics[index].title).openPopup();
  
  // Aggiorna informazioni location
  updateLocationInfo(index);
};

// Funzione per aggiornare le informazioni sulla posizione
const updateLocationInfo = (index) => {
  const locationNameElement = document.querySelector('.location-name');
  if (locationNameElement) {
    locationNameElement.textContent = pics[index].location;
  }
};

// Avanza all'immagine successiva
const nextImage = () => {
  images[activeImage].classList.remove('active');
  activeImage = (activeImage + 1) % images.length;
  images[activeImage].classList.add('active');
  updateEverything();
}

// Torna all'immagine precedente
const previousImage = () => {
  images[activeImage].classList.remove('active');
  activeImage = (activeImage - 1 + images.length) % images.length;
  images[activeImage].classList.add('active');
  updateEverything();
}

// Aggiorna tutti gli elementi quando cambia l'immagine
const updateEverything = () => {
  updateActiveThumbnail();
  updateImageDescription();
  updateMap(activeImage);
  
  const activeImg = document.querySelector('.gallery figure.active img');
  if (activeImg) {
    if (!activeImg.complete) {
      activeImg.addEventListener('load', () => updateBackgroundColor(activeImg));
    } else {
      updateBackgroundColor(activeImg);
    }
  }
}

// Gestisce il click sulle thumbnail
const handleThumbnailClick = (index) => {
  images[activeImage].classList.remove('active');
  activeImage = index;
  images[activeImage].classList.add('active');
  updateEverything();
  
  // Reset autoplay
  clearInterval(intervalId);
  intervalId = setInterval(nextImage, 20000);
}

// Inizializza lo slider
const initSlider = () => {
  renderImages(pics);
  renderThumbnails(pics);
  
  images = document.querySelectorAll('#carousel figure');
  thumbnailElements = document.querySelectorAll('.thumbnail');
  
  // Imposta prima immagine come attiva
  images[activeImage].classList.add('active');
  updateActiveThumbnail();
  
  // Event listeners
  document.querySelector('.fa-arrow-right').addEventListener('click', nextImage);
  document.querySelector('.fa-arrow-left').addEventListener('click', previousImage);
  
  thumbnailElements.forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => handleThumbnailClick(index));
  });
  
  // Inizializza la mappa
  initMap();
  
  // Inizializza la descrizione e il colore di sfondo
  updateImageDescription();
  const activeImg = document.querySelector('.gallery figure.active img');
  if (activeImg) {
    if (activeImg.complete) {
      updateBackgroundColor(activeImg);
    } else {
      activeImg.addEventListener('load', () => updateBackgroundColor(activeImg));
    }
  }
  
  // Autoplay
  intervalId = setInterval(nextImage, 20000);
}

// Inizializza quando il DOM è pronto
document.addEventListener('DOMContentLoaded', initSlider);