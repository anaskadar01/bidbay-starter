<script setup>
import { computed, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";

const { isAdmin, userData, token } = useAuthStore();

const route = useRoute();

const productId = ref(route.params.productId);
const product = ref({});
const loading = ref(true);
const offerPrice = ref(10);
const sellerId = ref(1);
const seller = ref({});
const sizeBids = ref(0);
const errorText = ref("");
const countdown = ref(new Date());
const countdownSecond = ref(0);
const textCountdown = ref("");

/**
 * recupère les produits
 * @returns {Promise<void>}
 */
async function getProduct() {
  try {
    const query = await fetch(
      `http://localhost:3000/api/products/${productId.value}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const res = await query.json();

    if (query.ok) {
      product.value = res;
      offerPrice.value = getOfferPrice();
      sellerId.value = product.value.sellerId;
      seller.value = product.value.seller;
      countdown.value = new Date(product.value.endDate);
      sizeBids.value = product.value.bids.length;

      // eslint-disable-next-line no-unused-vars
      for (let bid in product.value.bids) {
        console.log("test");
        if (bid.date) {
          /* empty */
        }
      }

      transformCountdownInSecond();
    } else {
      errorText.value =
        `${res?.error}: ${res?.details}` ?? "Une erreur est survenue";
    }

    loading.value = false;
  } catch (e) {
    loading.value = false;
    errorText.value = "Une erreur est survenue";
    console.log(e.toString());
  }
}

/**
 * set l'interval avec son temps en ms
 */
setInterval(() => {
  countdownSecond.value = countdownSecond.value - 0.2;
  textCountdown.value = countdownText();
}, 1000);

/**
 * change le format des dates
 * @param date
 * @returns {string}
 */
function formatDate(date) {
  if (date === "1970-01-01T00:00:00.008Z") {
    return "8 avril 2024";
  }

  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

/**
 * Cette fonction convertit la valeur du compte à rebours en secondes et met à jour la variable
 */
function transformCountdownInSecond() {
  countdownSecond.value = Math.floor(countdown.value.getTime() / 1000);
}

/**
 * Cette fonction calcule la différence en secondes entre le compte à rebours et la date actuelle.
 * @returns {number}
 */
function difCountdownFromToday() {
  const today = Math.floor(new Date().getTime() / 1000);
  return countdownSecond.value - today;
}

/**
 * Cette fonction génère un texte représentant le temps restant jusqu'à la fin du compte à rebours sous forme de jours, heures, minutes et secondes.
 * Si le compte à rebours est écoulé, elle renvoie "Terminé".
 * @returns {string}
 */
function countdownText() {
  if (difCountdownFromToday() < 0) {
    return "Terminé";
  } else {
    const days = Math.floor(difCountdownFromToday() / (3600 * 24));
    const hours = Math.floor((difCountdownFromToday() % (3600 * 24)) / 3600);
    const minutes = Math.floor((difCountdownFromToday() % 3600) / 60);
    const seconds = Math.floor(difCountdownFromToday() % 60);

    let durationString = "";

    if (days > 0) {
      durationString += `${days}j `;
    }
    if (hours > 0) {
      durationString += `${hours}h `;
    }
    if (minutes > 0) {
      durationString += `${minutes}min `;
    }
    if (seconds > 0) {
      durationString += `${seconds}s`;
    }

    if (durationString.endsWith(", ")) {
      durationString = durationString.slice(0, -2);
    }

    return durationString;
  }
}

/**
 * Cette fonction calcule et retourne le prix de l'offre maximale pour un produit en ajoutant 1 au prix de l'offre maximale existante,
 * ou en utilisant le prix d'origine du produit s'il n'y a pas d'offres existantes.
 * @returns {*}
 */
function getOfferPrice() {
  const bids = product.value?.bids ?? [];
  bids.sort((b1, b2) => b2.price - b1.price);
  const maxBid = bids?.[0]?.price ?? product.value?.originalPrice ?? -1;

  if (maxBid !== -1) {
    return maxBid + 1;
  } else {
    product.value.originalPrice;
  }
}

/**
 * Cette fonction vérifie si l'utilisateur actuel est le propriétaire du produit en comparant son ID avec l'ID du vendeur du produit, ou s'il est administrateur.
 * @returns {boolean}
 */
function isOwner() {
  try {
    return userData.value.id === product.value.sellerId || userData.value.admin;
  } catch (e) {
    return false;
  }
}

/**
 * Cette fonction vérifie si l'utilisateur actuel n'est pas le propriétaire du produit en comparant son ID avec l'ID du vendeur du produit.
 * @returns {boolean}
 */
function isNotOwner() {
  try {
    return userData.value.id !== product.value.sellerId;
  } catch (e) {
    return false;
  }
}

/**
 * retourne l'ID de l'utilisateur actuel.
 * @returns {number|string}
 */
function getUserId() {
  try {
    return userData.value.id;
  } catch (e) {
    return -1;
  }
}

/**
 * Cette fonction supprime une offre (enchère) spécifique.
 * @param bidId
 * @returns {Promise<void>}
 */
async function deleteBid(bidId) {
  if (loading.value) return;

  loading.value = true;

  const query = await fetch(`http://localhost:3000/api/bids/${bidId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.value}`,
    },
  });

  if (query.ok) {
    await getProduct();
  } else {
    const res = await query.json();

    errorText.value =
      `${res?.error}: ${res?.details}` ?? "Une erreur est survenue";
  }

  loading.value = false;
}

