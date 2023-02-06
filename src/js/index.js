import '../css/styles.css';
import { Notify } from 'notiflix';
import debounce from 'lodash.debounce';
import { fetchCountryAPI } from './countriesAPI.js';

const DEBOUNCE_DELAY = 300;

const refs = {
  searchCountry: document.querySelector('#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

const onSearchCountryInput = event => {
  const searchedQuery = event.target.value.trim();
  if (!searchedQuery) {
    Notify.warning('Введіть назву країни');
    clearCountryInfo();
    clearCountryList();
    return;
  }

  fetchCountryAPI(searchedQuery)
    .then(data => {
      if (data.length > 10) {
        clearCountryInfo();
        clearCountryList();
        Notify.info(
          'Too many matches found. Please enter a more specific name'
        );
      }

      if (data.length >= 2 && data.length <= 10) {
        clearCountryInfo();
        renderCountryList(data);
      }

      if (data.length === 1) {
        clearCountryList();
        renderCountryCard(data);
      }
    })
    .catch(err => {
      if (err.message === '404') {
        Notify.failure('Країну не знайдено');
        clearCountryInfo();
        clearCountryList();
      }
      console.log(err);
    });
};

refs.searchCountry.addEventListener(
  'input',
  debounce(onSearchCountryInput, DEBOUNCE_DELAY)
);

function renderCountryList(data) {
  const markup = data.map(({ name: { official }, flags: { svg, alt } }) => {
    return `
        <li class="country-item">
            <img class="country-img" src="${svg}" alt="${alt}">
            <p class="country-desc">${official}</p>
        </li>`;
  });

  refs.countryList.innerHTML = markup;
}

function renderCountryCard(data) {
  const markup = data

    .map(
      ({
        name: { official },
        flags: { svg, alt },
        capital,
        population,
        languages,
      }) => {
        return `
        <div>
            <img class="country-img--card" src="${svg}" alt="${alt}">
            <h2 style="display: inline">${official}</h2>
        </div>
        <ul>
            <li><p class="country-desc">Capital<span class="country-desc--details">: ${capital}</span></p></li>
            <li><p class="country-desc">Population<span class="country-desc--details">: ${population}</span></p></li>
            <li><p class="country-desc">Languages<span class="country-desc--details">: ${Object.values(
              languages
            ).join(',  ')}</span></p></li>
        </ul>
        `;
      }
    )
    .join('');
  refs.countryInfo.innerHTML = markup;
}

function clearCountryList() {
  refs.countryList.innerHTML = '';
}

function clearCountryInfo() {
  refs.countryInfo.innerHTML = '';
}
