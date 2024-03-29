<script setup>
import {ref, computed} from "vue";

const endpoint = 'http://localhost:3000';
const header = {
  'Content-Type': "application/json",
}
const loading = ref(false);
const error = ref(false);
let listProduct = ref([]);
async function fetchProducts() {
  const res = await fetch(`${endpoint}/api/products`, {header})
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
      endDate:r.endDate,// goodDate(r.endDate),


    }))

  }
  throw new Error('KO')


  loading.value = true;
  error.value = false;

  try {
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}



function goodDate(date){
  let dateCurrent = new Date();
  if(dateCurrent.toISOString() > date){
    return "Terminé";
  }
  else{
    return 'En cours jusqu\'au '+ date.split('T')[0];
  }
}

fetchProducts().then((r) => listProduct.value = r);
console.log(listProduct);
let bouton = document.querySelector("#buttonTri");


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
              <a class="dropdown-item" href="#"> Nom </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row">

      <div class="col-md-4 mb-4" v-for="product in listProduct" :key="product.key" data-test-product>
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: 'TODO' } }">
            <img
                :src="product.pictureUrl" alt="img"
                data-test-product-picture
                class="card-img-top"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                  data-test-product-name
                  :to="{ name: 'Product', params: { productId: 'TODO' } }"
              >
                {{product.name}}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{product.description}}
            </p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                  data-test-product-seller
                  :to="{ name: 'User', params: { userId: 'TODO' } }"
              >
                {{product.username}}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              En cours jusqu'au {{goodDate( product.endDate) }}
            </p>
            <p class="card-text" data-test-product-price>Prix actuel : {{product.originalPrice}} €</p>
          </div>
        </div>
      </div>



    </div>
  </div>
</template>
