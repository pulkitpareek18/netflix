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

          let imageAndInfo = "";

          if (result.qid === "movie" && result.i) {
            imageAndInfo = `<a onClick="setUrl(this); return setVideo(this);" url="imdb=${result.id}&type=movie&title=${result.l.replace(/ /g,"_")}" isWebSeries="false" title="${result.l}"  class="links" IMDB="${result.id}" href="https://www.2embed.to/embed/imdb/movie?id=${result.id}" target="_blank">
                     <img src="${result.i.imageUrl}">
                      <div class="info">
                       <h3>${result.l}</h3>
                        <p>${result.s}</p>
                      </div>
                   </a>`;

          } else if (result.qid === "tvSeries" && result.i) {
            imageAndInfo = `<a onClick="setUrl(this); return setVideo(this);" url="imdb=${result.id}&season=1&episode=1&title=${result.l.replace(/ /g,"_")}" IMDB="${result.id}" title="${result.l}" isWebSeries="true" class="links" href="https://www.2embed.to/embed/imdb/tv?id=${result.id}&s=1&e=1" target="_blank">
                      <img src="${result.i.imageUrl}">
                        <div class="info">
                          <h3>${result.l}</h3>
                          <p>${result.s}</p>
                        </div>
                    </a>`;
          }
          resultElem.innerHTML = imageAndInfo;
          resultsContainer.appendChild(resultElem);
        }
      });
    });

}

function setAll(imdb, title, season, episode, type) {
  if (imdb && title && !season && !episode && type) {
    let a = document.createElement("a");
    a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
    a.setAttribute("url", `imdb=${imdb}&&type=movie`);
    a.setAttribute("isWebSeries", "false");
    a.setAttribute("title", title);
    a.setAttribute("class", "links");
    a.setAttribute("IMDB", imdb);
    a.setAttribute("href", "https://www.2embed.to/embed/imdb/movie?id=" + imdb);
    a.setAttribute("target", "_blank");
    a.click();
  }else if(imdb && title && episode && !type){
    let a = document.createElement("a");
    a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
    a.setAttribute("url", `imdb=${imdb}&season=${season}&episode=${episode}`);
    a.setAttribute("isWebSeries", "true");
    a.setAttribute("title", title);
    a.setAttribute("class", "links");
    a.setAttribute("IMDB", imdb);
    a.setAttribute("href", `https://www.2embed.to/embed/imdb/tv?id=${imdb}&s=${season}&e=${episode}`);
    a.setAttribute("target", "_blank");
    a.click();
  }

}

const fetchTitle = async (imdbID) => {
  const url = `https://cors-anywhere.azm.workers.dev/https://v3.sg.media-imdb.com/suggestion/x/${imdbID}.json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const title = data.d[0].l;
    return title;
  } catch (error) {
    console.error(error);
  }
};



function setUrl(element) {
  let search = element.getAttribute("url")
  window.history.replaceState({}, "", `?${(search).replace(/%20/g, "+")}`);
}

function fillSearchInput() {
  let searchParams = new URLSearchParams(window.location.search);
  let search = searchParams.get("search");
  let season = searchParams.get("season");
  let episode = searchParams.get("episode");
  let imdb = searchParams.get("imdb");
  let type = searchParams.get("type");
  if (search && !season && !episode && !imdb) {
    search = search.replace(/\+/g, "%20");
    const searchInput = document.querySelector("#search-input");
    searchInput.value = search;
    fetchAndShow();
  }

  // It will set the contents according to url data

  else if (imdb && type && !search && !episode && !season) {
    fetchTitle(imdb)
      .then(title => setAll(imdb, title,season,episode,type))
      .catch(error => console.error(error));



  }else if (imdb && !search && episode && season) {
    fetchTitle(imdb)
    .then(title => setAll(imdb, title, season, episode,type))
    .catch(error => console.error(error));
  }


}


fillSearchInput()


function updateURL(input) {
  let search = input.value;
  if (search) {
    window.history.replaceState({}, "", `?search=${encodeURIComponent(search).replace(/%20/g, "+")}`);
  } else {
    window.history.replaceState({}, "", window.location.pathname);
  }
}


searchInput.addEventListener("keyup", function () {
  updateURL(this)
  fetchAndShow();

  $('html,body').animate({
    scrollTop: $("#results").offset().top
  },
    'slow');

});

searchButton.addEventListener("click", function () {
  fetchAndShow();
});


function episodeHighlight(cssidentification = "s1e1") {
  document.querySelectorAll(".episodes").forEach(function (episode) {
    episode.className = "episodes"
  })
  document.querySelector(`.episodes[cssidentification='${cssidentification}']`).className = "episodes selected"
}


function setVideo(element) {
  const iframe = document.getElementById("iframe");
  const video = document.getElementById("video");
  iframe.src = element.getAttribute("href");
  video.style.display = "block";
  const webSeriesData = document.getElementById("webSeriesData");
  const tmdbApiKey = "b6b677eb7d4ec17f700e3d4dfc31d005";
  const imdbID = element.getAttribute("IMDB");
  Pace.restart();
  scrollToTop();


  if (element.getAttribute("isWebSeries") == "false" && element.className == "links") {
    webSeriesData.innerHTML = "";
  }

  if (element.getAttribute("title") !== "") {
    document.title = element.getAttribute("title")
  }

  if (element.className.includes("episode")) {
    episodeHighlight(element.getAttribute("cssidentification"))
    console.log("clicked")
  }

  if (element.getAttribute("isWebSeries") == "true") {
    webSeriesData.innerHTML = "";
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
          let formatedEpisodeNumber = (episodeNumber).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
          episodesData += `<a class="episodes" title="${seasonsDataJSON.name + ": E" + formatedEpisodeNumber + ". " + episode.name}" cssidentification="s${seasonNumber}e${episodeNumber}" url="imdb=${imdbID}&season=${seasonNumber}&episode=${episodeNumber}&title=${seasonsDataJSON.name.replace(/ /g,"_") + "_E" + formatedEpisodeNumber + "_" + episode.name.replace(/ /g,"_")}" onClick="event.preventDefault();setVideo(this);setUrl(this); " href="https://www.2embed.to/embed/tmdb/tv?id=${showId}&s=${seasonNumber}&e=${episodeNumber}">E${formatedEpisodeNumber}. ${episode.name}</a>`;
        }

        episodeContainer.innerHTML = episodesData;
        webSeriesData.appendChild(episodeContainer);
        episodeHighlight()
        document.querySelector(`a[cssIdentification="s1e1"]`).click()
      }
    }
    printEpisodes()
  } else {
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());

  gtag('config', 'G-THTQ9GZQ0J');
  console.log("gtag updated location")

  return false;
}

