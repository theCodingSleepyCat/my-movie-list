const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
console.log(paginator)

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page < numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}




function getMovieByPage(page) {
  //如果filteredMovies是有長度（內容）的: (true)則data使用filteredMovies;(false)不然就使用 movies
  const data = filteredMovies.length ? filteredMovies : movies
  // page 1 -> movie 0 - 11
  // page 2 -> movie 12- 23
  // page 3 -> movie 24- 35
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster" >
          <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
              data-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}" >+</button>
          </div>
        </div>
        </div >
      </div >`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster"
                class="img-fluid">`

  })

}

function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }

  /////localStorge can only store string hance JSON.parse
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  // const movie = movies.find(isMovieIdMatched) 把movies上的每一部電影都跑一次指定的函數

  if (list.some(movie => movie.id === id)) {
    return alert('This movie had been added to your list')
  }



  const movie = movies.find(movie => movie.id === id)
  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  // 如果我點擊的目標不是<a></a>就跳出
  const page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))
})




searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)

  if (!keyword.length) {
    return alert('Please enter a valid string')
  }

  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))

})

//issue:如果直接 movies.push(response.data.results)，那 movies 會變成一個只有 1 個元素的陣列：
// axios.get(INDEX_URL)
//   .then((response) => {
//     movies.push(response.data.results)
//     }
//     console.log(movies)
//     console.log(movies.length) //1

//   })
//   .catch((err) => console.log(err))

//解法一 使用for...of迭代器
// axios.get(INDEX_URL)
//   .then((response) => {
//     for (const movie of response.data.results) {
//       movies.push(movie)
//     }
//     console.log(movies)
//     console.log(movies.length) //80

//   })
//   .catch((err) => console.log(err))

//解法二 展開運算子
axios.get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(filteredMovies.length)
    //拿到資料後會載入第一頁
    renderMovieList(getMovieByPage(1))
    console.log(response.data.results)

  })
  .catch((err) => console.log(err))



