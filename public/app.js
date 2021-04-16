function toCurrency(price) {
  return new Intl.NumberFormat("ru-RU", {
    currency: "USD",
    style: "currency",
  }).format(price);
}

function toDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
}

document.querySelectorAll(".price").forEach((item) => {
  item.textContent = toCurrency(item.textContent);
});

document.querySelectorAll(".date").forEach((item) => {
  item.textContent = toDate(item.textContent);
});

const $basket = document.getElementById("card");
if ($basket) {
  $basket.addEventListener("click", (event) => {
    if (event.target.classList.contains("js-remove")) {
      const { id, csrf } = event.target.dataset;
      fetch("/profile/basket/remove/" + id, {
        method: "DELETE",
        headers: {
          'X-XSRF-TOKEN': csrf
        }
      })
        .then((res) => res.json())
        .then((basket) => {
          const { courses, price } = basket;
          if (courses.length) {
            const $html = courses.map((c) => {
              return `
                <tr>
                    <td>${c.title}</td>
                    <td>${c.count}</td>
                    <td>
                        <button class="btn btn-small js-remove" data-id="${c.id}">Удалить</button>
                    </td>
                </tr>
            `;
            });
            $basket.querySelector("tbody").innerHTML = $html;
            $basket.querySelector(".price").innerText = toCurrency(price);
          } else {
            $basket.innerHTML = "<p>Корзина пуста</p>";
          }
        });
    }
  });
}

const $ratings = document.querySelectorAll('.card-rating')
$ratings.forEach((item) => {
    const {csrf} = item.dataset
    const stars = Array.from(item.querySelectorAll('.star'))
    
    if (item.hasAttribute('view')) {
      const { rating } = item.dataset
      stars.forEach((star, index, array) => {
        if (index < +rating) star.style.backgroundColor = "rgba(255, 255, 0)"
        else star.style.backgroundColor = ""
      })
    }
    else {
      stars.forEach((star, index, array) => {
        star.addEventListener("click", (event) => {
          const inx = array.findIndex((c) => c == event.target);
          let i = 0;
          while (i <= inx) {
            array[i++].style.backgroundColor = "rgba(255, 255, 0)";
            item.setAttribute("data-rating", inx + 1);
          }
          while (i < array.length) {
            array[i++].style.backgroundColor = "";
          }
          setRating(item.dataset.to, inx + 1, csrf);
        });
        star.addEventListener("mouseover", (event) => {
          if (item.dataset && +item.dataset.rating > 0) {
            star.onmouseover = null;
          } else {
            const inx = array.findIndex((c) => c == event.target);
            let i = 0;
            while (i <= inx) {
              array[i++].style.backgroundColor = "rgba(255, 255, 0, 0.5)";
            }
            while (i < array.length) {
              array[i++].style.backgroundColor = "";
            }
          }
        });
        star.addEventListener("mouseout", (event) => {
          if (item.dataset.rating && +item.dataset.rating > 0) {
            item.onmouseout = null;
            const stars = Array.from(item.querySelectorAll(".star"));
            let i = 0;
            while (i <= +item.dataset.rating - 1) {
              stars[i++].style.backgroundColor = "rgba(255, 255, 0)";
            }
            while (i < stars.length) {
              stars[i++].style.backgroundColor = "";
            }
          } else {
            event.target.querySelectorAll(".star").forEach((st) => {
              st.style.backgroundColor = "";
            });
          }
        });
      });
    }
})

function setRating(id, rating, csrf) {
  fetch(`/courses/rating/${id}?rating=${rating}`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=utf-8",
      'X-XSRF-TOKEN': csrf
    },
  });
}

M.Tabs.init(document.querySelector('.tabs'))