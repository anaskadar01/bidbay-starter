<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const error = ref(false);
const produits = ref([]);
const search = ref("");
const endpoint = "http://localhost:3000";
const header = {
  "Content-Type": "application/json",
};
/**
* Cette fonction récupère les produits depuis le back-end.
* Elle met à jour les valeurs des produits, des messages d'erreur et de chargement.
*
* @returns {Promise<Array>}
*/

async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const res = await fetch(`${endpoint}/api/products/`, { header });
    if (res.ok) {
      const resJson = await res.json();
      const sortedPro = resJson.map((r) => ({
        bids: r.bids,
        category: r.category,
        createdAt: r.createdAt,
        description: r.description,
        endDate: r.endDate,
        id: r.id,
        name: r.name,
        originalPrice: r.originalPrice,
        pictureUrl: r.pictureUrl,
        seller: r.seller,
        sellerId: r.sellerId,
        updatedAt: r.updatedAt,
      }));
      produits.value = sortedPro;
      sortName();
      return sortedPro;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

fetchProducts();

/**
 * return le prix max des enchères
 * @param bids
 * @returns {*|number}
 */
function maxBidPrice(bids) {
  if (bids.length === 0) {
    return 0;
  }
  const maxPrice = bids.reduce((max, bid) => {
    return Math.max(max, bid.price);
  }, bids[0].price);
  return maxPrice;
}

/**
 * donne la date sous le bon format
 * @param d
 * @returns {string}
 */
function goodDate(d) {
  let currentDate = new Date();
  let inputDate = new Date(d);

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

/**
 * filtre les pruduits par leur nom
 * @type {ComputedRef<UnwrapRefSimple<*>[]>}
 */
const filteredProduits = computed(() => {
  const searchTerm = search.value.toLowerCase();
  return produits.value.filter((product) =>
    product.name.toLowerCase().includes(searchTerm),
  );
});

/**
 * tri les produits par le nom
 */
function sortName() {
  produits.value.sort(function (a, b) {
    var btn = (document.getElementById("sort-btn").innerHTML = "Trier par nom");
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
}

/**
 * tri les produits par le prix
 */
function sortPrice() {
  produits.value.sort(function (a, b) {
    var btn = (document.getElementById("sort-btn").innerHTML =
      "Trier par prix");
    const priceA = a.originalPrice;
    const priceB = b.originalPrice;

    if (priceA < priceB) {
      return -1;
    }
    if (priceA > priceB) {
      return 1;
    }
    return 0;
  });
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
              v-model="search"
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            id="sort-btn"
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
              <a
                class="dropdown-item"
                href="#"
                @click="sortName()"
                data-test-sorter-name
                >Nom</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="sortPrice()"
                data-test-sorter-price
                >Prix</a
              >
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
        v-for="product in filteredProduits"
        :key="product.key"
        data-test-product
      >
        <div class="card">
          <RouterLink
            :to="{ name: 'Product', params: { productId: product.id } }"
          >
            <img
              :src="product.pictureUrl"
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
                :to="{ name: 'User', params: { userId: product.sellerId } }"
              >
                {{ product.seller.username }}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              {{ goodDate(product.endDate) }}
            </p>
            <p v-if="product.bids[0]" data-test-product-price>
              Prix actuel : {{ maxBidPrice(product.bids) }} €
            </p>
            <p v-else data-test-product-price>
              Prix de départ : {{ product.originalPrice }} €
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
