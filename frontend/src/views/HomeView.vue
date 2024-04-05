<script setup>
import { ref, computed } from "vue";

const endpoint = "http://localhost:3000";
const header = {
  "Content-Type": "application/json",
};
const loading = ref(false);
const error = ref(false);
const filterName = ref("");
let listProduct = ref([]);
async function fetchProducts() {
  try {
    const res = await fetch(`${endpoint}/api/products`, { header });
    if (res.ok) {
      const resJson = await res.json();
      console.log(resJson);
      return resJson.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        category: r.category,
        originalPrice: r.originalPrice,
        pictureUrl: r.pictureUrl,
        username: r.seller.username,
        endDate: r.endDate,
        bids: maxBidPrice(r.bids),
      }));
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function goodDate(date) {
  let currentDate = new Date();
  let inputDate = new Date(date);

  if (currentDate > inputDate) {
    return "Terminé";
  } else {
    let day = inputDate.getDate();
    let month = inputDate.getMonth() + 1;
    let year = inputDate.getFullYear();
    let formattedDate = `${day < 10 ? "0" : ""}${day}/${month < 10 ? "0" : ""}${month}/${year}`;

    return "En cours jusqu'au " + formattedDate;
  }
}

fetchProducts().then((r) => (listProduct.value = r));
//console.log(listProduct);

function sortName() {
  let button = document.getElementById("buttonTri");
  listProduct.value.sort(function (a, b) {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    button.innerHTML = "Trier par nom";
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}

function sortPrice() {
  let button = document.getElementById("buttonTri");
  listProduct.value.sort(function (a, b) {
    const priceA = a.originalPrice;
    const priceB = b.originalPrice;
    button.innerHTML = "Trier par prix";
    if (priceA < priceB) {
      return -1;
    }
    if (priceA > priceB) {
      return 1;
    }
    return 0;
  });
}

function maxBidPrice(bids) {
  if (bids.length === 0) {
    return 0;
  }
  const maxPrice = bids.reduce((max, bid) => {
    return Math.max(max, bid.price);
  }, bids[0].price);
  return maxPrice;
}
</script>
<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input
              id="filterName"
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
              v-model="filterName"
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            id="buttonTri"
            type="button"
            class="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-test-sorter
          >
            Trier par nom
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" @click="sortName" href="#"> Nom </a>
            </li>
            <li>
              <a
                class="dropdown-item"
                @click="sortPrice"
                href="#"
                data-test-sorter-price
              >
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div
      v-if="error"
      class="alert alert-danger mt-4"
      role="alert"
      data-test-error
    >
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row">
      <div
        class="col-md-4 mb-4"
        v-for="(product, i) in listProduct"
        :key="product.key"
        data-test-product
      >
        <div class="card">
          <RouterLink
            :to="{ name: 'Product', params: { productId: product.id } }"
          >
            <img
              :src="product.pictureUrl"
              alt="img"
              data-test-product-picture
              class="card-img-top"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                data-test-product-name
                :to="{ name: 'Product', params: { productId: product.id } }"
              >
                {{ product.name }}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{ product.description }}
            </p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: 'TODO' } }"
              >
                {{ product.username }}
              </RouterLink>
            </p>

              <p class="card-text" data-test-product-date>
                En cours jusqu'au {{ goodDate(product.endDate) }}
              </p>
              <p v-if="product.bids" data-test-product-price>
                Prix actuel : {{ product.originalPrice }} €
              </p>
              <p v-else data-test-product-price>
                Prix initial : {{ product.originalPrice }} €
              </p>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