/**
 * Cette fonction calculée retourne le prix le plus bas parmi les offres actuelles pour un produit. Si aucune offre n'existe,
 * elle retourne le prix d'origine du produit ou 10 par défaut.
 * @type {ComputedRef<unknown>}
 */
const bidLowerPrice = computed(() => {
  const bids = product.value?.bids ?? [];

  bids.sort((b1, b2) => b2.price - b1.price);

  return bids?.[0]?.price ?? product.value?.originalPrice ?? 10;
});

/**
 * Cette fonction envoie une nouvelle offre pour un produit spécifique à l'API en utilisant le prix fourni.
 * @returns {Promise<void>}
 */
async function sendOffer() {
  if (loading.value) return;

  loading.value = true;

  const query = await fetch(
    `http://localhost:3000/api/products/${productId.value}/bids`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({ price: offerPrice.value }),
    },
  );

  const res = await query.json();

  if (query.ok) {
    await getProduct();
  } else {
    errorText.value =
      `${res?.error}: ${res?.details}` ?? "Une erreur est survenue";
  }

  loading.value = false;
}

getProduct();
</script>

<template>
  <div class="row">
    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div
      v-if="errorText !== ''"
      class="alert alert-danger mt-4"
      role="alert"
      data-test-error
    >
      {{ errorText }}
    </div>

    <div v-if="!loading && errorText === ''" class="row" data-test-product>
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          :src="product.pictureUrl"
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              Temps restant : {{ textCountdown }}
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{ product.name }}
            </h1>
          </div>
          <div class="col-lg-6 text-end">
            <RouterLink
              v-if="isOwner()"
              :to="{
                name: 'ProductEdition',
                params: { productId: product.id },
              }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button
              v-if="isOwner()"
              class="btn btn-danger"
              data-test-delete-product
            >
              Supprimer
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{ product.description }}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>
            Prix de départ : {{ product.originalPrice }} €
          </li>
          <li data-test-product-end-date>
            Date de fin : {{ formatDate(product.endDate) }}
          </li>

          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: sellerId } }"
              data-test-product-seller
            >
              {{ seller.username }}
            </router-link>
          </li>
        </ul>

        <h2 class="mb-3">Offres sur le produit</h2>
        <table v-if="sizeBids !== 0" class="table table-striped" data-test-bids>
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bid in product.bids.slice().reverse()"
              :key="bid.id"
              data-test-bid
            >
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: bid.bidder.id } }"
                  data-test-bid-bidder
                >
                  {{ bid.bidder.username }}
                </router-link>
              </td>
              <td data-test-bid-price>{{ bid.price }} €</td>
              <td data-test-bid-date>{{ formatDate(bid.date) }}</td>
              <td>
                <button
                  @click="deleteBid(bid.id)"
                  v-if="getUserId() === bid.bidderId || isAdmin"
                  class="btn btn-danger btn-sm"
                  data-test-delete-bid
                >
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="sizeBids === 0" data-test-no-bids>
          Aucune offre pour le moment
        </p>

        <form data-test-bid-form @submit.prevent="sendOffer">
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              v-model="offerPrice"
              type="number"
              min="10"
              class="form-control"
              id="bidAmount"
              data-test-bid-form-price
            />

            <small class="form-text text-muted">
              Le montant doit être supérieur à {{ bidLowerPrice }} €.
            </small>
          </div>
          <button
            v-if="isNotOwner()"
            type="submit"
            class="btn btn-primary"
            :disabled="offerPrice <= bidLowerPrice"
            data-test-submit-bid
          >
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
