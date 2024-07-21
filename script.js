function scrollToTop() {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
}

const htmlBody = document.querySelector("html, body");
const results = document.querySelector("#results");

const scrollToResults = () => {
  const resultsTop = results.offsetTop;
  htmlBody.scrollTo({
    top: resultsTop,
    behavior: "smooth",
  });
};


const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const resultsContainer = document.getElementById("results");
const corsProxy = "https://cors-anywhere.pulkitpareekofficial.workers.dev/?url=";

// functions that manipulates the queries of url to get a low resolution image to increase page speed
function optimisedImageUrl(url) {
  return url.replace("._V1_.", "._V1_QL75_UX160_.");
}

// Fetch and Show Cards

function fetchAndShow() {
  const query = encodeURIComponent(searchInput.value);
  const url = `${corsProxy}https://v3.sg.media-imdb.com/suggestion/x/${query}.json`;
  Pace.restart();

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const results = data.d;

      resultsContainer.innerHTML = "";

      results.forEach((result) => {
        if (result.i && (result.qid === "movie" || result.qid === "tvSeries")) {
          const resultElem = document.createElement("div");
          resultElem.classList.add("result");
          resultElem.setAttribute("IMDB", result.id);

          let imageAndInfo = "";

          if (result.qid === "movie" && result.i) {
            imageAndInfo = `<a onClick="setUrl(this); return setVideo(this);" url="imdb=${result.id}&type=movie&title=${result.l.replace(/ /g, "_")}" isWebSeries="false" title="${result.l}"  class="links" IMDB="${result.id}" href="https://multiembed.mov/directstream.php?video_id=${result.id}" target="_blank">
                     <img alt="${result.l}" src="${optimisedImageUrl(result.i.imageUrl)}">
                      <div class="info">
                       <h3>${result.l}</h3>
                        <p>${result.s}</p>
                      </div>
                   </a>`;
          } else if (result.qid === "tvSeries" && result.i) {
            imageAndInfo = `<a onClick="setUrl(this); return setVideo(this);" url="imdb=${result.id}&season=1&episode=1&title=${result.l.replace(/ /g, "_")}" IMDB="${result.id}" title="${result.l}" isWebSeries="true" class="links" href="https://multiembed.mov/directstream.php?video_id=${result.id}&s=1&e=1" target="_blank">
                      <img alt="${result.l}" src="${optimisedImageUrl(result.i.imageUrl)}">
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

// A function which will set the player url and page url by imitating a anchor tag click

function setAll(imdb, title, season, episode, type) {
  if (imdb && title && !season && !episode && type) {
    let a = document.createElement("a");
    a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
    a.setAttribute(
      "url",
      `imdb=${imdb}&type=movie&title=${title.replace(/ /g, "_")}`
    );
    a.setAttribute("isWebSeries", "false");
    a.setAttribute("title", title);
    a.setAttribute("class", "links");
    a.setAttribute("IMDB", imdb);
    a.setAttribute("href", "https://multiembed.mov/directstream.php?video_id=" + imdb);
    a.setAttribute("target", "_blank");
    a.click();
  } else if (imdb && title && episode && !type) {
    // let formatedEpisodeNumber = (episode).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    let a = document.createElement("a");
    a.setAttribute("onClick", "setUrl(this); return setVideo(this);");
    console.log("season setall", season, "episode", episode);
    a.setAttribute("url", `imdb=${imdb}&season=${season}&episode=${episode}`);
    a.setAttribute("isWebSeries", "true");
    a.setAttribute("title", title);
    a.setAttribute("class", "links");
    a.setAttribute("IMDB", imdb);
    a.setAttribute(
      "href",
      `https://multiembed.mov/directstream.php?video_id=${imdb}&s=${season}&e=${episode}`
    );
    a.setAttribute("target", "_blank");
    a.click();
  }
}

// fetch titile of movie/webseries by its imdb id

const fetchTitle = async (imdbID) => {
  const url = `${corsProxy}https://v3.sg.media-imdb.com/suggestion/x/${imdbID}.json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const title = data.d[0].l;
    return title;
  } catch (error) {
    console.error(error);
  }
};

// set url of element by getting its custom url attirbute

function setUrl(element) {
  let search = element.getAttribute("url");
  window.history.replaceState({}, "", `?${search.replace(/%20/g, "+")}`);
}

// insert search query in search box from url and set contents from url

function fillSearchInput() {
  let searchParams = new URLSearchParams(window.location.search);
  let search = searchParams.get("search");
  let season = searchParams.get("season");
  let episode = searchParams.get("episode");
  let imdb = searchParams.get("imdb");
  let type = searchParams.get("type");

  // It will set search query in search box from url

  if (search && !season && !episode && !imdb) {
    search = search.replace(/\+/g, "%20");
    const searchInput = document.querySelector("#search-input");
    searchInput.value = search;
    fetchAndShow();
  }

  // It will set the contents according to url data
  else if (imdb && type && !search && !episode && !season) {
    fetchTitle(imdb)
      .then((title) => setAll(imdb, title, season, episode, type))
      .catch((error) => console.error(error));

    // It will set the contents according to url data
  } else if (imdb && !search && episode && season) {
    console.log("season", season, "episode", episode);

    fetchTitle(imdb)
      .then((title) => setAll(imdb, title, season, episode, type))
      .catch((error) => console.error(error));
    console.log("season", season, "episode", episode);
  }
}

fillSearchInput();

// update url by search query

function updateURL(input) {
  let search = input.value;
  if (search) {
    window.history.replaceState(
      {},
      "",
      `?search=${encodeURIComponent(search).replace(/%20/g, "+")}`
    );
  } else {
    window.history.replaceState({}, "", window.location.pathname);
  }
}

// Highlighting Selected Card

function highlightCards() {
  let searchParams = new URLSearchParams(window.location.search);
  let imdb_id = searchParams.get("imdb");
  try {
    document.querySelectorAll(".result").forEach(function (card) {
      card.className = "result";
    });
    document.querySelector(`div[IMDB=${imdb_id}]`).className =
      "result hoverClass";
  } catch (error) {
    // will throw error only if the class is not present
  }
}

// Listen for the onpopstate event and update the display of elements with the class "information"
window.onpopstate = function () {
  let searchParams = new URLSearchParams(window.location.search);
  let search = searchParams.get("search");
  let imdb = searchParams.get("imdb");

  if (search || imdb) {
    let elements = document.getElementsByClassName("information");

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }
  } else {
    let elements = document.getElementsByClassName("information");

    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "block";
    }
  }
};

// auto search by input which will execute when user stops typing for 500ms

let timer;

searchInput.addEventListener("keyup", function () {
  let inputQuery = this;
  clearTimeout(timer);
  timer = setTimeout(function () {
    updateURL(inputQuery);
    fetchAndShow();
    window.dispatchEvent(new PopStateEvent("popstate"));
    scrollToResults();
  }, 500); // wait for 500ms before executing the function
});

// button click search

searchButton.addEventListener("click", function () {
  fetchAndShow();
  scrollToResults();
  // hide information
  window.dispatchEvent(new PopStateEvent("popstate"));
});

// higlight episodes of webseries

function episodeHighlight(cssidentification = "s1e1") {
  document.querySelectorAll(".episodes").forEach(function (episode) {
    episode.className = "episodes";
  });
  document.querySelector(
    `.episodes[cssidentification='${cssidentification}']`
  ).className = "episodes selected";
}

// Do multiple tasks on anchor tag click

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

  // hide information
  window.dispatchEvent(new PopStateEvent("popstate"));

  // clearing episodes list box for another series

  if (
    element.getAttribute("isWebSeries") == "false" &&
    element.className == "links"
  ) {
    webSeriesData.innerHTML = "";
  }

  // setting page title

  if (element.getAttribute("title") !== "") {
    document.title = element.getAttribute("title");
  }

  // highlight selected webseries episode

  if (element.className.includes("episode")) {
    episodeHighlight(element.getAttribute("cssidentification"));
    console.log("clicked");
  }

  // Displaying webseries episode

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
      for (
        let seasonNumber = 1;
        seasonNumber <= numberOfSeasons;
        seasonNumber++
      ) {
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
          let formatedEpisodeNumber = episodeNumber.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          });
          episodesData += `<a class="episodes" title="${seasonsDataJSON.name + ": E" + formatedEpisodeNumber + ". " + episode.name}" cssidentification="s${seasonNumber}e${episodeNumber}" url="imdb=${imdbID}&season=${seasonNumber}&episode=${episodeNumber}&title=${seasonsDataJSON.name.replace(/ /g, "_") + "_E" + formatedEpisodeNumber + "_" + episode.name.replace(/ /g, "_")}" onClick="event.preventDefault();setVideo(this);setUrl(this); " href="https://multiembed.mov/directstream.php?video_id=${imdbID}&s=${seasonNumber}&e=${episodeNumber}">E${formatedEpisodeNumber}. ${episode.name}</a>`;
        }

        episodeContainer.innerHTML = episodesData;
        webSeriesData.appendChild(episodeContainer);
        episodeHighlight();
      }

      // Highlighting Selected Episodes as per url

      let searchParams = new URLSearchParams(window.location.search);
      let season = searchParams.get("season");
      let episode = searchParams.get("episode");

      if (season && episode) {
        document
          .querySelector(`a[cssIdentification="s${season}e${episode}"]`)
          .click();
      } else if (season && !episode) {
        document.querySelector(`a[cssIdentification="s${season}e1"]`).click();
      } else {
        document.querySelector(`a[cssIdentification="s1e1"]`).click();
      }
    }
    printEpisodes();
  } else {
  }

  // pushing data to analytics by gtag

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());

  gtag("config", "G-THTQ9GZQ0J");

  highlightCards();

  // returning false so that anchor tag do not work as link

  return false;
}
