function scrollToTop() {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
}



const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");

function fetchAndShow() {
  const query = encodeURIComponent(searchInput.value);
  const url = `https://cors-anywhere.azm.workers.dev/https://v3.sg.media-imdb.com/suggestion/x/${query}.json`;
  Pace.restart();


  fetch(url)
    .then(response => response.json())
    .then(data => {
      const results = data.d;

      resultsContainer.innerHTML = "";

      results.forEach(result => {

        if (result.i && (result.qid === "movie" || result.qid === "tvSeries")) {
          const resultElem = document.createElement("div");
          resultElem.classList.add("result");


          let image = "";
          let info = "";

          if (result.qid === "movie" && result.i) {
            image = `<a onClick="return setVideo(this)" isWebSeries="false" title="${result.l}"  class="links" IMDB="${result.id}" href="https://www.2embed.to/embed/imdb/movie?id=${result.id}" target="_blank">
                    <img src="${result.i.imageUrl}">
                  </a>`;
            info = `
            <div class="info">
              <h3>${result.l}</h3>
              <p>${result.s}</p>
            </div>
          `;
          } else if (result.qid === "tvSeries" && result.i) {
            image = `<a onClick="return setVideo(this)" IMDB="${result.id}" title="${result.l}" isWebSeries="true" class="links" href="https://www.2embed.to/embed/imdb/tv?id=${result.id}&s=1&e=1" target="_blank">
                    <img src="${result.i.imageUrl}">
                  </a>`;
            info = `
            <div class="info">
              <h3>${result.l}</h3>
              <p>${result.s}</p>
            </div>
          `;
          }
          resultElem.innerHTML = image + info;
          resultsContainer.appendChild(resultElem);
        }
      });
    });

}

searchInput.addEventListener("keyup", function () {
  fetchAndShow();
    $('html,body').animate({
        scrollTop: $("#results").offset().top},
        'slow');
});

searchButton.addEventListener("click", function () {
  fetchAndShow();
});


function episodeHighlight(cssidentification = "s1e1") {
  console.log("episode highlight")
  document.querySelectorAll(".episodes").forEach(function (episode) {
    episode.className = "episodes"
  })
  document.querySelector(`.episodes[cssidentification='${cssidentification}']`).className = "episodes selected"
}


function setVideo(element) {
  const iframe = document.getElementById("iframe");
  iframe.src = element.getAttribute("href");
  iframe.style.display = "block";
  const webSeriesData = document.getElementById("webSeriesData");
  const tmdbApiKey = "b6b677eb7d4ec17f700e3d4dfc31d005";
  const imdbID = element.getAttribute("IMDB");
  Pace.restart();
  scrollToTop();

  
  if(element.getAttribute("title") !== ""){
    document.title = element.getAttribute("title")
    console.log(element.getAttribute("title"))
  }

  if (element.className.includes("episode")) {
    episodeHighlight(element.getAttribute("cssidentification"))
  }

  if (element.getAttribute("isWebSeries") == "true") {
    async function printEpisodes() {
      // First, get the show's TMDB id based on its IMDb id
      const response = await fetch(
        `https://api.themoviedb.org/3/find/${imdbID}?api_key=${tmdbApiKey}&language=en-US&external_source=imdb_id`
      );
      const data = await response.json();
      const showId = data.tv_results[0].id;

      // Next, get information about the show's seasons
      const seasonsData = await fetch(
        `https://api.themoviedb.org/3/tv/${showId}?api_key=${tmdbApiKey}&language=en-US`
      );
      const seasonsDataJSON = await seasonsData.json();
      const numberOfSeasons = seasonsDataJSON.number_of_seasons;

      webSeriesData.innerHTML += `<h2>Seasons:</h2>`;
      for (let seasonNumber = 1; seasonNumber <= numberOfSeasons; seasonNumber++) {
        webSeriesData.innerHTML += `<h3>Season ${seasonNumber}:</h3><br>`;
        let episodeContainer = document.createElement("div");
        episodeContainer.classList.add("episode-container");
        let episodesData = "";

        // Get information about episodes in the season
        const episodesDataResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${showId}/season/${seasonNumber}?api_key=${tmdbApiKey}&language=en-US`
        );
        const episodesDataJSON = await episodesDataResponse.json();

        for (const episode of episodesDataJSON.episodes) {
          const episodeNumber = episode.episode_number;
          episodesData += `<a class="episodes" isWebSeries="true" cssidentification="s${seasonNumber}e${episodeNumber}" onClick="return setVideo(this)" href="https://www.2embed.to/embed/tmdb/tv?id=${showId}&s=${seasonNumber}&e=${episodeNumber}">${episodeNumber}.${episode.name}</a>`;
        }

        episodeContainer.innerHTML = episodesData;
        webSeriesData.appendChild(episodeContainer);
        episodeHighlight()
      }
    }
    printEpisodes()
  } else {
    webSeriesData.innerHTML = ""
  }
  return false;
}

