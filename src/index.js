import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
axios.defaults.baseURL = 'https://pixabay.com/api/';
const key = '40786417-663091144562a9e2f0523c37d';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

let page;
let searchString;
let totalHits;

refs.form.addEventListener('submit', handlerSubmit);

var lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function handlerSubmit(event) {
  event.preventDefault();
  refs.gallery.innerHTML = '';
  if (!event.target.searchQuery.value.trim()) {
    Notiflix.Notify.failure('Search request incorrect!');
  } else {
    searchString = event.target.searchQuery.value.trim().replace(' ', '+');
    page = 1;
    totalHits = 40;
    serviceSearch(searchString, page);
  }
}
let target = document.querySelector('.js-guard');
let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(loadMore, options);

function loadMore() {
  page += 1;
  totalHits += 40;
  if (totalHits >= 480) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  } else {
    serviceSearch(searchString, page);
  }
}

async function serviceSearch(searchStr, page) {
  try {
    const response = await axios.get(
      `?key=${key}&q=${searchStr}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
    );
    if (page === 1) {
      Notiflix.Notify.info(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }
    if (response.data.totalHits === 0) {
      Notiflix.Notify.info(`По даному запиту нічого не знайдено`);
    } else {
      refs.gallery.insertAdjacentHTML('beforeend', createMarkup(response));
    }
  } catch (error) {
    Notiflix.Notify.failure('Упс! Щось пішло не так. Спробуйте ще раз.');
  } finally {
    observer.observe(target);
    lightbox.refresh();
  }
}

function createMarkup(response) {
  return response.data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `  <div class="photo-card">
    <a href ="${largeImageURL}"><img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b class="info-item">Downloads</b>
        ${downloads}
      </p>
    </div>
  </div>`
    )
    .join('');
}
